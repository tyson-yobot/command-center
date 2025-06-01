import axios from 'axios';

// Your QuickBooks credentials
const QBO_CLIENT_ID = 'ABFKQruSPhRVxF89f0OfjopDH75UfGrCvswLR185exeZti85ep';
const QBO_CLIENT_SECRET = 'E2TnUZabfdR7Ty2jV4d8R95VlD4Fl4GwoEaXjm17';
const QBO_REDIRECT_URI = 'https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl';

function getQBOAuthorizationUrl() {
  const params = new URLSearchParams({
    client_id: QBO_CLIENT_ID,
    redirect_uri: QBO_REDIRECT_URI,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting openid profile email',
    state: 'yobot_auth'
  });
  
  return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
}

async function exchangeCodeForToken(authCode, realmId) {
  try {
    const response = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: QBO_REDIRECT_URI
      }), {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${QBO_CLIENT_ID}:${QBO_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token
    };
  } catch (error) {
    console.error('QBO token exchange error:', error.response?.data || error.message);
    return {
      accessToken: '',
      refreshToken: '',
      error: error.response?.data?.error_description || error.message
    };
  }
}

async function listQBOCustomers(accessToken, realmId) {
  try {
    const response = await axios.get(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=SELECT * FROM Customer&minorversion=65`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    return {
      success: true,
      customers: response.data.QueryResponse?.Customer || []
    };
  } catch (error) {
    console.error('QBO customers list error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.Fault?.[0]?.Detail || error.message
    };
  }
}

async function listQBOItems(accessToken, realmId) {
  try {
    const response = await axios.get(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?query=SELECT * FROM Item&minorversion=65`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    return {
      success: true,
      items: response.data.QueryResponse?.Item || []
    };
  } catch (error) {
    console.error('QBO items list error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.Fault?.[0]?.Detail || error.message
    };
  }
}

// Main function to test connection
async function testQBOConnection() {
  console.log('QuickBooks OAuth URL:');
  console.log(getQBOAuthorizationUrl());
  console.log('\nTo test with your data:');
  console.log('1. Visit the URL above');
  console.log('2. Authorize the app');
  console.log('3. Copy the code and realmId from redirect URL');
  console.log('4. Run: node test_qbo_connection.js YOUR_CODE YOUR_REALM_ID');
}

// If command line arguments provided, test the connection
if (process.argv.length >= 4) {
  const code = process.argv[2];
  const realmId = process.argv[3];
  
  console.log('Testing QuickBooks connection...');
  
  exchangeCodeForToken(code, realmId)
    .then(async (tokenResult) => {
      if (tokenResult.error) {
        console.error('Token exchange failed:', tokenResult.error);
        return;
      }
      
      console.log('Token exchange successful!');
      
      // List customers
      const customersResult = await listQBOCustomers(tokenResult.accessToken, realmId);
      if (customersResult.success) {
        console.log('\nYour QuickBooks Customers:');
        customersResult.customers.forEach((customer, index) => {
          console.log(`${index + 1}. ${customer.Name} (ID: ${customer.Id})`);
        });
      } else {
        console.error('Failed to fetch customers:', customersResult.error);
      }
      
      // List items
      const itemsResult = await listQBOItems(tokenResult.accessToken, realmId);
      if (itemsResult.success) {
        console.log('\nYour QuickBooks Items/Products:');
        itemsResult.items.forEach((item, index) => {
          console.log(`${index + 1}. ${item.Name} (ID: ${item.Id}) - $${item.UnitPrice || 'N/A'}`);
        });
      } else {
        console.error('Failed to fetch items:', itemsResult.error);
      }
    })
    .catch(error => {
      console.error('Connection test failed:', error.message);
    });
} else {
  testQBOConnection();
}