import { Request, Response } from "express";
import axios from "axios";
import { z } from "zod";
import { logCRMContact, logLeadIntake, logClientROI, logSupportTicket, logErrorFallback } from "./airtableIntegrations";

// Validation schemas
const leadValidationSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  company: z.string().optional(),
  platform: z.string().optional(),
  campaignName: z.string().optional()
});

const bookingFormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  preferredTime: z.string().optional()
});

// 031 - Track Lead Source from Phantombuster
export async function tagLeadWithPhantomSource(req: Request, res: Response) {
  try {
    const { leadId, platform, campaignName } = req.body;

    if (!leadId) {
      return res.status(400).json({ error: "Lead ID is required" });
    }

    if (!process.env.HUBSPOT_API_KEY) {
      return res.status(500).json({
        error: "HubSpot API key required",
        message: "Please provide HUBSPOT_API_KEY to update lead sources"
      });
    }

    const updateData = {
      lead_source: "phantombuster",
      source_platform: platform || "unknown",
      phantombuster_campaign: campaignName || "unspecified"
    };

    const response = await axios.patch(
      `https://api.hubapi.com/crm/v3/objects/contacts/${leadId}`,
      { properties: updateData },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      message: "Lead tagged with Phantombuster source",
      leadId,
      updatedFields: updateData,
      hubspotResponse: response.data
    });

  } catch (error: any) {
    console.error("Failed to tag lead with Phantom source:", error);
    res.status(500).json({
      error: "Failed to update lead source",
      details: error.response?.data || error.message
    });
  }
}

// 032 - Validate Lead Before Processing
export function validateLeadPayload(lead: any): boolean {
  try {
    leadValidationSchema.parse(lead);
    return true;
  } catch (error) {
    return false;
  }
}

export async function validateLeadAPI(req: Request, res: Response) {
  try {
    const lead = req.body;
    const isValid = validateLeadPayload(lead);
    
    if (isValid) {
      res.json({
        success: true,
        message: "Lead payload is valid",
        lead: lead
      });
    } else {
      const validation = leadValidationSchema.safeParse(lead);
      res.status(400).json({
        success: false,
        message: "Lead payload validation failed",
        errors: validation.error?.issues || "Invalid format"
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: "Validation error",
      details: error.message
    });
  }
}

// 033 - Push to ROI Calculator Base
export async function logToROICalculator(req: Request, res: Response) {
  try {
    const { spend, estimatedReturn, industry, channel, clientName } = req.body;

    if (!spend || !estimatedReturn) {
      return res.status(400).json({
        error: "Spend and estimated return are required"
      });
    }

    const roiData = {
      clientName: clientName || "Unknown Client",
      monthlySpend: parseFloat(spend),
      monthlySavings: parseFloat(estimatedReturn),
      roiPercentage: Math.round(((parseFloat(estimatedReturn) - parseFloat(spend)) / parseFloat(spend)) * 100),
      timestamp: new Date().toISOString(),
      calculationDetails: `Industry: ${industry || 'N/A'}, Channel: ${channel || 'N/A'}`
    };

    await logClientROI(roiData);

    res.json({
      success: true,
      message: "ROI data logged successfully",
      roiData
    });

  } catch (error: any) {
    console.error("Failed to log ROI data:", error);
    res.status(500).json({
      error: "Failed to log ROI data",
      details: error.message
    });
  }
}

// 037 - Calculate Projected ROI Delta
export function calculateROIDelta(spend: number, returnEstimate: number) {
  const delta = returnEstimate - spend;
  const percent = Math.round((delta / spend) * 100);
  return { delta, percent };
}

export async function calculateROIAPI(req: Request, res: Response) {
  try {
    const { spend, returnEstimate } = req.body;

    if (!spend || !returnEstimate) {
      return res.status(400).json({
        error: "Spend and return estimate are required"
      });
    }

    const result = calculateROIDelta(parseFloat(spend), parseFloat(returnEstimate));

    res.json({
      success: true,
      message: "ROI delta calculated",
      spend: parseFloat(spend),
      returnEstimate: parseFloat(returnEstimate),
      delta: result.delta,
      percent: result.percent,
      roi_status: result.percent > 200 ? "excellent" : result.percent > 100 ? "good" : "needs_improvement"
    });

  } catch (error: any) {
    res.status(500).json({
      error: "ROI calculation failed",
      details: error.message
    });
  }
}

// 039 - Auto-assign Task Based on Lead Score
export async function assignTaskByLeadScore(req: Request, res: Response) {
  try {
    const { leadId, score, contactEmail } = req.body;

    if (!leadId || score === undefined) {
      return res.status(400).json({
        error: "Lead ID and score are required"
      });
    }

    let taskCreated = false;
    let taskDetails = null;

    if (score > 75) {
      if (!process.env.HUBSPOT_API_KEY) {
        return res.status(500).json({
          error: "HubSpot API key required for task creation"
        });
      }

      const followUpDate = new Date();
      followUpDate.setDate(followUpDate.getDate() + 1);

      try {
        const taskResponse = await axios.post(
          'https://api.hubapi.com/crm/v3/objects/tasks',
          {
            properties: {
              hs_task_subject: '🔥 High-value lead – prioritize',
              hs_task_body: `Lead score: ${score}/100. This is a high-priority lead that requires immediate attention.`,
              hs_task_status: 'NOT_STARTED',
              hs_task_priority: 'HIGH',
              hs_timestamp: followUpDate.getTime()
            },
            associations: [
              {
                to: { id: leadId },
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

        taskCreated = true;
        taskDetails = taskResponse.data;
      } catch (error: any) {
        console.warn("Failed to create HubSpot task:", error.message);
      }
    }

    res.json({
      success: true,
      message: "Lead score processed",
      leadId,
      score,
      taskCreated,
      taskDetails,
      recommendation: score > 75 ? "High priority - immediate follow-up" : 
                     score > 50 ? "Medium priority - follow-up within 2 days" : 
                     "Low priority - standard nurture sequence"
    });

  } catch (error: any) {
    console.error("Failed to process lead score:", error);
    res.status(500).json({
      error: "Failed to process lead score",
      details: error.message
    });
  }
}

// 041 - Convert Booking Form to CRM Lead
export async function handleBookingFormSubmission(req: Request, res: Response) {
  try {
    const formData = bookingFormSchema.parse(req.body);

    const contact = {
      contactName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone || "",
      company: formData.company || "",
      source: "Booking Form",
      status: "New Lead",
      timestamp: new Date().toISOString()
    };

    // Log to CRM Contacts table
    await logCRMContact(contact);

    // Log to Lead Intake table
    await logLeadIntake({
      leadName: contact.contactName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      source: contact.source,
      status: contact.status,
      timestamp: contact.timestamp
    });

    // Push to HubSpot if configured
    let hubspotContactId = null;
    if (process.env.HUBSPOT_API_KEY) {
      try {
        const hubspotResponse = await axios.post(
          'https://api.hubapi.com/crm/v3/objects/contacts',
          {
            properties: {
              email: formData.email,
              firstname: formData.firstName,
              lastname: formData.lastName,
              phone: formData.phone,
              company: formData.company,
              lead_source: 'booking_form',
              hs_lead_status: 'NEW'
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        hubspotContactId = hubspotResponse.data.id;
      } catch (error: any) {
        console.warn("HubSpot contact creation failed:", error.message);
      }
    }

    res.json({
      success: true,
      message: "Booking form processed successfully",
      contact,
      hubspotContactId,
      automationsCompleted: {
        crmLogging: true,
        leadIntakeLogging: true,
        hubspotSync: !!hubspotContactId
      }
    });

  } catch (error: any) {
    console.error("Booking form processing failed:", error);
    res.status(500).json({
      error: "Failed to process booking form",
      details: error.message
    });
  }
}

// 042 - Log Error to "Ops Alerts" Airtable Base
export async function logOpsError(req: Request, res: Response) {
  try {
    const { message, stack, context, severity } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Error message is required" });
    }

    const errorData = {
      errorType: "System Error",
      source: context?.source || "Unknown",
      destination: "Error Log",
      status: "error",
      timestamp: new Date().toISOString(),
      recordCount: 1
    };

    await logErrorFallback(errorData);

    res.json({
      success: true,
      message: "Error logged to ops alerts",
      errorData
    });

  } catch (error: any) {
    console.error("Failed to log ops error:", error);
    res.status(500).json({
      error: "Failed to log error",
      details: error.message
    });
  }
}

// 046 - Process LinkedIn Scraped Lead (Phantombuster)
export async function processLinkedInLead(req: Request, res: Response) {
  try {
    const lead = req.body;

    if (!validateLeadPayload(lead)) {
      return res.status(400).json({
        error: "Invalid lead payload",
        message: "Lead must include email, firstName, and lastName"
      });
    }

    // This integrates with the existing Phantombuster webhook system
    const leadData = {
      leadName: `${lead.firstName} ${lead.lastName}`,
      email: lead.email,
      phone: lead.phone || "",
      company: lead.company || "",
      source: "LinkedIn via Phantombuster",
      status: "New Lead",
      timestamp: new Date().toISOString()
    };

    await logLeadIntake(leadData);
    await logCRMContact({
      contactName: leadData.leadName,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      source: leadData.source,
      status: leadData.status,
      timestamp: leadData.timestamp
    });

    res.json({
      success: true,
      message: "LinkedIn lead processed successfully",
      lead: leadData,
      automationsCompleted: {
        validation: true,
        leadIntakeLogging: true,
        crmSync: true
      }
    });

  } catch (error: any) {
    console.error("LinkedIn lead processing failed:", error);
    res.status(500).json({
      error: "Failed to process LinkedIn lead",
      details: error.message
    });
  }
}

// 049 - Assign Sales Rep by Region
export function assignRepByRegion(region: string): string {
  const repMap: Record<string, string> = {
    West: "Brandon",
    East: "Jasmine",
    Central: "Luis",
    North: "Sarah",
    South: "Michael"
  };
  return repMap[region] || "Default Rep";
}

export async function assignRepAPI(req: Request, res: Response) {
  try {
    const { region, contactId } = req.body;

    if (!region) {
      return res.status(400).json({ error: "Region is required" });
    }

    const assignedRep = assignRepByRegion(region);

    res.json({
      success: true,
      message: "Sales rep assigned",
      region,
      assignedRep,
      contactId,
      availableRegions: ["West", "East", "Central", "North", "South"]
    });

  } catch (error: any) {
    res.status(500).json({
      error: "Failed to assign sales rep",
      details: error.message
    });
  }
}

// 050 - Detect Unsupported Characters (Emoji Cleanup)
export function sanitizeForAirtable(text: string): string {
  return text
    .replace(/[\u{1F600}-\u{1F64F}]/gu, "") // Remove emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, "") // Remove symbols
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, "") // Remove transport symbols
    .replace(/[\u{2600}-\u{26FF}]/gu, "") // Remove misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, "") // Remove dingbats
    .trim();
}

export async function sanitizeTextAPI(req: Request, res: Response) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const sanitized = sanitizeForAirtable(text);

    res.json({
      success: true,
      message: "Text sanitized for Airtable",
      original: text,
      sanitized,
      charactersRemoved: text.length - sanitized.length
    });

  } catch (error: any) {
    res.status(500).json({
      error: "Text sanitization failed",
      details: error.message
    });
  }
}