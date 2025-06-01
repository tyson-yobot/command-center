import express from 'express';
import axios from 'axios';

const router = express.Router();

// Exchange authorization code for access tokens
router.post('/exchange-token', async (req, res) => {
  try {
    const { authCode, realmId } = req.body;
    
    if (!authCode || !realmId) {
      return res.status(400).json({
        success: false,
        error: 'Authorization code and realm ID are required'
      });
    }

    const clientId = 'ABjndHEMJVzcfEEo4ILKR9q1WOhpXOyAxqzrGkKKQCfbbrXBWf';
    const clientSecret = '3pdJhnxWOyzFFwHOFNFdqh1zZ999QUBoEzWXsgyx';
    const redirectUri = 'https://yobot-qbo-sync.tyson44.repl.co/callback';
    
    console.log('Exchanging auth code for tokens...');
    console.log('Auth Code:', authCode);
    console.log('Realm ID:', realmId);
    
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
    
    console.log('Token exchange successful!');
    console.log('Access token received, expires in:', expires_in, 'seconds');
    
    // Now test the connection with the new access token
    const testResponse = await axios({
      method: 'GET',
      url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Accept': 'application/json'
      }
    });
    
    res.json({
      success: true,
      message: 'QuickBooks tokens exchanged successfully',
      tokens: {
        accessToken: access_token,
        refreshToken: refresh_token,
        realmId: realmId,
        expiresIn: expires_in
      },
      companyInfo: testResponse.data.QueryResponse?.CompanyInfo?.[0]
    });
    
  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to exchange authorization code',
      details: error.response?.data || error.message
    });
  }
});

// Get customers with fresh token
router.post('/get-customers', async (req, res) => {
  try {
    const { accessToken, realmId } = req.body;
    
    if (!accessToken || !realmId) {
      return res.status(400).json({
        success: false,
        error: 'Access token and realm ID are required'
      });
    }
    
    const response = await axios({
      method: 'GET',
      url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/customers?fetchAll=true`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    const customers = response.data.QueryResponse?.Customer || [];
    
    const formattedCustomers = customers.map((customer: any) => ({
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
    console.error('Error fetching customers:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch customers',
      details: error.response?.data || error.message
    });
  }
});

// Get items with fresh token
router.post('/get-items', async (req, res) => {
  try {
    const { accessToken, realmId } = req.body;
    
    if (!accessToken || !realmId) {
      return res.status(400).json({
        success: false,
        error: 'Access token and realm ID are required'
      });
    }
    
    const response = await axios({
      method: 'GET',
      url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/items?fetchAll=true`,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    });
    
    const items = response.data.QueryResponse?.Item || [];
    
    const formattedItems = items
      .filter((item: any) => item.Active && (item.Type === 'Service' || item.Type === 'Inventory'))
      .map((item: any) => ({
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
    console.error('Error fetching items:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch items',
      details: error.response?.data || error.message
    });
  }
});

export { router as qboTokenRouter };