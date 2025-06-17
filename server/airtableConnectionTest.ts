/**
 * Airtable Connection Test
 * Comprehensive test to verify Personal Access Token authentication
 */

export async function testAirtableConnection() {
  const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID || 'appRt8V3tH4g5Z51f';
  
  console.log('Testing Airtable connection...');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length || 0);
  console.log('Token starts with pat_:', token?.startsWith('pat_') || false);
  console.log('Base ID:', baseId);
  
  if (!token) {
    console.error('No AIRTABLE_PERSONAL_ACCESS_TOKEN found');
    return { success: false, error: 'No token configured' };
  }
  
  try {
    // Comprehensive token cleaning: remove all non-ASCII characters and normalize
    const cleanToken = token
      .replace(/[^\x20-\x7E]/g, '') // Remove non-printable ASCII
      .replace(/[\r\n\t\s]/g, '')   // Remove whitespace and line breaks
      .trim();
    
    console.log('Original token length:', token.length);
    console.log('Clean token length:', cleanToken.length);
    console.log('Token format valid:', /^pat[a-zA-Z0-9.]+$/.test(cleanToken));
    console.log('Clean token preview:', cleanToken.substring(0, 15) + '...');
    
    // Test 1: Basic API access
    const response = await fetch(`https://api.airtable.com/v0/meta/bases`, {
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Airtable API Error:', response.status, errorBody);
      return { 
        success: false, 
        error: `API error: ${response.status} - ${errorBody}`,
        token_format: token?.substring(0, 10) + '...'
      };
    }
    
    const data = await response.json();
    console.log('✅ Airtable connection successful');
    console.log('Available bases:', data.bases?.length || 0);
    
    // Test 2: Specific base access
    const baseResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Scraped%20Leads%20(Universal)?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (baseResponse.ok) {
      const baseData = await baseResponse.json();
      console.log('✅ Base access successful, records found:', baseData.records?.length || 0);
      return { 
        success: true, 
        bases: data.bases?.length || 0,
        records: baseData.records?.length || 0
      };
    } else {
      const baseError = await baseResponse.text();
      console.log('⚠️ Base access failed:', baseResponse.status, baseError);
      return { 
        success: true, 
        bases: data.bases?.length || 0,
        baseAccessError: `${baseResponse.status} - ${baseError}`
      };
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
    return { success: false, error: error.message };
  }
}