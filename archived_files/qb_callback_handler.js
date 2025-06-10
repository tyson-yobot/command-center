// QuickBooks OAuth callback handler
import axios from 'axios';

const CLIENT_ID = 'ABFKQruSPhRVxF89f0OfjopDH75UfGrCvswLR185exeZti85ep';
const CLIENT_SECRET = 'E2TnUZabfdR7Ty2jV4d8R95VlD4Fl4GwoEaXjm17';
const REDIRECT_URI = 'https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl';

// Function to exchange authorization code for access token
async function exchangeCodeForTokens(authCode, realmId) {
  try {
    const response = await axios.post('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: REDIRECT_URI
      }), {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return {
      accessToken: response.data.access_token,
      refreshToken: response.data.refresh_token,
      realmId: realmId
    };
  } catch (error) {
    console.error('Token exchange failed:', error.response?.data || error.message);
    throw error;
  }
}

// Function to get customers from QuickBooks
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

// Function to get items/products from QuickBooks
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

// Main function to process OAuth callback
export async function processQBCallback(code, realmId) {
  try {
    console.log('Processing QuickBooks OAuth callback...');
    
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, realmId);
    console.log('✓ Tokens obtained successfully');
    
    // Get customer data
    const customers = await getCustomers(tokens.accessToken, realmId);
    console.log(`✓ Retrieved ${customers.length} customers`);
    
    // Get product/service data
    const items = await getItems(tokens.accessToken, realmId);
    console.log(`✓ Retrieved ${items.length} items/products`);
    
    return {
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      realmId: realmId,
      customers: customers,
      items: items
    };
    
  } catch (error) {
    console.error('QuickBooks callback processing failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// If running directly with command line arguments
if (process.argv.length >= 4) {
  const code = process.argv[2];
  const realmId = process.argv[3];
  
  processQBCallback(code, realmId)
    .then(result => {
      if (result.success) {
        console.log('\n=== QuickBooks Connection Successful ===');
        console.log(`Customers: ${result.customers.length}`);
        console.log(`Products/Services: ${result.items.length}`);
        console.log('\nYour data is ready for automated invoice creation!');
      } else {
        console.log('Connection failed:', result.error);
      }
    });
}