import express from 'express';
import { broadcastUpdate } from './websocket';

// Core webhook payload structure
interface WebhookPayload {
  event_type: 'bot_action' | 'crm_sync' | 'lead_capture' | 'automation_status';
  timestamp: string;
  bot_id: string;
  status: 'success' | 'error' | 'processing';
  data: {
    lead_id?: string;
    action: 'lead_captured' | 'email_sent' | 'meeting_booked' | 'call_escalation' | 'pipeline_update';
    confidence_score?: number;
    processing_time_ms?: number;
    value?: string;
    client_name?: string;
    error_details?: string;
    queue_depth?: number;
    scenario_id?: string;
  };
}

export const webhookRouter = express.Router();

// Main webhook intake endpoint
webhookRouter.post('/webhook/intake', async (req, res) => {
  try {
    const payload: WebhookPayload = req.body;
    
    // Validate webhook structure
    if (!payload.event_type || !payload.bot_id || !payload.status) {
      return res.status(400).json({ error: 'Invalid webhook payload structure' });
    }

    // Process different webhook types
    await processWebhookEvent(payload);
    
    // Send immediate response to webhook sender
    res.status(200).json({ 
      success: true, 
      processed_at: new Date().toISOString(),
      event_id: `${payload.bot_id}_${Date.now()}`
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Lambda event processing
async function processWebhookEvent(payload: WebhookPayload) {
  const processingStartTime = Date.now();
  
  try {
    // Update metrics based on webhook type
    await updateRealTimeMetrics(payload);
    
    // Broadcast to connected clients via WebSocket
    await broadcastDashboardUpdate(payload);
    
    // Handle specific automation events
    await handleAutomationEvent(payload);
    
    const processingTime = Date.now() - processingStartTime;
    console.log(`Webhook processed in ${processingTime}ms:`, payload.event_type);
    
  } catch (error) {
    console.error('Error processing webhook event:', error);
    
    // Send error notification to dashboard
    broadcastUpdate({
      type: 'WEBHOOK_ERROR',
      error: {
        event_type: payload.event_type,
        error_message: error.message,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Real-time metrics updates
async function updateRealTimeMetrics(payload: WebhookPayload) {
  const metricsUpdate = {
    type: 'METRICS_UPDATE',
    timestamp: payload.timestamp,
    data: {}
  };

  switch (payload.data.action) {
    case 'lead_captured':
      metricsUpdate.data = {
        new_leads: 1,
        processing_speed: payload.data.processing_time_ms,
        confidence_score: payload.data.confidence_score
      };
      break;
      
    case 'email_sent':
      metricsUpdate.data = {
        emails_sent: 1,
        automation_health: payload.status === 'success' ? 'good' : 'warning'
      };
      break;
      
    case 'meeting_booked':
      metricsUpdate.data = {
        meetings_booked: 1,
        conversion_event: true,
        deal_value: payload.data.value
      };
      break;
      
    case 'call_escalation':
      metricsUpdate.data = {
        escalations: 1,
        urgent_attention_required: true,
        client_name: payload.data.client_name,
        deal_value: payload.data.value
      };
      break;
  }

  // Broadcast metrics update
  broadcastUpdate(metricsUpdate);
}

// Dashboard real-time updates
async function broadcastDashboardUpdate(payload: WebhookPayload) {
  const dashboardUpdate = {
    type: 'LIVE_ACTIVITY',
    activity: {
      id: `${payload.bot_id}_${Date.now()}`,
      action: payload.data.action,
      client: payload.data.client_name || 'Unknown Client',
      value: payload.data.value || '$0',
      status: payload.status,
      timestamp: payload.timestamp,
      confidence: payload.data.confidence_score,
      processing_time: payload.data.processing_time_ms
    }
  };

  // Send to all connected clients
  broadcastUpdate(dashboardUpdate);
}

// Handle specific automation events
async function handleAutomationEvent(payload: WebhookPayload) {
  // Handle critical escalations
  if (payload.data.action === 'call_escalation' && payload.status === 'success') {
    const { sendCriticalNotification } = await import('./pushNotifications');
    
    await sendCriticalNotification({
      title: '🚨 URGENT CALL ESCALATION',
      body: `${payload.data.client_name} needs immediate assistance - ${payload.data.value} deal at risk`,
      type: 'call_escalation',
      priority: 'critical'
    });
  }
  
  // Handle automation failures
  if (payload.status === 'error') {
    broadcastUpdate({
      type: 'AUTOMATION_ERROR',
      error: {
        scenario_id: payload.data.scenario_id,
        action: payload.data.action,
        error_details: payload.data.error_details,
        timestamp: payload.timestamp,
        requires_review: true
      }
    });
  }
  
  // Update queue depths
  if (payload.data.queue_depth !== undefined) {
    broadcastUpdate({
      type: 'QUEUE_UPDATE',
      queue: {
        action_type: payload.data.action,
        depth: payload.data.queue_depth,
        status: payload.status,
        timestamp: payload.timestamp
      }
    });
  }
}

// Make Scenario Status endpoint
webhookRouter.post('/webhook/make-status', async (req, res) => {
  try {
    const { scenario_id, status, execution_time, success_rate, error_count } = req.body;
    
    broadcastUpdate({
      type: 'MAKE_SCENARIO_STATUS',
      scenario: {
        id: scenario_id,
        status,
        execution_time,
        success_rate,
        error_count,
        timestamp: new Date().toISOString()
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process Make status update' });
  }
});

// Bot response time tracking
webhookRouter.post('/webhook/performance', async (req, res) => {
  try {
    const { response_time, confidence_score, handoff_required, learning_update } = req.body;
    
    broadcastUpdate({
      type: 'BOT_PERFORMANCE',
      performance: {
        response_time,
        confidence_score,
        handoff_required,
        learning_update,
        timestamp: new Date().toISOString()
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process performance update' });
  }
});

export { processWebhookEvent };