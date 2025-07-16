import type { Express } from "express";
import { SALES_ORDERS_TABLE, tableUrl } from "../../shared/airtableConfig";

// Real sales order processing with Airtable and payment integration
export function registerRealSalesOrderRoutes(app: Express) {

  // Real Sales Order Processing
  app.post("/api/sales-order", async (req, res) => {
    try {
      const { orderData, testMode = false } = req.body;
      const timestamp = new Date().toISOString();
      
      // Validate required fields
      if (!orderData.customerInfo?.name || !orderData.customerInfo?.email) {
        return res.status(400).json({ 
          success: false, 
          error: "Customer name and email are required" 
        });
      }

      let airtableRecordId = null;
      let stripePaymentIntentId = null;
      let qboInvoiceId = null;
      
      // Calculate totals
      const baseProducts = orderData.products || [];
      const addOns = orderData.addOns || [];
      
      const subtotal = baseProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0) +
                     addOns.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0);
      
      const tax = subtotal * 0.08875; // NY tax rate
      const total = subtotal + tax;

      // Create Airtable record if not test mode
      if (!testMode && process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
        try {
          const airtablePayload = {
            records: [{
              fields: {
                'Customer Name': orderData.customerInfo.name,
                'Customer Email': orderData.customerInfo.email,
                'Customer Phone': orderData.customerInfo.phone || '',
                'Company': orderData.customerInfo.company || '',
                'Order Date': timestamp,
                'Products': baseProducts.map(p => `${p.name} (${p.quantity}x)`).join(', '),
                'Add-ons': addOns.map(a => `${a.name} (${a.quantity}x)`).join(', '),
                'Subtotal': subtotal,
                'Tax': tax,
                'Total': total,
                'Status': 'Pending',
                'Source': 'YoBot Command Center',
                'Order Type': orderData.orderType || 'Standard'
              }
            }]
          };

          const airtableResponse = await fetch(tableUrl(process.env.AIRTABLE_BASE_ID as string, SALES_ORDERS_TABLE), {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(airtablePayload)
          });

          if (airtableResponse.ok) {
            const airtableData = await airtableResponse.json();
            airtableRecordId = airtableData.records[0].id;
          } else {
            console.error('Airtable creation failed:', await airtableResponse.text());
          }
        } catch (airtableError) {
          console.error('Airtable error:', airtableError);
        }
      }

      // Create Stripe payment intent if not test mode
      if (!testMode && process.env.STRIPE_SECRET_KEY && total > 0) {
        try {
          const stripePayload = {
            amount: Math.round(total * 100), // Convert to cents
            currency: 'usd',
            automatic_payment_methods: { enabled: true },
            metadata: {
              customer_name: orderData.customerInfo.name,
              customer_email: orderData.customerInfo.email,
              airtable_record_id: airtableRecordId || '',
              order_timestamp: timestamp
            }
          };

          const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(stripePayload as any)
          });

          if (stripeResponse.ok) {
            const stripeData = await stripeResponse.json();
            stripePaymentIntentId = stripeData.id;
          } else {
            console.error('Stripe payment intent failed:', await stripeResponse.text());
          }
        } catch (stripeError) {
          console.error('Stripe error:', stripeError);
        }
      }

      // Create QuickBooks invoice if not test mode
      if (!testMode && process.env.QUICKBOOKS_ACCESS_TOKEN && process.env.QUICKBOOKS_REALM_ID) {
        try {
          const qboLineItems = [
            ...baseProducts.map(product => ({
              Amount: product.price * product.quantity,
              DetailType: "SalesItemLineDetail",
              SalesItemLineDetail: {
                ItemRef: { value: "1", name: product.name },
                Qty: product.quantity,
                UnitPrice: product.price
              }
            })),
            ...addOns.map(addon => ({
              Amount: addon.price * addon.quantity,
              DetailType: "SalesItemLineDetail", 
              SalesItemLineDetail: {
                ItemRef: { value: "2", name: addon.name },
                Qty: addon.quantity,
                UnitPrice: addon.price
              }
            }))
          ];

          const qboPayload = {
            Invoice: {
              Line: qboLineItems,
              CustomerRef: { name: orderData.customerInfo.name },
              BillEmail: { Address: orderData.customerInfo.email },
              DocNumber: `YB-${Date.now()}`,
              DueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          };

          const qboResponse = await fetch(`https://sandbox-quickbooks.api.intuit.com/v3/company/${process.env.QUICKBOOKS_REALM_ID}/invoice`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.QUICKBOOKS_ACCESS_TOKEN}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(qboPayload)
          });

          if (qboResponse.ok) {
            const qboData = await qboResponse.json();
            qboInvoiceId = qboData.QueryResponse?.Invoice?.[0]?.Id;
          } else {
            console.error('QuickBooks invoice failed:', await qboResponse.text());
          }
        } catch (qboError) {
          console.error('QuickBooks error:', qboError);
        }
      }

      // Send Slack notification
      if (process.env.SLACK_WEBHOOK_URL) {
        try {
          const slackMessage = {
            text: `🛒 New Sales Order [${testMode ? 'TEST' : 'LIVE'}]: ${orderData.customerInfo.name} - $${total.toFixed(2)}`,
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: `*New Sales Order Received*\n• Customer: ${orderData.customerInfo.name}\n• Email: ${orderData.customerInfo.email}\n• Total: $${total.toFixed(2)}\n• Mode: ${testMode ? 'TEST' : 'LIVE'}`
                }
              },
              {
                type: "section",
                fields: [
                  { type: "mrkdwn", text: `*Airtable ID:*\n${airtableRecordId || 'Not created'}` },
                  { type: "mrkdwn", text: `*Stripe Payment:*\n${stripePaymentIntentId || 'Not created'}` },
                  { type: "mrkdwn", text: `*QBO Invoice:*\n${qboInvoiceId || 'Not created'}` },
                  { type: "mrkdwn", text: `*Timestamp:*\n${timestamp}` }
                ]
              }
            ]
          };

          await fetch(process.env.SLACK_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slackMessage)
          });
        } catch (slackError) {
          console.error('Slack notification failed:', slackError);
        }
      }

      // Log the complete transaction
      const orderLog = {
        timestamp,
        customerName: orderData.customerInfo.name,
        customerEmail: orderData.customerInfo.email,
        total,
        airtableRecordId,
        stripePaymentIntentId,
        qboInvoiceId,
        testMode,
        status: 'PROCESSED'
      };

      console.log('Sales Order Processing Log:', orderLog);

      res.json({
        success: true,
        orderId: airtableRecordId || `test-${Date.now()}`,
        airtableRecordId,
        stripePaymentIntentId,
        qboInvoiceId,
        total: total.toFixed(2),
        testMode,
        timestamp,
        logEntry: orderLog
      });

    } catch (error) {
      console.error('Sales order processing error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Sales order status check
  app.get("/api/sales-order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        return res.json({ 
          success: false, 
          error: "Airtable not configured",
          orderId 
        });
      }

      const airtableResponse = await fetch(
        `${tableUrl(process.env.AIRTABLE_BASE_ID as string, SALES_ORDERS_TABLE)}/${orderId}`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
          }
        }
      );

      if (airtableResponse.ok) {
        const orderData = await airtableResponse.json();
        res.json({
          success: true,
          order: orderData.fields,
          orderId
        });
      } else {
        res.status(404).json({
          success: false,
          error: "Order not found",
          orderId
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get recent sales orders
  app.get("/api/sales-orders/recent", async (req, res) => {
    try {
      if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
        return res.json({ 
          success: false, 
          error: "Airtable not configured",
          orders: []
        });
      }

      const airtableResponse = await fetch(
        `${tableUrl(process.env.AIRTABLE_BASE_ID as string, SALES_ORDERS_TABLE)}?maxRecords=50&sort[0][field]=Order Date&sort[0][direction]=desc`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`
          }
        }
      );

      if (airtableResponse.ok) {
        const ordersData = await airtableResponse.json();
        res.json({
          success: true,
          orders: ordersData.records.map(record => ({
            id: record.id,
            ...record.fields
          }))
        });
      } else {
        res.status(500).json({
          success: false,
          error: "Failed to fetch orders"
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}
