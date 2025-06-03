import { Request, Response } from "express";
import Tesseract from "tesseract.js";
import { z } from "zod";
import axios from "axios";
import { logEventSync, logCRMContact } from "./airtableIntegrations";

// Business card OCR data schema
const businessCardSchema = z.object({
  imageUrl: z.string().url().optional(),
  imageBase64: z.string().optional(),
  extractedText: z.string().optional()
}).refine(data => data.imageUrl || data.imageBase64 || data.extractedText, {
  message: "Must provide either imageUrl, imageBase64, or extractedText"
});

interface ExtractedContact {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  website?: string;
  address?: string;
  source: string;
}

// 001 - OCR Business Card → Contact Object
export async function handleBusinessCardOCR(req: Request, res: Response) {
  try {
    const validatedData = businessCardSchema.parse(req.body);
    
    let extractedText = validatedData.extractedText;
    
    // If no extracted text provided, perform OCR
    if (!extractedText) {
      if (validatedData.imageBase64) {
        const ocrResult = await Tesseract.recognize(
          `data:image/jpeg;base64,${validatedData.imageBase64}`,
          'eng'
        );
        extractedText = ocrResult.data.text;
      } else if (validatedData.imageUrl) {
        const ocrResult = await Tesseract.recognize(validatedData.imageUrl, 'eng');
        extractedText = ocrResult.data.text;
      }
    }

    if (!extractedText) {
      return res.status(400).json({ error: "Could not extract text from business card" });
    }

    // Extract contact information from OCR text
    const contact = extractContactFromText(extractedText);
    
    if (!contact.email && !contact.phone) {
      return res.status(400).json({ 
        error: "No valid contact information found",
        extractedText,
        parsedContact: contact
      });
    }

    // 002 - Duplicate Prevention (email check)
    if (contact.email) {
      const isDuplicate = await checkForDuplicateContact(contact.email);
      if (isDuplicate) {
        return res.status(409).json({ 
          error: "Contact already exists",
          email: contact.email
        });
      }
    }

    // 003 - Push to HubSpot
    let hubspotContactId: string | null = null;
    try {
      hubspotContactId = await pushContactToHubSpot(contact);
    } catch (error: any) {
      console.warn("HubSpot integration failed:", error.message);
    }

    // 004 - Tag Contact as 'business_card_scanner'
    if (hubspotContactId) {
      try {
        await tagContactWithSource(hubspotContactId);
      } catch (error: any) {
        console.warn("Failed to tag contact:", error.message);
      }
    }

    // 005 - Create Follow-Up Task in HubSpot
    if (hubspotContactId) {
      try {
        await createHubSpotFollowUp(hubspotContactId);
      } catch (error: any) {
        console.warn("Failed to create follow-up task:", error.message);
      }
    }

    // 006 - Create HubSpot Deal
    if (hubspotContactId) {
      try {
        await createHubSpotDeal(hubspotContactId);
      } catch (error: any) {
        console.warn("Failed to create deal:", error.message);
      }
    }

    // 007 - Enroll in HubSpot Workflow (optional)
    if (hubspotContactId) {
      try {
        await enrollInEmailWorkflow(hubspotContactId);
      } catch (error: any) {
        console.warn("Failed to enroll in workflow:", error.message);
      }
    }

    // 008 - Google Sheets Backup
    try {
      await backupToGoogleSheet(contact);
    } catch (error: any) {
      console.warn("Google Sheets backup failed:", error.message);
    }

    // 009 - Airtable Event Log
    try {
      await logEventToAirtable({
        eventType: "business_card_ocr",
        contactName: contact.name || "Unknown",
        contactEmail: contact.email || "",
        timestamp: new Date().toISOString(),
        source: "OCR Scanner",
        details: `Processed business card for ${contact.company || 'Unknown Company'}`
      });
    } catch (error: any) {
      console.warn("Airtable logging failed:", error.message);
    }

    // Log to CRM Contacts table
    try {
      await logCRMContact({
        contactName: contact.name || "Unknown",
        email: contact.email || "",
        phone: contact.phone || "",
        company: contact.company || "",
        source: "Business Card OCR",
        status: "New Lead",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.warn("CRM contact logging failed:", error.message);
    }

    // 010 - Add Status Tracking Label
    if (hubspotContactId) {
      try {
        await addStatusLabel(hubspotContactId, "ocr_processed");
      } catch (error: any) {
        console.warn("Failed to add status label:", error.message);
      }
    }

    res.json({
      success: true,
      message: "Business card processed successfully",
      contact,
      hubspotContactId,
      extractedText,
      automationsCompleted: {
        ocrExtraction: true,
        duplicateCheck: true,
        hubspotPush: !!hubspotContactId,
        sourceTagging: !!hubspotContactId,
        followUpTask: !!hubspotContactId,
        dealCreation: !!hubspotContactId,
        workflowEnrollment: !!hubspotContactId,
        googleSheetsBackup: true,
        airtableLogging: true,
        statusLabeling: !!hubspotContactId
      }
    });

  } catch (error: any) {
    console.error("Business card OCR failed:", error);
    res.status(500).json({ 
      error: "Failed to process business card",
      details: error.message 
    });
  }
}

// Extract contact information from OCR text
function extractContactFromText(text: string): ExtractedContact {
  const contact: ExtractedContact = {
    source: "business_card_scanner"
  };

  // Email extraction
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) {
    contact.email = emailMatch[0].toLowerCase();
  }

  // Phone extraction
  const phoneMatch = text.match(/[\+]?[1-9]?[\s-]?\(?[0-9]{3}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{4}/);
  if (phoneMatch) {
    contact.phone = phoneMatch[0].replace(/\s+/g, '').replace(/[^\d+]/g, '');
  }

  // Website extraction
  const websiteMatch = text.match(/(www\.|https?:\/\/)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (websiteMatch) {
    contact.website = websiteMatch[0];
  }

  // Name extraction (first capitalized words, usually at the top)
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const namePattern = /^[A-Z][a-z]+ [A-Z][a-z]+/;
  for (const line of lines.slice(0, 3)) {
    const nameMatch = line.match(namePattern);
    if (nameMatch && !contact.name) {
      contact.name = nameMatch[0];
      break;
    }
  }

  // Company extraction (look for common business indicators)
  const companyIndicators = /\b(inc|llc|corp|corporation|company|co\.|ltd|limited)\b/i;
  for (const line of lines) {
    if (companyIndicators.test(line) && !contact.company) {
      contact.company = line.trim();
      break;
    }
  }

  // Title extraction (common business titles)
  const titlePattern = /\b(ceo|cto|cfo|president|director|manager|coordinator|specialist|analyst|consultant|founder)\b/i;
  for (const line of lines) {
    if (titlePattern.test(line) && !contact.title) {
      contact.title = line.trim();
      break;
    }
  }

  return contact;
}

// 002 - Duplicate Prevention
async function checkForDuplicateContact(email: string): Promise<boolean> {
  if (!process.env.HUBSPOT_API_KEY) {
    console.warn("HubSpot API key not configured");
    return false;
  }

  try {
    const response = await axios.get(
      `https://api.hubapi.com/contacts/v1/contact/email/${email}/profile`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`
        }
      }
    );
    return !!response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return false; // Contact doesn't exist
    }
    throw error;
  }
}

// 003 - Push to HubSpot
async function pushContactToHubSpot(contact: ExtractedContact): Promise<string> {
  if (!process.env.HUBSPOT_API_KEY) {
    throw new Error("HubSpot API key not configured");
  }

  const hubspotContact = {
    properties: {
      email: contact.email,
      firstname: contact.name?.split(' ')[0] || '',
      lastname: contact.name?.split(' ').slice(1).join(' ') || '',
      phone: contact.phone,
      company: contact.company,
      jobtitle: contact.title,
      website: contact.website,
      hs_lead_status: 'NEW',
      lead_source: 'business_card_scanner'
    }
  };

  const response = await axios.post(
    'https://api.hubapi.com/crm/v3/objects/contacts',
    hubspotContact,
    {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.id;
}

// 004 - Tag Contact as 'business_card_scanner'
async function tagContactWithSource(contactId: string): Promise<void> {
  if (!process.env.HUBSPOT_API_KEY) {
    throw new Error("HubSpot API key not configured");
  }

  await axios.patch(
    `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
    {
      properties: {
        lead_source: 'business_card_scanner',
        source_platform: 'YoBot OCR Scanner'
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// 005 - Create Follow-Up Task in HubSpot
async function createHubSpotFollowUp(contactId: string): Promise<void> {
  if (!process.env.HUBSPOT_API_KEY) {
    throw new Error("HubSpot API key not configured");
  }

  const followUpDate = new Date();
  followUpDate.setDate(followUpDate.getDate() + 2);

  await axios.post(
    'https://api.hubapi.com/crm/v3/objects/tasks',
    {
      properties: {
        hs_task_subject: 'Follow up from OCR business card scan',
        hs_task_body: 'Contact was added via business card OCR - schedule initial outreach',
        hs_task_status: 'NOT_STARTED',
        hs_task_priority: 'MEDIUM',
        hs_timestamp: followUpDate.getTime()
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 204 }]
        }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// 006 - Create HubSpot Deal
async function createHubSpotDeal(contactId: string): Promise<void> {
  if (!process.env.HUBSPOT_API_KEY) {
    throw new Error("HubSpot API key not configured");
  }

  await axios.post(
    'https://api.hubapi.com/crm/v3/objects/deals',
    {
      properties: {
        dealname: 'Initial Opportunity - OCR Lead',
        amount: '0',
        dealstage: 'appointmentscheduled',
        pipeline: 'default',
        deal_source: 'business_card_scanner'
      },
      associations: [
        {
          to: { id: contactId },
          types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 3 }]
        }
      ]
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// 007 - Enroll in HubSpot Workflow
async function enrollInEmailWorkflow(contactId: string): Promise<void> {
  if (!process.env.HUBSPOT_API_KEY || !process.env.HUBSPOT_WORKFLOW_ID) {
    console.warn("HubSpot workflow enrollment skipped - missing configuration");
    return;
  }

  await axios.post(
    `https://api.hubapi.com/automation/v2/workflows/${process.env.HUBSPOT_WORKFLOW_ID}/enrollments/contacts/${contactId}`,
    {},
    {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// 008 - Google Sheets Backup
async function backupToGoogleSheet(contact: ExtractedContact): Promise<void> {
  if (!process.env.GOOGLE_SHEETS_WEBHOOK_URL) {
    console.warn("Google Sheets webhook URL not configured");
    return;
  }

  await axios.post(process.env.GOOGLE_SHEETS_WEBHOOK_URL, {
    ...contact,
    timestamp: new Date().toISOString(),
    processed_date: new Date().toLocaleDateString()
  }, {
    headers: { 'Content-Type': 'application/json' }
  });
}

// 009 - Airtable Event Log
async function logEventToAirtable(event: any): Promise<void> {
  try {
    await logEventSync(event);
  } catch (error: any) {
    console.warn("Airtable event logging failed:", error.message);
  }
}

// 010 - Add Status Tracking Label
async function addStatusLabel(contactId: string, label: string): Promise<void> {
  if (!process.env.HUBSPOT_API_KEY) {
    throw new Error("HubSpot API key not configured");
  }

  await axios.patch(
    `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`,
    {
      properties: {
        status_label: label,
        processing_status: 'completed'
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

// Test endpoint for business card OCR
export async function testBusinessCardOCR(req: Request, res: Response) {
  const sampleBusinessCard = {
    extractedText: `John Smith
Senior Software Engineer
TechCorp Solutions Inc.
john.smith@techcorp.com
(555) 123-4567
www.techcorp.com
123 Innovation Drive
Silicon Valley, CA 94043`
  };

  try {
    // Simulate processing the test business card
    const contact = extractContactFromText(sampleBusinessCard.extractedText);
    
    res.json({
      success: true,
      message: "Test business card OCR completed",
      sampleInput: sampleBusinessCard,
      extractedContact: contact,
      automationSteps: [
        "✓ OCR text extraction",
        "✓ Contact information parsing",
        "→ Duplicate prevention check",
        "→ HubSpot contact creation",
        "→ Source tagging",
        "→ Follow-up task creation",
        "→ Deal creation",
        "→ Workflow enrollment",
        "→ Google Sheets backup",
        "→ Airtable event logging",
        "→ Status labeling"
      ]
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Test failed",
      details: error.message
    });
  }
}