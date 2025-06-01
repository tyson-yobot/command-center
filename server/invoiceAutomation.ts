import express from 'express';
import { storage } from './newStorage';

const router = express.Router();

interface InvoiceRequest {
  customerId: string;
  customerName: string;
  customerEmail?: string;
  items: Array<{
    itemId: string;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }>;
  totalAmount: number;
  dealId?: string;
  crmSource: 'hubspot' | 'manual';
}

interface QBCustomer {
  id: string;
  name: string;
  email?: string;
  companyName?: string;
  phone?: string;
}

interface QBItem {
  id: string;
  name: string;
  description?: string;
  unitPrice: number;
  type: string;
}

// Store for QuickBooks data (will be populated when API works)
let qbCustomers: QBCustomer[] = [];
let qbItems: QBItem[] = [];

// Manual data entry endpoints for QuickBooks customers and items
router.post('/qb-customers', async (req, res) => {
  try {
    const { customers } = req.body;
    
    if (!Array.isArray(customers)) {
      return res.status(400).json({ error: 'Customers must be an array' });
    }
    
    qbCustomers = customers.map((customer: any) => ({
      id: customer.id || customer.Id,
      name: customer.name || customer.Name,
      email: customer.email || customer.PrimaryEmailAddr?.Address,
      companyName: customer.companyName || customer.CompanyName,
      phone: customer.phone || customer.PrimaryPhone?.FreeFormNumber
    }));
    
    res.json({
      success: true,
      message: `${qbCustomers.length} customers imported successfully`,
      customers: qbCustomers
    });
  } catch (error) {
    console.error('Error importing customers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import customers'
    });
  }
});

router.post('/qb-items', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Items must be an array' });
    }
    
    qbItems = items.map((item: any) => ({
      id: item.id || item.Id,
      name: item.name || item.Name,
      description: item.description || item.Description,
      unitPrice: item.unitPrice || item.UnitPrice || 0,
      type: item.type || item.Type || 'Service'
    }));
    
    res.json({
      success: true,
      message: `${qbItems.length} items imported successfully`,
      items: qbItems
    });
  } catch (error) {
    console.error('Error importing items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import items'
    });
  }
});

// Get current QuickBooks data
router.get('/qb-data', async (req, res) => {
  res.json({
    success: true,
    data: {
      customers: qbCustomers,
      items: qbItems,
      customerCount: qbCustomers.length,
      itemCount: qbItems.length
    }
  });
});

// Find matching customer in QuickBooks data
function findQBCustomer(customerName: string, customerEmail?: string): QBCustomer | null {
  // Try exact name match first
  let customer = qbCustomers.find(c => 
    c.name.toLowerCase() === customerName.toLowerCase()
  );
  
  // Try email match if no name match
  if (!customer && customerEmail) {
    customer = qbCustomers.find(c => 
      c.email?.toLowerCase() === customerEmail.toLowerCase()
    );
  }
  
  // Try partial name match
  if (!customer) {
    customer = qbCustomers.find(c => 
      c.name.toLowerCase().includes(customerName.toLowerCase()) ||
      customerName.toLowerCase().includes(c.name.toLowerCase())
    );
  }
  
  return customer || null;
}

// Find matching items in QuickBooks data
function findQBItems(requestedItems: InvoiceRequest['items']): Array<{
  qbItem: QBItem;
  quantity: number;
  unitPrice: number;
  amount: number;
}> {
  const matchedItems: Array<{
    qbItem: QBItem;
    quantity: number;
    unitPrice: number;
    amount: number;
  }> = [];
  
  for (const requestedItem of requestedItems) {
    // Try to find matching item by ID or name
    let qbItem = qbItems.find(item => 
      item.id === requestedItem.itemId ||
      item.name.toLowerCase() === requestedItem.name.toLowerCase()
    );
    
    // If no exact match, try partial name match
    if (!qbItem) {
      qbItem = qbItems.find(item => 
        item.name.toLowerCase().includes(requestedItem.name.toLowerCase()) ||
        requestedItem.name.toLowerCase().includes(item.name.toLowerCase())
      );
    }
    
    if (qbItem) {
      matchedItems.push({
        qbItem,
        quantity: requestedItem.quantity,
        unitPrice: requestedItem.unitPrice || qbItem.unitPrice,
        amount: requestedItem.amount
      });
    }
  }
  
  return matchedItems;
}

// Create invoice automation
router.post('/create-invoice', async (req, res) => {
  try {
    const invoiceRequest: InvoiceRequest = req.body;
    
    if (!invoiceRequest.customerId && !invoiceRequest.customerName) {
      return res.status(400).json({
        success: false,
        error: 'Customer ID or customer name is required'
      });
    }
    
    if (!invoiceRequest.items || invoiceRequest.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invoice items are required'
      });
    }
    
    // Find matching customer
    const qbCustomer = findQBCustomer(invoiceRequest.customerName, invoiceRequest.customerEmail);
    
    if (!qbCustomer) {
      return res.status(404).json({
        success: false,
        error: `Customer '${invoiceRequest.customerName}' not found in QuickBooks data`,
        availableCustomers: qbCustomers.slice(0, 5).map(c => c.name)
      });
    }
    
    // Find matching items
    const matchedItems = findQBItems(invoiceRequest.items);
    
    if (matchedItems.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No matching items found in QuickBooks data',
        requestedItems: invoiceRequest.items.map(i => i.name),
        availableItems: qbItems.slice(0, 5).map(i => i.name)
      });
    }
    
    // Calculate total
    const calculatedTotal = matchedItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Create invoice data for QuickBooks API
    const invoiceData = {
      customerId: qbCustomer.id,
      customerName: qbCustomer.name,
      items: matchedItems.map(item => ({
        itemId: item.qbItem.id,
        name: item.qbItem.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount
      })),
      totalAmount: calculatedTotal,
      originalRequest: invoiceRequest
    };
    
    // Log the invoice creation attempt
    console.log('Invoice automation:', {
      customer: qbCustomer.name,
      itemCount: matchedItems.length,
      total: calculatedTotal,
      dealId: invoiceRequest.dealId
    });
    
    // TODO: When QuickBooks API is working, create actual invoice
    // For now, return the prepared invoice data
    res.json({
      success: true,
      message: 'Invoice data prepared successfully',
      invoice: invoiceData,
      matched: {
        customer: qbCustomer,
        items: matchedItems,
        totalMatched: matchedItems.length,
        totalRequested: invoiceRequest.items.length
      }
    });
    
  } catch (error) {
    console.error('Invoice automation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process invoice automation'
    });
  }
});

// Automated invoice creation when deals close in CRM
router.post('/auto-invoice-from-deal', async (req, res) => {
  try {
    const { dealId, contactName, contactEmail, dealValue, products } = req.body;
    
    if (!dealId || !contactName) {
      return res.status(400).json({
        success: false,
        error: 'Deal ID and contact name are required'
      });
    }
    
    // Convert CRM deal data to invoice format
    const invoiceRequest: InvoiceRequest = {
      customerId: '',
      customerName: contactName,
      customerEmail: contactEmail,
      items: products || [{
        itemId: 'default-service',
        name: 'Professional Services',
        description: `Services for deal ${dealId}`,
        quantity: 1,
        unitPrice: dealValue || 0,
        amount: dealValue || 0
      }],
      totalAmount: dealValue || 0,
      dealId,
      crmSource: 'hubspot'
    };
    
    // Use the main invoice creation logic
    req.body = invoiceRequest;
    return router.stack.find(layer => 
      layer.route?.path === '/create-invoice' && 
      layer.route?.methods?.post
    )?.handle(req, res) || res.status(500).json({ error: 'Route not found' });
    
  } catch (error) {
    console.error('Auto-invoice error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create automatic invoice'
    });
  }
});

export { router as invoiceRouter };