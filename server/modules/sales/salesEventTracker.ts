import express from 'express';
import { postToAirtable } from './airtableSync';
import { sendSlackAlert } from './alerts';

const router = express.Router();

interface SalesEvent {
  dealId: string;
  contactName: string;
  contactEmail?: string;
  dealValue: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  source: 'hubspot' | 'manual' | 'voice_bot' | 'business_card';
}

interface InvoiceEvent {
  invoiceId: string;
  dealId: string;
  customerId: string;
  amount: number;
  status: 'created' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
}

interface PaymentEvent {
  paymentId: string;
  invoiceId: string;
  amount: number;
  method: 'stripe' | 'quickbooks' | 'manual' | 'check' | 'wire';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  processedAt: string;
}

// Track sales event progression
router.post('/track-sales-event', async (req, res) => {
  try {
    const salesEvent: SalesEvent = req.body;
    
    const eventData = {
      "🆔 Deal ID": salesEvent.dealId,
      "👤 Contact Name": salesEvent.contactName,
      "📧 Contact Email": salesEvent.contactEmail || "Not provided",
      "💰 Deal Value": `$${salesEvent.dealValue.toLocaleString()}`,
      "📊 Stage": salesEvent.stage,
      "📍 Source": salesEvent.source,
      "🕒 Timestamp": new Date().toISOString(),
      "📈 Event Type": "Sales Progression"
    };

    // Log to Airtable
    await postToAirtable(eventData);
    
    // Send Slack notification for significant events
    if (salesEvent.stage === 'closed_won') {
      await sendSlackAlert(
        `🎉 *Deal Closed Won!*\n` +
        `Contact: ${salesEvent.contactName}\n` +
        `Value: $${salesEvent.dealValue.toLocaleString()}\n` +
        `Deal ID: ${salesEvent.dealId}\n` +
        `Source: ${salesEvent.source}`
      );
    }

    res.json({
      success: true,
      message: 'Sales event tracked successfully',
      dealId: salesEvent.dealId
    });

  } catch (error) {
    console.error('Sales event tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track sales event'
    });
  }
});

// Track invoice creation and status changes
router.post('/track-invoice-event', async (req, res) => {
  try {
    const invoiceEvent: InvoiceEvent = req.body;
    
    const eventData = {
      "🧾 Invoice ID": invoiceEvent.invoiceId,
      "🆔 Deal ID": invoiceEvent.dealId,
      "👤 Customer ID": invoiceEvent.customerId,
      "💰 Amount": `$${invoiceEvent.amount.toLocaleString()}`,
      "📊 Status": invoiceEvent.status,
      "📅 Due Date": invoiceEvent.dueDate,
      "🕒 Created At": invoiceEvent.createdAt,
      "🕒 Timestamp": new Date().toISOString(),
      "📈 Event Type": "Invoice Management"
    };

    // Log to Airtable
    await postToAirtable(eventData);
    
    // Send alerts for important invoice events
    if (invoiceEvent.status === 'overdue') {
      await sendSlackAlert(
        `⚠️ *Invoice Overdue*\n` +
        `Invoice ID: ${invoiceEvent.invoiceId}\n` +
        `Amount: $${invoiceEvent.amount.toLocaleString()}\n` +
        `Due Date: ${invoiceEvent.dueDate}`
      );
    } else if (invoiceEvent.status === 'paid') {
      await sendSlackAlert(
        `💰 *Invoice Paid*\n` +
        `Invoice ID: ${invoiceEvent.invoiceId}\n` +
        `Amount: $${invoiceEvent.amount.toLocaleString()}\n` +
        `Status: Payment Received`
      );
    }

    res.json({
      success: true,
      message: 'Invoice event tracked successfully',
      invoiceId: invoiceEvent.invoiceId
    });

  } catch (error) {
    console.error('Invoice event tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track invoice event'
    });
  }
});

// Track payment processing and status changes
router.post('/track-payment-event', async (req, res) => {
  try {
    const paymentEvent: PaymentEvent = req.body;
    
    const eventData = {
      "💳 Payment ID": paymentEvent.paymentId,
      "🧾 Invoice ID": paymentEvent.invoiceId,
      "💰 Amount": `$${paymentEvent.amount.toLocaleString()}`,
      "🔄 Method": paymentEvent.method,
      "📊 Status": paymentEvent.status,
      "🔗 Transaction ID": paymentEvent.transactionId || "N/A",
      "🕒 Processed At": paymentEvent.processedAt,
      "🕒 Timestamp": new Date().toISOString(),
      "📈 Event Type": "Payment Processing"
    };

    // Log to Airtable
    await postToAirtable(eventData);
    
    // Revenue recognition tracking for completed payments
    if (paymentEvent.status === 'completed') {
      await postToAirtable({
        "💰 Revenue Amount": `$${paymentEvent.amount.toLocaleString()}`,
        "🧾 Invoice ID": paymentEvent.invoiceId,
        "💳 Payment Method": paymentEvent.method,
        "📅 Recognition Date": new Date().toISOString(),
        "📈 Event Type": "Revenue Recognition",
        "📊 Status": "Recognized"
      });

      await sendSlackAlert(
        `✅ *Payment Completed*\n` +
        `Amount: $${paymentEvent.amount.toLocaleString()}\n` +
        `Method: ${paymentEvent.method}\n` +
        `Invoice: ${paymentEvent.invoiceId}\n` +
        `Transaction: ${paymentEvent.transactionId || 'N/A'}`
      );
    }

    res.json({
      success: true,
      message: 'Payment event tracked successfully',
      paymentId: paymentEvent.paymentId
    });

  } catch (error) {
    console.error('Payment event tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track payment event'
    });
  }
});

// Get sales pipeline analytics
router.get('/sales-analytics', async (req, res) => {
  try {
    // This would typically query your database or Airtable for analytics
    // For now, providing the structure for analytics tracking
    
    const analytics = {
      totalDeals: 0,
      totalRevenue: 0,
      conversionRate: 0,
      averageDealSize: 0,
      pipelineValue: 0,
      invoicesPending: 0,
      paymentsOverdue: 0,
      revenueThisMonth: 0
    };

    res.json({
      success: true,
      analytics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sales analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve sales analytics'
    });
  }
});

export { router as salesEventRouter };
