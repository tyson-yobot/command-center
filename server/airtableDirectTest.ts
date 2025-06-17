/**
 * Direct Airtable Connection Test
 * Simple, direct API test to verify authentication
 */

export async function testAirtableDirectConnection() {
  const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  
  if (!token || !baseId) {
    return {
      success: false,
      error: 'Missing AIRTABLE_PERSONAL_ACCESS_TOKEN or AIRTABLE_BASE_ID'
    };
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Scraped%20Leads%20(Universal)?maxRecords=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        status: response.status,
        error: errorText
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
      recordCount: data.records?.length || 0
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getAirtableBaseInfo() {
  const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  
  if (!token || !baseId) {
    return { success: false, error: 'Missing credentials' };
  }

  try {
    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        status: response.status,
        error: errorText
      };
    }

    const data = await response.json();
    return {
      success: true,
      tables: data.tables?.map((t: any) => ({ id: t.id, name: t.name })) || []
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}