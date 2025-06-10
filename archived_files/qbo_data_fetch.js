import axios from 'axios';

async function fetchQuickBooksData() {
  try {
    const accessToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..3jzFA8JDG1n-AOqUZ0kB1w.2gVRO7I8PbTNvyWa8hK88kFSFEwP59UfoqQldmVN2HE9VZ0gSfPOwkEgj36Hx6PQ8gDVPeByONgYuR4gPZwQl1f5aiTLuWW3D73kmcyMuxzswOn9keDroPuJH1-PQhCGvNFZUjJyTdZGeBiXzdsChg-Hd-S-ErVF02RP8N26DZXenl07Q4EM-SKq8N60gDh1S87CzyJCv1Eo7EuQDPvU8O7m4Ks98XmDuk_ifqVElDKTg4JYJBTcnG26sAywcIBfjDBjB650RV2MAJ-ijK3Y5z6IYmTA8f5NscDd17klW0w1_BdjAnoEaxguuk_a5S8elTHLPAIU6ReMPsLcPHdjld8_L5lxSpupC6pmgmvVyzgz9Tce-xHMLRTVqeLMw5naQSnohbyTzNKcExeGFoBwhO2cAt8m2ZEbP7kB2iRmyiKRimxgerbl2XDglNIZlr_FPd2gF-6AgvGTpDGvUha6iepugVe_OnHFvm5vjZko-TIh0PC6rmV9ivxS4brNDkiZ-Ts7yZl73gMkwnQcpHzhKkZQO0xBzWmOWW_JTJzbhEhjiVcthhxESZwoXgglZVvqcayhJ7k_mnFlwjPwQwyrxkbhx0ZNByOizlH2MHSaxIM.lxVUIkqk50yHBvNfRWCRmw';
    const realmId = '9341454652652354';

    console.log('🚀 Fetching authentic QuickBooks data...');
    console.log('Using Realm ID:', realmId);

    // Test connection with company info - try both sandbox and production
    console.log('\n🏢 Getting company information...');
    
    const endpoints = [
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`, // Production
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}` // Sandbox
    ];
    
    let companyResponse;
    let selectedEndpoint;
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing ${endpoint.includes('sandbox') ? 'Sandbox' : 'Production'} endpoint...`);
        companyResponse = await axios({
          method: 'GET',
          url: endpoint,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        selectedEndpoint = endpoint;
        console.log(`✅ Success with ${endpoint.includes('sandbox') ? 'Sandbox' : 'Production'} environment`);
        break;
      } catch (error) {
        console.log(`❌ Failed with ${endpoint.includes('sandbox') ? 'Sandbox' : 'Production'}: ${error.response?.status}`);
      }
    }
    
    if (!companyResponse) {
      throw new Error('Unable to connect to QuickBooks with either sandbox or production endpoints');
    }
    
    const baseUrl = selectedEndpoint.replace(`/v3/company/${realmId}/companyinfo/${realmId}`, '');

    const companyInfo = companyResponse.data.QueryResponse?.CompanyInfo?.[0];
    console.log('✅ Company Name:', companyInfo?.Name);
    console.log('   Company ID:', companyInfo?.Id);

    // Get all customers
    console.log('\n👥 Fetching all customers...');
    const customersResponse = await axios({
      method: 'GET',
      url: `${baseUrl}/v3/company/${realmId}/customers?fetchAll=true`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const customers = customersResponse.data.QueryResponse?.Customer || [];
    console.log(`✅ Found ${customers.length} customers:`);
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.Name} (ID: ${customer.Id})`);
      if (customer.PrimaryEmailAddr) {
        console.log(`   📧 Email: ${customer.PrimaryEmailAddr.Address}`);
      }
      if (customer.CompanyName) {
        console.log(`   🏢 Company: ${customer.CompanyName}`);
      }
      if (customer.PrimaryPhone) {
        console.log(`   📞 Phone: ${customer.PrimaryPhone.FreeFormNumber}`);
      }
    });

    // Get all items/services
    console.log('\n🛍️ Fetching all items/services...');
    const itemsResponse = await axios({
      method: 'GET',
      url: `${baseUrl}/v3/company/${realmId}/items?fetchAll=true`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });

    const items = itemsResponse.data.QueryResponse?.Item || [];
    const activeItems = items.filter(item => item.Active);
    console.log(`✅ Found ${activeItems.length} active items/services:`);
    activeItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.Name} (ID: ${item.Id}) - Type: ${item.Type}`);
      if (item.UnitPrice) {
        console.log(`   💰 Unit Price: $${item.UnitPrice}`);
      }
      if (item.Description) {
        console.log(`   📝 Description: ${item.Description}`);
      }
    });

    // Format data for invoice automation
    const formattedData = {
      company: {
        name: companyInfo?.Name,
        id: companyInfo?.Id,
        realmId: realmId
      },
      customers: customers.map(customer => ({
        id: customer.Id,
        name: customer.Name,
        companyName: customer.CompanyName,
        email: customer.PrimaryEmailAddr?.Address,
        phone: customer.PrimaryPhone?.FreeFormNumber,
        address: customer.BillAddr ? {
          line1: customer.BillAddr.Line1,
          city: customer.BillAddr.City,
          state: customer.BillAddr.CountrySubDivisionCode,
          postalCode: customer.BillAddr.PostalCode
        } : null
      })),
      items: activeItems.map(item => ({
        id: item.Id,
        name: item.Name,
        description: item.Description,
        unitPrice: item.UnitPrice || 0,
        type: item.Type
      }))
    };

    console.log('\n📊 Summary of Authentic QuickBooks Data:');
    console.log(`🏢 Company: ${formattedData.company.name}`);
    console.log(`👥 Customers: ${formattedData.customers.length}`);
    console.log(`🛍️ Active Items: ${formattedData.items.length}`);
    
    console.log('\n🎉 Successfully retrieved all authentic QuickBooks data!');
    console.log('This data is now ready for automated invoice creation when deals close in your CRM.');

    return formattedData;

  } catch (error) {
    console.error('❌ Error fetching QuickBooks data:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔑 Token may have expired. Please provide a fresh access token.');
    } else if (error.response?.status === 403) {
      console.log('🚫 Access denied. Please check your QuickBooks app permissions.');
    } else {
      console.log('💡 Status:', error.response?.status || 'Network error');
    }
    
    throw error;
  }
}

// Run the data fetch
fetchQuickBooksData()
  .then(data => {
    console.log('\n✨ Ready for automated invoice creation!');
  })
  .catch(error => {
    console.error('Failed to fetch QuickBooks data');
  });