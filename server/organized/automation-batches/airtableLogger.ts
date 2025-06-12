import axios from 'axios';

interface TestResult {
  integration_name: string;
  passed: boolean;
  notes: string;
  module_type?: string;
}

export async function logToAirtable(integration_name: string, passed: boolean, notes: string, module_type: string = "Webhook"): Promise<boolean> {
  const api_key = process.env.AIRTABLE_PRODUCTION_API_KEY;
  if (!api_key) {
    console.error("ERROR: AIRTABLE_PRODUCTION_API_KEY not found");
    return false;
  }

  const base_id = "appbFDTqB2WtRNV1H";
  const table_id = "tbl7K5RthCtD69BE1";
  
  const list_url = `https://api.airtable.com/v0/${base_id}/${table_id}`;
  const headers = {
    'Authorization': `Bearer ${api_key}`,
    'Content-Type': 'application/json'
  };

  try {
    // Check for existing record
    const params = {
      filterByFormula: `{Integration Name} = '${integration_name}'`
    };
    
    const response = await axios.get(list_url, { headers, params });
    const existing_records = response.data.records || [];
    
    const record_data = {
      "Integration Name": integration_name,
      "Status": passed ? "✅ Passed" : "❌ Failed",
      "Notes": notes,
      "QA Owner": "Tyson Lerfald",
      "Output Data Populated": passed,
      "Record Created": passed,
      "Retry Attempted": !passed,
      "Module Type": module_type,
      "Logger Source": "🧠 AI Locked Logger v1.0",
      "Last Tested": new Date().toISOString()
    };
    
    if (existing_records.length > 0) {
      // PATCH existing record
      const record_id = existing_records[0].id;
      const patch_url = `${list_url}/${record_id}`;
      const payload = { fields: record_data };
      await axios.patch(patch_url, payload, { headers });
      console.log(`UPDATED: ${integration_name} - ${passed ? 'PASSED' : 'FAILED'}`);
    } else {
      // POST new record
      const payload = { fields: record_data };
      await axios.post(list_url, payload, { headers });
      console.log(`CREATED: ${integration_name} - ${passed ? 'PASSED' : 'FAILED'}`);
    }
    
    return true;
    
  } catch (error: any) {
    console.error(`Airtable logging failed: ${error.message}`);
    return false;
  }
}