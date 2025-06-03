import axios from 'axios';

const QBO_CLIENT_ID = process.env.QBO_CLIENT_ID || 'ABFKQruSPhRVxF89f0OfjopDH75UfGrCvswLR185exeZti85ep';
const QBO_CLIENT_SECRET = process.env.QBO_CLIENT_SECRET || 'E2TnUZabfdR7Ty2jV4d8R95VlD4Fl4GwoEaXjm17';
const QBO_REDIRECT_URI = process.env.QBO_REDIRECT_URI || 'https://workspace--tyson44.replit.app/api/qbo/callback';
const QBO_REALM_ID = process.env.QBO_REALM_ID;

interface QBOCustomer {
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
}

interface QBOInvoice {
  customerId: string;
  amount: number;
  description: string;
  dueDate?: string;
}

interface QBOItem {
  name: string;
  unitPrice: number;
  description?: string;
  type: 'Service' | 'Inventory';
}

/**
 * Generate QuickBooks OAuth authorization URL
 */
export function getQBOAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: QBO_CLIENT_ID,
    redirect_uri: QBO_REDIRECT_URI,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting openid profile email',
    state: 'yobot_auth'
  });
  
  return `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(authCode: string, realmId: string): Promise<{ accessToken: string; refreshToken: string; error?: string }> {
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
  } catch (error: any) {
    console.error('QBO token exchange error:', error.response?.data || error.message);
    return {
      accessToken: '',
      refreshToken: '',
      error: error.response?.data?.error_description || error.message
    };
  }
}

/**
 * Create customer in QuickBooks
 */
export async function createQBOCustomer(customer: QBOCustomer, accessToken: string, realmId: string): Promise<{ success: boolean; customerId?: string; error?: string }> {
  if (!accessToken || !realmId) {
    return { success: false, error: 'Missing access token or realm ID' };
  }

  try {
    const customerData = {
      Name: customer.name,
      CompanyName: customer.companyName || customer.name,
      PrimaryEmailAddr: customer.email ? { Address: customer.email } : undefined,
      PrimaryPhone: customer.phone ? { FreeFormNumber: customer.phone } : undefined
    };

    const response = await axios.post(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/customer`,
      { Customer: customerData },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return {
      success: true,
      customerId: response.data.QueryResponse?.Customer?.[0]?.Id
    };
  } catch (error: any) {
    console.error('QBO customer creation error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.Fault?.[0]?.Detail || error.message
    };
  }
}

/**
 * Create invoice in QuickBooks
 */
export async function createQBOInvoice(invoice: QBOInvoice, accessToken: string, realmId: string): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
  if (!accessToken || !realmId) {
    return { success: false, error: 'Missing access token or realm ID' };
  }

  try {
    const invoiceData = {
      CustomerRef: { value: invoice.customerId },
      Line: [{
        Amount: invoice.amount,
        DetailType: 'SalesItemLineDetail',
        SalesItemLineDetail: {
          ItemRef: { value: '1' }, // Default service item
          UnitPrice: invoice.amount,
          Qty: 1
        },
        Description: invoice.description
      }],
      DueDate: invoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    const response = await axios.post(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/invoice`,
      { Invoice: invoiceData },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );

    return {
      success: true,
      invoiceId: response.data.QueryResponse?.Invoice?.[0]?.Id
    };
  } catch (error: any) {
    console.error('QBO invoice creation error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.Fault?.[0]?.Detail || error.message
    };
  }
}

/**
 * Get company information from QuickBooks
 */
export async function getQBOCompanyInfo(accessToken: string, realmId: string): Promise<{ success: boolean; company?: any; error?: string }> {
  if (!accessToken || !realmId) {
    return { success: false, error: 'Missing access token or realm ID' };
  }

  try {
    const response = await axios.get(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/1`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }
    );

    return {
      success: true,
      company: response.data.QueryResponse?.CompanyInfo?.[0]
    };
  } catch (error: any) {
    console.error('QBO company info error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.Fault?.[0]?.Detail || error.message
    };
  }
}

/**
 * List all customers from QuickBooks
 */
export async function listQBOCustomers(accessToken: string, realmId: string): Promise<{ success: boolean; customers?: any[]; error?: string }> {
  if (!accessToken || !realmId) {
    return { success: false, error: 'Missing access token or realm ID' };
  }

  try {
    const response = await axios.post(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?minorversion=65`,
      { query: "SELECT * FROM Customer" },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      customers: response.data.QueryResponse?.Customer || []
    };
  } catch (error: any) {
    console.error('QBO customers list error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.Fault?.[0]?.Detail || error.message
    };
  }
}

/**
 * List all items from QuickBooks
 */
export async function listQBOItems(accessToken: string, realmId: string): Promise<{ success: boolean; items?: any[]; error?: string }> {
  if (!accessToken || !realmId) {
    return { success: false, error: 'Missing access token or realm ID' };
  }

  try {
    const response = await axios.post(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/query?minorversion=65`,
      { query: "SELECT * FROM Item" },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      items: response.data.QueryResponse?.Item || []
    };
  } catch (error: any) {
    console.error('QBO items list error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.Fault?.[0]?.Detail || error.message
    };
  }
}

/**
 * Test QuickBooks connection
 */
export async function testQBOConnection(accessToken?: string, realmId?: string): Promise<{ success: boolean; message: string; company?: any }> {
  if (!accessToken || !realmId) {
    return {
      success: false,
      message: 'QuickBooks not authenticated. Please complete OAuth flow first.',
    };
  }

  const result = await getQBOCompanyInfo(accessToken, realmId);
  
  if (result.success) {
    return {
      success: true,
      message: `Connected to QuickBooks: ${result.company?.Name || 'Unknown Company'}`,
      company: result.company
    };
  } else {
    return {
      success: false,
      message: `QuickBooks connection failed: ${result.error}`
    };
  }
}

/**
 * Sync CRM deal to QuickBooks invoice
 */
export async function syncDealToQBOInvoice(dealData: any, accessToken: string, realmId: string): Promise<{ success: boolean; invoiceId?: string; error?: string }> {
  try {
    // First, create or find customer
    const customerResult = await createQBOCustomer({
      name: dealData.contactName || 'Unknown Contact',
      email: dealData.email,
      phone: dealData.phone,
      companyName: dealData.company
    }, accessToken, realmId);

    if (!customerResult.success) {
      return { success: false, error: `Customer creation failed: ${customerResult.error}` };
    }

    // Create invoice
    const invoiceResult = await createQBOInvoice({
      customerId: customerResult.customerId!,
      amount: dealData.amount || 0,
      description: `Deal: ${dealData.dealName || 'YoBot Service'} - ${dealData.description || 'Automated service delivery'}`
    }, accessToken, realmId);

    return invoiceResult;
  } catch (error: any) {
    console.error('Deal to QBO sync error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}