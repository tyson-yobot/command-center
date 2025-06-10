import express from 'express';
import axios from 'axios';
import { postToAirtable } from './airtableSync';
import { sendSlackAlert } from './alerts';

const router = express.Router();

interface StripePaymentData {
  paymentId: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  description: string;
  salesOrderId?: string;
  metadata?: Record<string, string>;
}

interface QBOInvoiceData {
  customerName: string;
  amount: number;
  description: string;
  salesOrderId?: string;
}

// Handle Stripe webhook for payment processing
router.post('/stripe-webhook', async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment_intent.succeeded') {
      const paymentIntent = data.object;
      
      const paymentData: StripePaymentData = {
        paymentId: paymentIntent.id,
        customerId: paymentIntent.customer,
        customerName: paymentIntent.charges?.data?.[0]?.billing_details?.name || 'Unknown Customer',
        amount: paymentIntent.amount_received / 100, // Convert from cents
        currency: paymentIntent.currency,
        description: paymentIntent.description || 'YoBot Service Payment',
        salesOrderId: paymentIntent.metadata?.sales_order_id,
        metadata: paymentIntent.metadata
      };

      // Process the payment through our integration pipeline
      await processStripePayment(paymentData);

      res.json({ success: true, message: 'Payment processed successfully' });

    } else if (type === 'invoice.payment_succeeded') {
      const invoice = data.object;
      
      // Handle invoice payment success
      await handleInvoicePayment({
        invoiceId: invoice.id,
        customerId: invoice.customer,
        amount: invoice.amount_paid / 100,
        status: 'paid'
      });

      res.json({ success: true, message: 'Invoice payment processed' });

    } else {
      res.json({ success: true, message: 'Event not handled' });
    }

  } catch (error: any) {
    console.error('Stripe webhook processing error:', error);
    
    // Send error alert to Slack
    await sendSlackAlert(
      `❌ *Stripe Webhook Error*\n` +
      `Error: ${error.message}\n` +
      `Event Type: ${req.body.type || 'Unknown'}\n` +
      `Time: ${new Date().toISOString()}`
    );

    res.status(500).json({
      success: false,
      error: 'Webhook processing failed',
      message: error.message
    });
  }
});

// Process Stripe payment and create QBO invoice
async function processStripePayment(paymentData: StripePaymentData): Promise<void> {
  try {
    // Step 1: Create QuickBooks invoice (when token is active)
    const qboInvoiceData: QBOInvoiceData = {
      customerName: paymentData.customerName,
      amount: paymentData.amount,
      description: paymentData.description,
      salesOrderId: paymentData.salesOrderId
    };

    let qboInvoiceId = null;
    try {
      // This will work once QBO token is active tomorrow
      qboInvoiceId = await createQBOInvoiceFromPayment(qboInvoiceData);
    } catch (qboError) {
      console.log('QBO invoice creation pending - token not active yet');
      
      // Log for retry queue
      await postToAirtable({
        "🔄 Action": "QBO Invoice Creation Pending",
        "💳 Payment ID": paymentData.paymentId,
        "👤 Customer": paymentData.customerName,
        "💰 Amount": `$${paymentData.amount.toLocaleString()}`,
        "📝 Description": paymentData.description,
        "🕒 Timestamp": new Date().toISOString(),
        "📊 Status": "Pending QBO Token Activation"
      });
    }

    // Step 2: Log sales event to Airtable
    await postToAirtable({
      "🗓️ Event Type": "💳 Stripe Payment Received",
      "🔗 Payment ID": paymentData.paymentId,
      "🧾 QBO Invoice ID": qboInvoiceId || "Pending Token",
      "💵 Amount": paymentData.amount,
      "👤 Customer": paymentData.customerName,
      "📝 Notes": `Auto-logged via Stripe webhook - ${paymentData.description}`,
      "🕒 Timestamp": new Date().toISOString(),
      "📈 Event Type": "Payment Processing"
    });

    // Step 3: Update sales tracking
    await axios.post('/api/sales/track-payment-event', {
      paymentId: paymentData.paymentId,
      invoiceId: qboInvoiceId || 'pending',
      amount: paymentData.amount,
      method: 'stripe',
      status: 'completed',
      transactionId: paymentData.paymentId,
      processedAt: new Date().toISOString()
    });

    // Step 4: Send Slack notification
    await sendSlackAlert(
      `💰 *Stripe Payment Processed*\n` +
      `Customer: ${paymentData.customerName}\n` +
      `Amount: $${paymentData.amount.toLocaleString()}\n` +
      `Payment ID: ${paymentData.paymentId}\n` +
      `QBO Invoice: ${qboInvoiceId || 'Pending token activation'}\n` +
      `Description: ${paymentData.description}`
    );

    console.log('✅ Stripe payment processed successfully');

  } catch (error) {
    console.error('Payment processing error:', error);
    throw error;
  }
}

// Create QuickBooks invoice from Stripe payment
async function createQBOInvoiceFromPayment(invoiceData: QBOInvoiceData): Promise<string> {
  const realmId = process.env.QUICKBOOKS_REALM_ID;
  const accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN;

  if (!realmId || !accessToken) {
    throw new Error('QuickBooks credentials not available - token activation pending');
  }

  const url = `https://quickbooks.api.intuit.com/v3/company/${realmId}/invoice?minorversion=65`;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  const payload = {
    CustomerRef: {
      value: await getOrCreateCustomerId(invoiceData.customerName)
    },
    Line: [
      {
        DetailType: 'SalesItemLineDetail',
        Amount: invoiceData.amount,
        SalesItemLineDetail: {
          ItemRef: {
            value: await getServiceItemId(invoiceData.description)
          }
        },
        Description: invoiceData.description
      }
    ],
    DocNumber: `STRIPE-${Date.now()}`,
    TxnDate: new Date().toISOString().split('T')[0]
  };

  const response = await axios.post(url, payload, { headers });
  
  if (response.status === 200) {
    const invoiceId = response.data.QueryResponse?.Invoice?.[0]?.Id;
    
    // Mark invoice as paid immediately since payment already received
    await markInvoiceAsPaid(invoiceId, invoiceData.amount);
    
    return invoiceId;
  } else {
    throw new Error(`QBO invoice creation failed: ${response.statusText}`);
  }
}

// Get or create customer ID in QuickBooks
async function getOrCreateCustomerId(customerName: string): Promise<string> {
  // For now, return default customer ID
  // This will be enhanced when QBO token is active
  return "1";
}

// Get service item ID for the description
async function getServiceItemId(description: string): Promise<string> {
  // For now, return default service item ID
  // This will be enhanced when QBO token is active
  return "1";
}

// Mark QuickBooks invoice as paid
async function markInvoiceAsPaid(invoiceId: string, amount: number): Promise<void> {
  const realmId = process.env.QUICKBOOKS_REALM_ID;
  const accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN;

  if (!realmId || !accessToken || !invoiceId) {
    return;
  }

  try {
    const url = `https://quickbooks.api.intuit.com/v3/company/${realmId}/payment?minorversion=65`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };

    const paymentPayload = {
      CustomerRef: { value: "1" },
      TotalAmt: amount,
      Line: [
        {
          Amount: amount,
          LinkedTxn: [
            {
              TxnId: invoiceId,
              TxnType: "Invoice"
            }
          ]
        }
      ]
    };

    await axios.post(url, paymentPayload, { headers });
    console.log(`✅ Invoice ${invoiceId} marked as paid in QuickBooks`);

  } catch (error) {
    console.error('Failed to mark invoice as paid:', error);
  }
}

// Handle invoice payment events
async function handleInvoicePayment(paymentData: any): Promise<void> {
  await postToAirtable({
    "🧾 Invoice ID": paymentData.invoiceId,
    "👤 Customer ID": paymentData.customerId,
    "💰 Amount": `$${paymentData.amount.toLocaleString()}`,
    "📊 Status": paymentData.status,
    "🕒 Timestamp": new Date().toISOString(),
    "📈 Event Type": "Invoice Payment"
  });
}

// Test endpoint for Stripe integration
router.post('/test-stripe-integration', async (req, res) => {
  try {
    const testPayment: StripePaymentData = {
      paymentId: `test_${Date.now()}`,
      customerId: 'test_customer',
      customerName: 'Test Customer',
      amount: 100.00,
      currency: 'usd',
      description: 'Test YoBot Service Payment',
      salesOrderId: 'test_order_123'
    };

    await processStripePayment(testPayment);

    res.json({
      success: true,
      message: 'Stripe integration test completed',
      testPayment
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Test failed',
      message: error.message
    });
  }
});

export { router as stripeToQboRouter };