import { broadcastUpdate } from './websocket';

// Critical notification types that require immediate attention
const CRITICAL_TYPES = ['call_escalation', 'system_critical', 'high_value_deal'];

interface PushNotificationData {
  title: string;
  body: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  userId?: number;
}

/**
 * Send push notification for critical escalations
 * Works even when phone is locked
 */
export async function sendCriticalNotification(data: PushNotificationData) {
  const isCritical = CRITICAL_TYPES.includes(data.type) || data.priority === 'critical';
  
  // Broadcast to connected clients via WebSocket
  broadcastUpdate({
    type: 'CRITICAL_NOTIFICATION',
    notification: {
      ...data,
      timestamp: Date.now(),
      requiresAttention: isCritical
    }
  });

  // For call escalations - also trigger SMS alert as backup
  if (data.type === 'call_escalation') {
    try {
      const { sendEmergencyEscalation } = await import('./sms');
      await sendEmergencyEscalation('call', data.body);
    } catch (error) {
      console.error('Failed to send SMS backup for call escalation:', error);
    }
  }

  return {
    success: true,
    critical: isCritical,
    sentAt: new Date().toISOString()
  };
}

/**
 * Send immediate call escalation alert
 */
export async function escalateCallImmediately(callDetails: {
  clientName: string;
  urgencyLevel: 'urgent' | 'critical';
  estimatedValue?: number;
  context?: string;
}) {
  const notification: PushNotificationData = {
    title: '🚨 URGENT CALL ESCALATION',
    body: `${callDetails.clientName} requires immediate human intervention${callDetails.estimatedValue ? ` - $${callDetails.estimatedValue.toLocaleString()} deal` : ''}`,
    type: 'call_escalation',
    priority: 'critical',
    actionUrl: '/mobile?action=take_call'
  };

  return await sendCriticalNotification(notification);
}

/**
 * Auto-trigger escalation based on conversation analysis
 */
export async function checkForAutoEscalation(conversationData: {
  sentiment: number;
  keywords: string[];
  clientValue: number;
  duration: number;
}) {
  const shouldEscalate = 
    conversationData.sentiment < -0.7 || // Very negative sentiment
    conversationData.keywords.some(k => ['cancel', 'frustrated', 'manager', 'unsubscribe'].includes(k.toLowerCase())) ||
    (conversationData.clientValue > 50000 && conversationData.duration > 300); // High-value client talking for 5+ minutes

  if (shouldEscalate) {
    return await escalateCallImmediately({
      clientName: 'Current Caller',
      urgencyLevel: conversationData.clientValue > 100000 ? 'critical' : 'urgent',
      estimatedValue: conversationData.clientValue,
      context: 'Auto-escalated based on conversation analysis'
    });
  }

  return { escalated: false };
}