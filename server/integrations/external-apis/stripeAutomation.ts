import { Request, Response } from "express";
import Stripe from "stripe";
import { logEventSync, logClientROI } from "./airtableIntegrations";
import axios from "axios";

// Initialize Stripe (will be configured when user provides API key)
let stripe: Stripe | null = null;

function getStripeInstance(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY not configured");
  }
  
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
  }
  
  return stripe;
}

// 021 - Trigger Stripe Product SKU (One-Time)
export async function createStripeOneTimeCharge(req: Request, res: Response) {
  try {
    const { customerEmail, productSKU, successUrl, cancelUrl } = req.body;

    if (!customerEmail || !productSKU) {
      return res.status(400).json({ 
        error: "Customer email and product SKU are required" 
      });
    }

    const stripeInstance = getStripeInstance();

    const session = await stripeInstance.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: [{ 
        price: productSKU, 
        quantity: 1 
      }],
      mode: "payment",
      success_url: successUrl || `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/cancel`,
      metadata: {
        client_id: req.body.clientId || 'unknown',
        source: 'yobot_automation'
      }
    });

    // Log the checkout session creation
    try {
      await logEventSync({
        eventType: "stripe_checkout_created",
        source: "Stripe API",
        destination: "Checkout Session",
        status: "success",
        timestamp: new Date().toISOString(),
        recordCount: 1
      });
    } catch (error: any) {
      console.warn("Failed to log Stripe checkout event:", error.message);
    }

    res.json({
      success: true,
      message: "Stripe checkout session created",
      checkout_url: session.url,
      session_id: session.id,
      customer_email: customerEmail,
      product_sku: productSKU
    });

  } catch (error: any) {
    console.error("Stripe one-time charge failed:", error);
    res.status(500).json({
      error: "Failed to create Stripe checkout session",
      details: error.message
    });
  }
}

// 030 - Stripe Subscription Start (Monthly Recurring)
export async function createMonthlySubscription(req: Request, res: Response) {
  try {
    const { email, priceId, successUrl, cancelUrl } = req.body;

    if (!email || !priceId) {
      return res.status(400).json({ 
        error: "Email and price ID are required" 
      });
    }

    const stripeInstance = getStripeInstance();

    const session = await stripeInstance.checkout.sessions.create({
      customer_email: email,
      line_items: [{ 
        price: priceId, 
        quantity: 1 
      }],
      mode: "subscription",
      success_url: successUrl || `${req.protocol}://${req.get('host')}/sub-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/sub-cancel`,
      metadata: {
        client_id: req.body.clientId || 'unknown',
        subscription_type: 'monthly_recurring',
        source: 'yobot_automation'
      }
    });

    // Log the subscription creation
    try {
      await logEventSync({
        eventType: "stripe_subscription_created",
        source: "Stripe API",
        destination: "Subscription Session",
        status: "success",
        timestamp: new Date().toISOString(),
        recordCount: 1
      });
    } catch (error: any) {
      console.warn("Failed to log Stripe subscription event:", error.message);
    }

    res.json({
      success: true,
      message: "Stripe subscription session created",
      checkout_url: session.url,
      session_id: session.id,
      customer_email: email,
      price_id: priceId,
      subscription_type: "monthly_recurring"
    });

  } catch (error: any) {
    console.error("Stripe subscription creation failed:", error);
    res.status(500).json({
      error: "Failed to create Stripe subscription session",
      details: error.message
    });
  }
}

// 022 - Stripe Webhook → Airtable Sync
export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    const sig = req.headers['stripe-signature'] as string;
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ 
        error: "Stripe webhook secret not configured" 
      });
    }

    const stripeInstance = getStripeInstance();
    
    let event: Stripe.Event;
    try {
      event = stripeInstance.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true, event_type: event.type });

  } catch (error: any) {
    console.error("Stripe webhook handling failed:", error);
    res.status(500).json({
      error: "Failed to process Stripe webhook",
      details: error.message
    });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    // Log to Airtable via existing integration
    await logEventSync({
      eventType: "stripe_payment_completed",
      source: "Stripe Webhook",
      destination: "Airtable",
      status: "success",
      timestamp: new Date().toISOString(),
      recordCount: 1
    });

    // Send Slack notification if configured
    if (process.env.SLACK_WEBHOOK_URL) {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `💰 Payment completed: ${session.customer_email} - $${(session.amount_total || 0) / 100}`,
        channel: '#sales-notifications'
      });
    }

  } catch (error: any) {
    console.error("Failed to handle checkout completion:", error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    await logEventSync({
      eventType: "stripe_subscription_started",
      source: "Stripe Webhook",
      destination: "Airtable",
      status: "success",
      timestamp: new Date().toISOString(),
      recordCount: 1
    });

    if (process.env.SLACK_WEBHOOK_URL) {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🎯 New subscription started: Customer ${subscription.customer} - $${(subscription.items.data[0]?.price.unit_amount || 0) / 100}/month`,
        channel: '#sales-notifications'
      });
    }

  } catch (error: any) {
    console.error("Failed to handle subscription creation:", error);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    await logEventSync({
      eventType: "stripe_payment_succeeded",
      source: "Stripe Webhook",
      destination: "Airtable",
      status: "success",
      timestamp: new Date().toISOString(),
      recordCount: 1
    });

  } catch (error: any) {
    console.error("Failed to handle payment success:", error);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    await logEventSync({
      eventType: "stripe_payment_failed",
      source: "Stripe Webhook",
      destination: "Airtable",
      status: "failed",
      timestamp: new Date().toISOString(),
      recordCount: 1
    });

    // Alert for failed payments
    if (process.env.SLACK_WEBHOOK_URL) {
      await axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `🚨 Payment failed: Customer ${invoice.customer} - $${(invoice.amount_due || 0) / 100}`,
        channel: '#payment-alerts'
      });
    }

  } catch (error: any) {
    console.error("Failed to handle payment failure:", error);
  }
}

// Test Stripe integration
export async function testStripeIntegration(req: Request, res: Response) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({
        error: "Stripe integration requires API key",
        message: "Please provide STRIPE_SECRET_KEY to test payment processing"
      });
    }

    const stripeInstance = getStripeInstance();
    
    // Test API connection
    const account = await stripeInstance.accounts.retrieve();
    
    res.json({
      success: true,
      message: "Stripe integration is working",
      account_id: account.id,
      country: account.country,
      capabilities: account.capabilities,
      available_endpoints: [
        "POST /api/stripe/create-checkout - One-time payments",
        "POST /api/stripe/create-subscription - Monthly subscriptions",
        "POST /api/stripe/webhook - Webhook handler"
      ]
    });

  } catch (error: any) {
    res.status(500).json({
      error: "Stripe integration test failed",
      details: error.message
    });
  }
}