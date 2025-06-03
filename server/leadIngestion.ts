import { Request, Response } from "express";
import { z } from "zod";
import { storage } from "./storage";
import { insertPhantombusterLeadSchema } from "@shared/schema";
import axios from "axios";

// Webhook payload validation schema
const leadIngestionSchema = z.object({
  lead_owner: z.string(),
  source: z.string().default("Phantombuster"),
  campaign_id: z.string().optional(),
  platform: z.string(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional(),
  title: z.string().optional(),
  location: z.string().optional(),
  status: z.string().default("New"),
  synced_hubspot: z.boolean().default(false),
  synced_yobot: z.boolean().default(false),
  score: z.number().default(0),
  date_added: z.string().optional()
}).refine(data => data.email || data.phone, {
  message: "Either email or phone must be provided"
});

// HubSpot integration
async function pushToHubSpot(leadData: any) {
  const hubspotApiKey = process.env.HUBSPOT_API_KEY;
  if (!hubspotApiKey) {
    throw new Error("HubSpot API key not configured");
  }

  const hubspotData = {
    properties: {
      email: leadData.email,
      firstname: leadData.name.split(' ')[0],
      lastname: leadData.name.split(' ').slice(1).join(' ') || '',
      company: leadData.company,
      phone: leadData.phone,
      jobtitle: leadData.title,
      city: leadData.location,
      website: leadData.website,
      lead_source: leadData.source,
      hs_lead_status: leadData.status,
      lead_score: leadData.score.toString(),
      phantombuster_campaign: leadData.campaign_id,
      source_platform: leadData.platform
    }
  };

  try {
    const response = await axios.post(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      hubspotData,
      {
        headers: {
          'Authorization': `Bearer ${hubspotApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, hubspotId: response.data.id };
  } catch (error: any) {
    if (error.response?.status === 409) {
      // Contact already exists, update instead
      try {
        const email = leadData.email;
        const updateResponse = await axios.patch(
          `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`,
          hubspotData,
          {
            headers: {
              'Authorization': `Bearer ${hubspotApiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return { success: true, hubspotId: updateResponse.data.id, updated: true };
      } catch (updateError) {
        throw new Error(`Failed to update existing HubSpot contact: ${updateError}`);
      }
    }
    throw new Error(`HubSpot API error: ${error.response?.data?.message || error.message}`);
  }
}

// Airtable integration for Call Queue
async function pushToCallQueue(leadData: any) {
  const airtableApiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const baseId = process.env.YOBOT_LEAD_ENGINE_BASE_ID;
  
  if (!airtableApiKey || !baseId) {
    throw new Error("Airtable configuration missing");
  }

  const callQueueData = {
    fields: {
      "Name": leadData.name,
      "Phone": leadData.phone,
      "Email": leadData.email,
      "Company": leadData.company,
      "Status": leadData.status,
      "Source": leadData.source,
      "Platform": leadData.platform,
      "Lead Score": leadData.score,
      "Synced to HubSpot?": "✅",
      "Synced to YoBot Queue?": "✅",
      "Date Added": new Date().toISOString().split('T')[0]
    }
  };

  try {
    const response = await axios.post(
      `https://api.airtable.com/v0/${baseId}/Call%20Queue`,
      callQueueData,
      {
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, airtableId: response.data.id };
  } catch (error: any) {
    throw new Error(`Airtable Call Queue error: ${error.response?.data?.error?.message || error.message}`);
  }
}

// Airtable integration for Scraped Leads
async function pushToScrapedLeads(leadData: any) {
  const airtableApiKey = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const baseId = process.env.YOBOT_LEAD_ENGINE_BASE_ID;
  
  if (!airtableApiKey || !baseId) {
    throw new Error("Airtable configuration missing");
  }

  const scrapedLeadsData = {
    fields: {
      "Lead Owner": leadData.lead_owner,
      "Source": leadData.source,
      "Campaign ID": leadData.campaign_id,
      "Platform": leadData.platform,
      "Name": leadData.name,
      "Email": leadData.email,
      "Phone": leadData.phone,
      "Company": leadData.company,
      "Website": leadData.website,
      "Title": leadData.title,
      "Location": leadData.location,
      "Status": leadData.status,
      "Synced HubSpot": leadData.synced_hubspot,
      "Synced YoBot": leadData.synced_yobot,
      "Score": leadData.score,
      "Date Added": leadData.date_added || new Date().toISOString().split('T')[0]
    }
  };

  try {
    const response = await axios.post(
      `https://api.airtable.com/v0/${baseId}/Scraped%20Leads%20(Universal)`,
      scrapedLeadsData,
      {
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, airtableId: response.data.id };
  } catch (error: any) {
    throw new Error(`Airtable Scraped Leads error: ${error.response?.data?.error?.message || error.message}`);
  }
}

// Main webhook handler
export async function ingestLead(req: Request, res: Response) {
  try {
    // Validate the incoming payload
    const validatedData = leadIngestionSchema.parse(req.body);
    
    // Store in local database
    const lead = await storage.createPhantombusterLead({
      leadOwner: validatedData.lead_owner,
      source: validatedData.source,
      campaignId: validatedData.campaign_id,
      platform: validatedData.platform,
      name: validatedData.name,
      email: validatedData.email,
      phone: validatedData.phone,
      company: validatedData.company,
      website: validatedData.website,
      title: validatedData.title,
      location: validatedData.location,
      status: validatedData.status,
      syncedHubspot: false,
      syncedYobot: false,
      score: validatedData.score,
      dateAdded: validatedData.date_added
    });

    const results = {
      leadId: lead.id,
      hubspot: { success: false, error: null as string | null },
      scrapedLeads: { success: false, error: null as string | null },
      callQueue: { success: false, error: null as string | null }
    };

    // Push to HubSpot
    try {
      const hubspotResult = await pushToHubSpot(validatedData);
      results.hubspot.success = true;
      
      // Update local record
      await storage.updatePhantombusterLead(lead.id, { syncedHubspot: true });
    } catch (error: any) {
      results.hubspot.error = error.message;
    }

    // Push to Airtable Scraped Leads
    try {
      await pushToScrapedLeads(validatedData);
      results.scrapedLeads.success = true;
    } catch (error: any) {
      results.scrapedLeads.error = error.message;
    }

    // Push to Airtable Call Queue
    try {
      await pushToCallQueue({
        ...validatedData,
        synced_hubspot: results.hubspot.success,
        synced_yobot: true
      });
      results.callQueue.success = true;
      
      // Update local record
      await storage.updatePhantombusterLead(lead.id, { syncedYobot: true });
    } catch (error: any) {
      results.callQueue.error = error.message;
    }

    // Return comprehensive result
    res.status(200).json({
      success: true,
      message: "Lead processed successfully",
      leadId: lead.id,
      integrations: results,
      summary: {
        total_integrations: 3,
        successful_integrations: [
          results.hubspot.success,
          results.scrapedLeads.success,
          results.callQueue.success
        ].filter(Boolean).length
      }
    });

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: "Invalid payload format",
        details: error.errors
      });
    }

    console.error("Lead ingestion error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: error.message
    });
  }
}

// Test endpoint for verifying the webhook
export async function testLeadIngestion(req: Request, res: Response) {
  const testLead = {
    lead_owner: "Tyson",
    source: "Phantombuster",
    campaign_id: "TEST-1234",
    platform: "LinkedIn",
    name: "Test User",
    email: "test@example.com",
    phone: "555-123-4567",
    company: "Test Company",
    website: "https://testcompany.com",
    title: "Test Manager",
    location: "Austin, TX",
    status: "New",
    synced_hubspot: false,
    synced_yobot: false,
    score: 85,
    date_added: new Date().toISOString().split('T')[0]
  };

  req.body = testLead;
  return ingestLead(req, res);
}