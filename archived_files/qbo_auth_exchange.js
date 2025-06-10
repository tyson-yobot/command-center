import axios from 'axios';

async function exchangeQBOAuthCode() {
  try {
    const authCode = 'XAB1174878250Savt8YDaVVvg28183xSaYeTIHLhqskn64CD60';
    const realmId = '9341454652652354';
    const clientId = 'ABjndHEMJVzcfEEo4ILKR9q1WOhpXOyAxqzrGkKKQCfbbrXBWf';
    const clientSecret = '3pdJhnxWOyzFFwHOFNFdqh1zZ999QUBoEzWXsgyx';
    const redirectUri = 'https://yobot-qbo-sync.tyson44.repl.co/callback';

    console.log('Exchanging authorization code for access tokens...');
    console.log('Auth Code:', authCode);
    console.log('Realm ID:', realmId);

    // Exchange authorization code for access tokens
    const tokenResponse = await axios({
      method: 'POST',
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `grant_type=authorization_code&code=${authCode}&redirect_uri=${encodeURIComponent(redirectUri)}`
    });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    console.log('\n✅ Token exchange successful!');
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('Expires in:', expires_in, 'seconds');

    // Test connection with company info
    console.log('\n🔍 Testing connection with company info...');
    const companyResponse = await axios({
      method: 'GET',
      url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      }
    });

    const companyInfo = companyResponse.data.QueryResponse?.CompanyInfo?.[0];
    console.log('Company Name:', companyInfo?.Name);
    console.log('Company ID:', companyInfo?.Id);

    // Get customers
    console.log('\n👥 Fetching customers...');
    const customersResponse = await axios({
      method: 'GET',
      url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/customers?fetchAll=true`,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      }
    });

    const customers = customersResponse.data.QueryResponse?.Customer || [];
    console.log(`Found ${customers.length} customers:`);
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.Name} (ID: ${customer.Id})`);
      if (customer.PrimaryEmailAddr) {
        console.log(`   Email: ${customer.PrimaryEmailAddr.Address}`);
      }
      if (customer.CompanyName) {
        console.log(`   Company: ${customer.CompanyName}`);
      }
    });

    // Get items/services
    console.log('\n🛍️ Fetching items/services...');
    const itemsResponse = await axios({
      method: 'GET',
      url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/items?fetchAll=true`,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      }
    });

    const items = itemsResponse.data.QueryResponse?.Item || [];
    const activeItems = items.filter(item => item.Active);
    console.log(`Found ${activeItems.length} active items:`);
    activeItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.Name} (ID: ${item.Id}) - Type: ${item.Type}`);
      if (item.UnitPrice) {
        console.log(`   Unit Price: $${item.UnitPrice}`);
      }
      if (item.Description) {
        console.log(`   Description: ${item.Description}`);
      }
    });

    // Save data for import
    const qbData = {
      tokens: {
        accessToken: access_token,
        refreshToken: refresh_token,
        realmId: realmId,
        expiresIn: expires_in
      },
      company: companyInfo,
      customers: customers.map(customer => ({
        id: customer.Id,
        name: customer.Name,
        companyName: customer.CompanyName,
        email: customer.PrimaryEmailAddr?.Address,
        phone: customer.PrimaryPhone?.FreeFormNumber
      })),
      items: activeItems.map(item => ({
        id: item.Id,
        name: item.Name,
        description: item.Description,
        unitPrice: item.UnitPrice || 0,
        type: item.Type
      }))
    };

    console.log('\n📊 QuickBooks Data Summary:');
    console.log(`Company: ${companyInfo?.Name}`);
    console.log(`Customers: ${qbData.customers.length}`);
    console.log(`Active Items: ${qbData.items.length}`);

    return qbData;

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 400) {
      console.log('💡 The authorization code may have expired. Please generate a new one from QuickBooks developer console.');
    }
    throw error;
  }
}

// Run the exchange
exchangeQBOAuthCode()
  .then(data => {
    console.log('\n🎉 Successfully retrieved authentic QuickBooks data!');
    console.log('You can now use this data for automated invoice creation when deals close in your CRM.');
  })
  .catch(error => {
    console.error('Failed to exchange authorization code:', error.message);
  });