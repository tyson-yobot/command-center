import axios from 'axios';

// Test Airtable connection to verify credentials and base access
export async function testAirtableConnection(): Promise<{
  success: boolean;
  error?: string;
  bases?: any[];
}> {
  try {
    const apiKey = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || process.env.AIRTABLE_API_KEY || '';
    
    if (!apiKey) {
      return { success: false, error: 'No Airtable API key found' };
    }

    // Test basic connection by listing bases
    const response = await axios.get('https://api.airtable.com/v0/meta/bases', {
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      bases: response.data.bases
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}

// Test specific base and table access
export async function testBaseAccess(baseId: string, tableName: string): Promise<{
  success: boolean;
  error?: string;
  tableId?: string;
}> {
  try {
    const apiKey = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN || process.env.AIRTABLE_API_KEY || '';
    
    // Get base schema
    const response = await axios.get(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
      headers: {
        'Authorization': `Bearer ${apiKey.trim()}`,
        'Content-Type': 'application/json'
      }
    });

    const table = response.data.tables.find((t: any) => t.name === tableName);
    
    if (!table) {
      return {
        success: false,
        error: `Table '${tableName}' not found in base ${baseId}`
      };
    }

    return {
      success: true,
      tableId: table.id
    };

  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message
    };
  }
}