import type { Express } from "express";

// Airtable configuration for YoBot Lead Engine
const AIRTABLE_BASE_ID = "appb2F3D77tC4DWla"; // YoBot Lead Engine
const SCRAPED_LEADS_TABLE = "Scraped Leads (Universal) Table";

interface ScrapedLead {
  fullName: string;
  email?: string;
  company?: string;
  title?: string;
  location?: string;
  phone?: string;
  industry?: string;
  sourceTag: string;
  scrapeSessionId: string;
  source: string;
  linkedin?: string;
  rating?: number;
  reviewCount?: number;
  connectionDegree?: string;
}

export async function storeLeadsInAirtable(leads: ScrapedLead[], scrapeTool: string): Promise<boolean> {
  if (!process.env.AIRTABLE_API_KEY || !leads.length) {
    console.warn('Missing Airtable API key or no leads to store');
    return false;
  }

  try {
    const timestamp = new Date().toISOString();
    
    // Transform leads to match Airtable field structure
    const airtableRecords = leads.map(lead => ({
      fields: {
        'Full Name': lead.fullName,
        'Email': lead.email || '',
        'Company': lead.company || '',
        'Job Title': lead.title || '',
        'Location': lead.location || '',
        'Phone': lead.phone || '',
        'Industry': lead.industry || '',
        'Source Tool': scrapeTool,
        'Source Tag': lead.sourceTag,
        'Scrape Session ID': lead.scrapeSessionId,
        'Date Added': timestamp,
        'Status': 'New',
        'LinkedIn URL': lead.linkedin || '',
        'Rating': lead.rating?.toString() || '',
        'Review Count': lead.reviewCount?.toString() || '',
        'Connection Degree': lead.connectionDegree || '',
        'Lead Quality Score': calculateLeadQuality(lead).toString(),
        'Notes': `Auto-scraped via ${scrapeTool} on ${new Date().toLocaleDateString()}`
      }
    }));

    // Split into batches of 10 (Airtable limit)
    const batches = [];
    for (let i = 0; i < airtableRecords.length; i += 10) {
      batches.push(airtableRecords.slice(i, i + 10));
    }

    let totalStored = 0;
    
    for (const batch of batches) {
      const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(SCRAPED_LEADS_TABLE)}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: batch
        })
      });

      if (response.ok) {
        const result = await response.json();
        totalStored += result.records?.length || 0;
        console.log(`Stored batch of ${result.records?.length || 0} leads in Airtable`);
      } else {
        const errorText = await response.text();
        console.error(`Airtable storage failed for batch:`, response.status, errorText);
      }

      // Add delay between batches to respect rate limits
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    console.log(`Successfully stored ${totalStored} leads in Airtable Scraped Leads (Universal) table`);
    return totalStored > 0;

  } catch (error) {
    console.error('Error storing leads in Airtable:', error);
    return false;
  }
}

function calculateLeadQuality(lead: ScrapedLead): number {
  let score = 0;
  
  // Email presence and quality
  if (lead.email && lead.email.includes('@') && !lead.email.includes('example')) score += 30;
  
  // Job title indicates decision maker
  if (lead.title) {
    const decisionMakerTitles = ['ceo', 'cto', 'founder', 'director', 'vp', 'manager', 'head'];
    if (decisionMakerTitles.some(title => lead.title.toLowerCase().includes(title))) {
      score += 25;
    } else {
      score += 15;
    }
  }
  
  // Company information
  if (lead.company && lead.company.length > 2) score += 20;
  
  // Phone number
  if (lead.phone) score += 15;
  
  // LinkedIn profile
  if (lead.linkedin) score += 10;
  
  return Math.min(score, 100);
}

export async function logScrapingCampaign(tool: string, filters: any, leadCount: number, mode: string): Promise<void> {
  if (!process.env.AIRTABLE_API_KEY) return;

  try {
    const timestamp = new Date().toISOString();
    
    await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Scraping Campaigns Table`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: {
            'Campaign Name': `${tool.toUpperCase()} - ${new Date().toLocaleDateString()}`,
            'Scraping Tool': tool,
            'Date Started': timestamp,
            'Status': leadCount > 0 ? 'Completed' : 'Failed',
            'Leads Found': leadCount,
            'Mode': mode.toUpperCase(),
            'Filters Applied': JSON.stringify(filters),
            'Session ID': `${tool}-${Date.now()}`
          }
        }]
      })
    });
    
    console.log(`Logged scraping campaign for ${tool} in Airtable`);
  } catch (error) {
    console.error('Error logging scraping campaign:', error);
  }
}