#!/usr/bin/env node

import axios from 'axios';

// Your QuickBooks credentials
const QBO_CLIENT_ID = 'ABFKQruSPhRVxF89f0OfjopDH75UfGrCvswLR185exeZti85ep';
const QBO_CLIENT_SECRET = 'E2TnUZabfdR7Ty2jV4d8R95VlD4Fl4GwoEaXjm17';
const QBO_REDIRECT_URI = 'https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl';

function getAuthUrl() {
  const params = new URLSearchParams({
    client_id: QBO_CLIENT_ID,
    redirect_uri: QBO_REDIRECT_URI,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting openid profile email',
    state: 'yobot_auth'
  });
  
  return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
}

async function getAccessToken(code, realmId) {
  const response = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', 
    new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: QBO_REDIRECT_URI
    }), {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );
  
  return response.data.access_token;
}

async function getCustomers(accessToken, realmId) {
  const response = await axios.get(
    `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=SELECT * FROM Customer&minorversion=65`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }
  );
  
  return response.data.QueryResponse?.Customer || [];
}

async function getItems(accessToken, realmId) {
  const response = await axios.get(
    `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=SELECT * FROM Item&minorversion=65`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    }
  );
  
  return response.data.QueryResponse?.Item || [];
}

// Main execution
if (process.argv.length < 4) {
  console.log('QuickBooks OAuth URL:');
  console.log(getAuthUrl());
  console.log('\nAfter authorization, run:');
  console.log('node qbo_direct_test.mjs <code> <realmId>');
  process.exit(0);
}

const [,, code, realmId] = process.argv;

try {
  console.log('Getting access token...');
  const accessToken = await getAccessToken(code, realmId);
  
  console.log('Fetching your QuickBooks data...\n');
  
  const customers = await getCustomers(accessToken, realmId);
  console.log('=== YOUR QUICKBOOKS CUSTOMERS ===');
  customers.forEach((customer, i) => {
    console.log(`${i + 1}. ${customer.Name} (ID: ${customer.Id})`);
  });
  
  const items = await getItems(accessToken, realmId);
  console.log('\n=== YOUR QUICKBOOKS ITEMS/PRODUCTS ===');
  items.forEach((item, i) => {
    const price = item.UnitPrice || 'No price set';
    console.log(`${i + 1}. ${item.Name} (ID: ${item.Id}) - $${price}`);
  });
  
  console.log('\n=== INTEGRATION READY ===');
  console.log('Your QuickBooks data is now available for automated invoice creation.');
  
} catch (error) {
  console.error('Error:', error.response?.data || error.message);
}