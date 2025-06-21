// /pages/api/lead-scraper.ts
import { NextApiRequest, NextApiResponse } from 'next';
// Ensure the correct path to AirtableClient is used
import { AirtableClient } from '../../lib/airtable'; // Ensure AirtableClient is correctly exported
import { sendSlackNotification } from '../../lib/slack';

const airtable = new AirtableClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { tool, query } = req.body;

  try {
    // Simulated results (replace with real scraper call)
    const results = [
      { name: 'Acme Mortgage', phone: '555-1111', email: 'acme@example.com' },
      { name: 'EZ Lending', phone: '555-2222', email: 'ez@example.com' },
      { name: 'Acme Mortgage', phone: '555-1111', email: 'acme@example.com' } // duplicate
    ];

    // Deduplicate by email or phone
    const seen = new Set();
    const deduped = results.filter((lead) => {
      const key = lead.email || lead.phone;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Save to Airtable
    await Promise.all(
      deduped.map((lead) =>
        airtable.createLead({
          Company: lead.name,
          Phone: lead.phone,
          Email: lead.email,
          Source: tool,
          Query: query
        })
      )
    );

    // Send Slack notification
    await sendSlackNotification(`🚨 Lead Scraper Pulled ${deduped.length} New Leads via ${tool}`);

    return res.status(200).json({ results: deduped });
  } catch (error) {
    console.error('Lead scraper error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
