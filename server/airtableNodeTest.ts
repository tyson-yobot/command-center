/**
 * Airtable Connection Test - Node.js Native Implementation
 * Bypasses fetch header issues using Node.js HTTP module
 */

import https from 'https';

export async function testAirtableNodeConnection() {
  const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  
  if (!token) {
    return { success: false, error: 'No AIRTABLE_PERSONAL_ACCESS_TOKEN configured' };
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: '/v0/meta/bases',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json',
        'User-Agent': 'YoBot/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            console.log('✅ Airtable connection successful');
            resolve({
              success: true,
              data: parsed,
              message: 'Airtable authentication working'
            });
          } catch (e) {
            resolve({
              success: false,
              error: 'Invalid JSON response'
            });
          }
        } else {
          console.error('❌ Airtable API Error:', res.statusCode, data);
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}: ${data}`,
            statusCode: res.statusCode
          });
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      resolve({
        success: false,
        error: `Request failed: ${e.message}`
      });
    });

    req.end();
  });
}

/**
 * Test specific base access using Node.js HTTPS
 */
export async function testSpecificBase(baseId: string) {
  const token = process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  
  if (!token) {
    return { success: false, error: 'No token configured' };
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.airtable.com',
      port: 443,
      path: `/v0/${baseId}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const parsed = JSON.parse(data);
            resolve({
              success: true,
              data: parsed,
              baseId: baseId
            });
          } catch (e) {
            resolve({
              success: false,
              error: 'Invalid JSON response'
            });
          }
        } else {
          resolve({
            success: false,
            error: `HTTP ${res.statusCode}: ${data}`,
            statusCode: res.statusCode,
            baseId: baseId
          });
        }
      });
    });

    req.on('error', (e) => {
      resolve({
        success: false,
        error: `Request failed: ${e.message}`,
        baseId: baseId
      });
    });

    req.end();
  });
}