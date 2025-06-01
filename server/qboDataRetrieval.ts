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
  let accessToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..r3N6tqvaJqnHBbxqtWW0CA.HApad4u1I6AGyZjXnaKd7Y4tIURg313sJw9g7QmUPWpO58AF3QLQGY5Q5cmvheVY4sabIq5rB1ic_xz4z61nkAZWmo4rSurRDmjHSsz1jpXVAvUkJlLxgFbCAEEvOrs6y2faq1oJ4iOObg-xPwFj0Is9iXQWCBxFkspQuvCnNPUrUKq3nbdRONAFe86gZWfBUxnHZDCOgfQapRJolmvrPh8dRN8MFlqlwrQs8PJIBbsgbPonwMazVayKDWuHIVFDe5_C0buvRa2zZCU5-1jUBRYnZe5MUG87jxN8jvYD8rfMAIPLGLI_THZrv8GlXEmnteSOsqC5vNO5ne-r0vefxOSQtGEogFIrpnqp4dQkbAzuG_Z0kBgDcZKD7vwX5ZIfA2O1Rls98X6iGhO6xH0KqZsNLG0i0_iA8tG6jqjNbV5icrhX1VT2ETer0tX8iScVYu3Mf-L8mcVjsyzJxIoWBtjT2FSoA2XA6C3QBUthN2XI2RWr5bg-8_htIFfpS2efRmo0874C4PE2uJ6EjxjrNzhlIqXroufhVdDtyRdmtkkmteG9nMeWQ26iLmK3xkFRR9REwUt8CYy-rUYR-hPL22vlIqzcYD_nskX88cwSOTg.mo8_dFf9ucnZMEQ2CgAsWA';
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
    const accessToken = 'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..r3N6tqvaJqnHBbxqtWW0CA.HApad4u1I6AGyZjXnaKd7Y4tIURg313sJw9g7QmUPWpO58AF3QLQGY5Q5cmvheVY4sabIq5rB1ic_xz4z61nkAZWmo4rSurRDmjHSsz1jpXVAvUkJlLxgFbCAEEvOrs6y2faq1oJ4iOObg-xPwFj0Is9iXQWCBxFkspQuvCnNPUrUKq3nbdRONAFe86gZWfBUxnHZDCOgfQapRJolmvrPh8dRN8MFlqlwrQs8PJIBbsgbPonwMazVayKDWuHIVFDe5_C0buvRa2zZCU5-1jUBRYnZe5MUG87jxN8jvYD8rfMAIPLGLI_THZrv8GlXEmnteSOsqC5vNO5ne-r0vefxOSQtGEogFIrpnqp4dQkbAzuG_Z0kBgDcZKD7vwX5ZIfA2O1Rls98X6iGhO6xH0KqZsNLG0i0_iA8tG6jqjNbV5icrhX1VT2ETer0tX8iScVYu3Mf-L8mcVjsyzJxIoWBtjT2FSoA2XA6C3QBUthN2XI2RWr5bg-8_htIFfpS2efRmo0874C4PE2uJ6EjxjrNzhlIqXroufhVdDtyRdmtkkmteG9nMeWQ26iLmK3xkFRR9REwUt8CYy-rUYR-hPL22vlIqzcYD_nskX88cwSOTg.mo8_dFf9ucnZMEQ2CgAsWA';
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