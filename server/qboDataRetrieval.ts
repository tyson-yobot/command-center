import express from 'express';
import axios from 'axios';

const router = express.Router();

const QBO_BASE_URL = 'https://sandbox-quickbooks.api.intuit.com';
const QBO_DISCOVERY_URL = 'https://appcenter.intuit.com/api/v1/user/current';

interface QBOCustomer {
  Id: string;
  Name: string;
  CompanyName?: string;
  PrimaryEmailAddr?: { Address: string };
  PrimaryPhone?: { FreeFormNumber: string };
  BillAddr?: {
    Line1?: string;
    City?: string;
    CountrySubDivisionCode?: string;
    PostalCode?: string;
  };
}

interface QBOItem {
  Id: string;
  Name: string;
  Description?: string;
  UnitPrice?: number;
  Type: string;
  Active: boolean;
}

interface QBOInvoiceData {
  Line: Array<{
    Amount: number;
    DetailType: string;
    SalesItemLineDetail: {
      ItemRef: { value: string; name: string };
      UnitPrice: number;
      Qty: number;
    };
  }>;
  CustomerRef: { value: string };
}

async function refreshAccessToken() {
  const refreshToken = process.env.QUICKBOOKS_REFRESH_TOKEN;
  const clientId = 'ABFKQruSPhRVxF89f0OfjopDH75UfGrCvswLR185exeZti85ep';
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  
  if (!refreshToken || !clientSecret) {
    throw new Error('Refresh token or client secret not configured');
  }

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: `grant_type=refresh_token&refresh_token=${refreshToken}`
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Token refresh error:', error.response?.data || error.message);
    throw new Error('Failed to refresh access token');
  }
}

async function makeQBORequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
  let accessToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..3jzFA8JDG1n-AOqUZ0kB1w.2gVRO7I8PbTNvyWa8hK88kFSFEwP59UfoqQldmVN2HE9VZ0gSfPOwkEgj36Hx6PQ8gDVPeByONgYuR4gPZwQl1f5aiTLuWW3D73kmcyMuxzswOn9keDroPuJH1-PQhCGvNFZUjJyTdZGeBiXzdsChg-Hd-S-ErVF02RP8N26DZXenl07Q4EM-SKq8N60gDh1S87CzyJCv1Eo7EuQDPvU8O7m4Ks98XmDuk_ifqVElDKTg4JYJBTcnG26sAywcIBfjDBjB650RV2MAJ-ijK3Y5z6IYmTA8f5NscDd17klW0w1_BdjAnoEaxguuk_a5S8elTHLPAIU6ReMPsLcPHdjld8_L5lxSpupC6pmgmvVyzgz9Tce-xHMLRTVqeLMw5naQSnohbyTzNKcExeGFoBwhO2cAt8m2ZEbP7kB2iRmyiKRimxgerbl2XDglNIZlr_FPd2gF-6AgvGTpDGvUha6iepugVe_OnHFvm5vjZko-TIh0PC6rmV9ivxS4brNDkiZ-Ts7yZl73gMkwnQcpHzhKkZQO0xBzWmOWW_JTJzbhEhjiVcthhxESZwoXgglZVvqcayhJ7k_mnFlwjPwQwyrxkbhx0ZNByOizlH2MHSaxIM.lxVUIkqk50yHBvNfRWCRmw';
  const realmId = '9341454769403223';
  
  if (!accessToken || !realmId) {
    throw new Error('QuickBooks credentials not configured');
  }

  const url = `${QBO_BASE_URL}/v3/company/${realmId}/${endpoint}`;
  
  try {
    const response = await axios({
      method,
      url,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data
    });
    
    return response.data;
  } catch (error) {
    // If we get a 401, try refreshing the token
    if (error.response?.status === 401) {
      console.log('Access token expired, attempting refresh...');
      try {
        accessToken = await refreshAccessToken();
        
        // Retry the request with the new token
        const retryResponse = await axios({
          method,
          url,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          data
        });
        
        return retryResponse.data;
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        throw new Error('Authentication failed - please re-authorize QuickBooks');
      }
    }
    
    console.error('QuickBooks API Error:', error.response?.data || error.message);
    throw new Error(`QuickBooks API failed: ${error.response?.status || error.message}`);
  }
}

// Get all customers from QuickBooks
router.get('/customers', async (req, res) => {
  try {
    const response = await makeQBORequest("customers?fetchAll=true");
    const customers = response.QueryResponse?.Customer || [];
    
    const formattedCustomers = customers.map((customer: QBOCustomer) => ({
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
    }));
    
    res.json({
      success: true,
      customers: formattedCustomers,
      count: formattedCustomers.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all items/products from QuickBooks
router.get('/items', async (req, res) => {
  try {
    const response = await makeQBORequest("items?fetchAll=true");
    const items = response.QueryResponse?.Item || [];
    
    const formattedItems = items
      .filter((item: QBOItem) => item.Active && item.Type === 'Service')
      .map((item: QBOItem) => ({
        id: item.Id,
        name: item.Name,
        description: item.Description,
        unitPrice: item.UnitPrice || 0,
        type: item.Type
      }));
    
    res.json({
      success: true,
      items: formattedItems,
      count: formattedItems.length
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create invoice in QuickBooks
router.post('/create-invoice', async (req, res) => {
  try {
    const { customerId, items, totalAmount } = req.body;
    
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID and items are required'
      });
    }

    const invoiceData: QBOInvoiceData = {
      Line: items.map((item: any) => ({
        Amount: item.amount || item.unitPrice * item.quantity,
        DetailType: "SalesItemLineDetail",
        SalesItemLineDetail: {
          ItemRef: { 
            value: item.itemId, 
            name: item.name 
          },
          UnitPrice: item.unitPrice || 0,
          Qty: item.quantity || 1
        }
      })),
      CustomerRef: { value: customerId }
    };

    const response = await makeQBORequest('invoice', 'POST', invoiceData);
    
    res.json({
      success: true,
      invoice: response.Invoice,
      invoiceId: response.Invoice.Id
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test connection with simpler endpoint
router.get('/test-connection', async (req, res) => {
  try {
    // Use direct axios call to test the token
    const accessToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..3jzFA8JDG1n-AOqUZ0kB1w.2gVRO7I8PbTNvyWa8hK88kFSFEwP59UfoqQldmVN2HE9VZ0gSfPOwkEgj36Hx6PQ8gDVPeByONgYuR4gPZwQl1f5aiTLuWW3D73kmcyMuxzswOn9keDroPuJH1-PQhCGvNFZUjJyTdZGeBiXzdsChg-Hd-S-ErVF02RP8N26DZXenl07Q4EM-SKq8N60gDh1S87CzyJCv1Eo7EuQDPvU8O7m4Ks98XmDuk_ifqVElDKTg4JYJBTcnG26sAywcIBfjDBjB650RV2MAJ-ijK3Y5z6IYmTA8f5NscDd17klW0w1_BdjAnoEaxguuk_a5S8elTHLPAIU6ReMPsLcPHdjld8_L5lxSpupC6pmgmvVyzgz9Tce-xHMLRTVqeLMw5naQSnohbyTzNKcExeGFoBwhO2cAt8m2ZEbP7kB2iRmyiKRimxgerbl2XDglNIZlr_FPd2gF-6AgvGTpDGvUha6iepugVe_OnHFvm5vjZko-TIh0PC6rmV9ivxS4brNDkiZ-Ts7yZl73gMkwnQcpHzhKkZQO0xBzWmOWW_JTJzbhEhjiVcthhxESZwoXgglZVvqcayhJ7k_mnFlwjPwQwyrxkbhx0ZNByOizlH2MHSaxIM.lxVUIkqk50yHBvNfRWCRmw';
    const realmId = '9341454769403223';
    
    // Test both sandbox and production endpoints
    const endpoints = [
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,
      `https://quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`
    ];
    
    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: 'GET',
          url: endpoint,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
          }
        });
        
        return res.json({
          success: true,
          message: 'QuickBooks connection successful',
          endpoint: endpoint.includes('sandbox') ? 'sandbox' : 'production',
          companyInfo: response.data.QueryResponse?.CompanyInfo?.[0]
        });
        
      } catch (error) {
        lastError = error;
        console.log(`Failed with ${endpoint}:`, error.response?.status, error.response?.data);
      }
    }
    
    // If both failed, return the error
    throw lastError;
    
  } catch (error) {
    console.error('Connection test failed:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    });
  }
});

export { router as qboDataRouter };