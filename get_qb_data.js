// Simple QuickBooks data retrieval script
console.log('=== QuickBooks Integration Setup ===\n');

// Your credentials
const clientId = 'ABFKQruSPhRVxF89f0OfjopDH75UfGrCvswLR185exeZti85ep';
const redirectUri = 'https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl';

// Generate authorization URL
const params = new URLSearchParams({
  client_id: clientId,
  redirect_uri: redirectUri,
  response_type: 'code',
  scope: 'com.intuit.quickbooks.accounting openid profile email',
  state: 'yobot_auth'
});

const authUrl = `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;

console.log('Step 1: Visit this URL to authorize access to your QuickBooks:');
console.log(authUrl);
console.log('\nStep 2: After authorization, copy the code and realmId from the redirect URL');
console.log('Step 3: Provide those values to complete the connection');
console.log('\nOnce connected, you\'ll get your actual customer and product IDs for invoice automation.');