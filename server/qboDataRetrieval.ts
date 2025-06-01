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

async function makeQBORequest(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
  const accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN;
  const realmId = process.env.QUICKBOOKS_REALM_ID;
  
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

// Test connection
router.get('/test-connection', async (req, res) => {
  try {
    const response = await makeQBORequest('companyinfo/1');
    
    res.json({
      success: true,
      message: 'QuickBooks connection successful',
      companyInfo: response.QueryResponse?.CompanyInfo?.[0]
    });
  } catch (error) {
    console.error('Connection test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export { router as qboDataRouter };