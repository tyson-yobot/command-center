import axios from 'axios';
import { generateAIResponse } from './aiSupportAgent';
import { dispatchSupportResponse } from './supportDispatcher';

interface VoiceBotEscalationData {
  callId: string;
  customerName: string;
  customerPhone: string;
  transcript: string;
  escalationReason: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'hostile';
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Handle VoiceBot escalation by creating support ticket automatically
 */
export async function handleVoiceBotEscalation(data: VoiceBotEscalationData): Promise<{ success: boolean; ticketId?: string; error?: string }> {
  const { callId, customerName, customerPhone, transcript, escalationReason, sentiment, urgency } = data;
  
  try {
    // Generate unique ticket ID based on call
    const ticketId = `voice_${callId}_${Date.now()}`;
    
    // Format ticket body with voice context
    const ticketBody = `
**Voice Call Escalation**
Customer: ${customerName}
Phone: ${customerPhone}
Escalation Reason: ${escalationReason}
Call Sentiment: ${sentiment}
Urgency Level: ${urgency}

**Call Transcript:**
${transcript}

**Action Required:** This customer has been escalated from our VoiceBot system and requires immediate human attention.
    `.trim();

    // Generate AI response for the escalated ticket
    const aiResponse = await generateAIResponse({
      ticketId,
      clientName: customerName,
      ticketBody,
      topic: 'Voice Escalation'
    });

    // Dispatch the support response through our established flow
    await dispatchSupportResponse({
      ticketId,
      clientName: customerName,
      topic: 'Voice Escalation',
      aiReply: aiResponse.reply,
      escalationFlag: true, // Always true for voice escalations
      sentiment: aiResponse.sentiment,
      mp3Filename: undefined // No MP3 for voice escalations initially
    });

    console.log(`✅ Voice escalation processed for ${customerName} (${ticketId})`);

    return {
      success: true,
      ticketId
    };

  } catch (error: any) {
    console.error('Voice escalation processing error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Webhook endpoint handler for VoiceBot escalations
 */
export async function processVoiceBotWebhook(webhookData: any): Promise<{ success: boolean; message: string; ticketId?: string }> {
  try {
    // Extract escalation data from webhook payload
    const escalationData: VoiceBotEscalationData = {
      callId: webhookData.call_id || webhookData.callId || `call_${Date.now()}`,
      customerName: webhookData.customer_name || webhookData.name || 'Unknown Caller',
      customerPhone: webhookData.customer_phone || webhookData.phone || 'Unknown Number',
      transcript: webhookData.transcript || webhookData.call_transcript || '',
      escalationReason: webhookData.escalation_reason || webhookData.reason || 'Customer requested human agent',
      sentiment: mapSentiment(webhookData.sentiment),
      urgency: mapUrgency(webhookData.urgency || webhookData.priority)
    };

    const result = await handleVoiceBotEscalation(escalationData);
    
    if (result.success) {
      return {
        success: true,
        message: `Voice escalation processed successfully for ${escalationData.customerName}`,
        ticketId: result.ticketId
      };
    } else {
      return {
        success: false,
        message: `Failed to process voice escalation: ${result.error}`
      };
    }

  } catch (error: any) {
    console.error('VoiceBot webhook processing error:', error);
    return {
      success: false,
      message: `Webhook processing failed: ${error.message}`
    };
  }
}

/**
 * Map webhook sentiment values to our standard format
 */
function mapSentiment(sentiment: string): 'positive' | 'neutral' | 'negative' | 'hostile' {
  if (!sentiment) return 'neutral';
  
  const lowerSentiment = sentiment.toLowerCase();
  if (lowerSentiment.includes('positive') || lowerSentiment.includes('happy')) return 'positive';
  if (lowerSentiment.includes('negative') || lowerSentiment.includes('upset')) return 'negative';
  if (lowerSentiment.includes('hostile') || lowerSentiment.includes('angry')) return 'hostile';
  return 'neutral';
}

/**
 * Map webhook urgency values to our standard format
 */
function mapUrgency(urgency: string): 'low' | 'medium' | 'high' | 'critical' {
  if (!urgency) return 'medium';
  
  const lowerUrgency = urgency.toLowerCase();
  if (lowerUrgency.includes('critical') || lowerUrgency.includes('urgent')) return 'critical';
  if (lowerUrgency.includes('high')) return 'high';
  if (lowerUrgency.includes('low')) return 'low';
  return 'medium';
}
