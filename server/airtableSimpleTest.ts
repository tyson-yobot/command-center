/**
 * Simplified Airtable Authentication Test
 * Direct base access with proper API versioning
 */

import https from 'https';

export async function testSimpleAirtableAuth(): Promise<any> {
  const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  
  if (!token) {
    return { 
      success: false, 
      error: 'AIRTABLE_PERSONAL_ACCESS_TOKEN not configured',
      instructions: 'Please provide a valid Airtable Personal Access Token'
    };
  }

  // Clean token: remove any non-alphanumeric characters except dots
  const cleanToken = token.replace(/[^a-zA-Z0-9.]/g, '');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: '/v0/appRt8V3tH4g5Z51f/Sales%20Orders?maxRecords=1', // Test with specific table
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve({
              success: true,
              message: 'Airtable authentication successful',
              baseAccess: true,
              tables: parsed.tables?.length || 0
            });
          } catch (e) {
            resolve({
              success: false,
              error: 'Invalid JSON response from Airtable'
            });
          }
        } else {
          resolve({
            success: false,
            error: `Airtable API Error: ${res.statusCode}`,
            response: data,
            tokenLength: cleanToken.length,
            tokenPreview: cleanToken.substring(0, 15) + '...'
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        success: false,
        error: `Request failed: ${e.message}`
      });
    });

    req.end();
  });
}

export async function getLiveAirtableData(tableName: string): Promise<any> {
  const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  
  if (!token) {
    return { success: false, error: 'No token configured', data: [] };
  }

  const cleanToken = token.replace(/[^a-zA-Z0-9.]/g, '');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: `/v0/appRt8V3tH4g5Z51f/${encodeURIComponent(tableName)}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve({
              success: true,
              data: parsed.records || [],
              tableName
            });
          } catch (e) {
            resolve({
              success: false,
              error: 'Invalid JSON response',
              data: []
            });
          }
        } else {
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}`,
            data: []
          });
        }
      });
    });

    req.on('error', () => {
      resolve({
        success: false,
        error: 'Network error',
        data: []
      });
    });

    req.end();
  });
}