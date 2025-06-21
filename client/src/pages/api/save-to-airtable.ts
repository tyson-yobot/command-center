// pages/api/save-to-airtable.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Airtable from "airtable";

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID as string);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { records } = req.body;

  if (!records || !Array.isArray(records)) {
    return res.status(400).json({ error: "Invalid records format" });
  }

  try {
    const created = await base("Leads").create(
      records.map((record) => ({
        fields: {
          Name: record.name || "Unknown",
          Phone: record.phone || "",
          Email: record.email || "",
          Address: record.address || "",
          Source: record.source || "Lead Scraper"
        }
      })),
      { typecast: true }
    );

    res.status(200).json({ success: true, created });
  } catch (err: any) {
    console.error("Airtable error:", err);
    res.status(500).json({ error: "Failed to save to Airtable", detail: err.message });
  }
}
