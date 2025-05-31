interface EscalationAnalysis {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  triggers: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'hostile';
  recommendedAction: 'auto_reply' | 'manager_review' | 'immediate_escalation' | 'legal_review';
  urgency: number; // 1-10 scale
}

/**
 * Advanced escalation detection with weighted scoring
 */
export function analyzeEscalationRisk(ticketBody: string, clientHistory?: any): EscalationAnalysis {
  const content = ticketBody.toLowerCase();
  
  // Critical escalation triggers (immediate escalation)
  const criticalTriggers = [
    'lawsuit', 'legal action', 'attorney', 'lawyer', 'court', 'sue', 'suing',
    'fraud', 'scam', 'illegal', 'criminal', 'police', 'fbi', 'authorities',
    'bbb complaint', 'better business bureau', 'state attorney general',
    'class action', 'defamation', 'slander', 'libel'
  ];

  // High-risk triggers (manager review)
  const highRiskTriggers = [
    'cancel', 'cancellation', 'refund', 'money back', 'chargeback',
    'dispute', 'complaint', 'review bomb', 'bad review', 'negative review',
    'social media', 'twitter', 'facebook', 'linkedin', 'public',
    'competitor', 'switching to', 'alternative', 'replacement'
  ];

  // Medium-risk triggers (careful monitoring)
  const mediumRiskTriggers = [
    'frustrated', 'angry', 'upset', 'disappointed', 'terrible',
    'awful', 'horrible', 'worst', 'useless', 'broken', 'not working',
    'waste of money', 'waste of time', 'regret', 'mistake'
  ];

  // Sentiment indicators
  const hostileLanguage = [
    'hate', 'stupid', 'idiots', 'incompetent', 'pathetic', 'joke',
    'screw you', 'damn', 'hell', 'bullshit', 'crap', 'garbage'
  ];

  const urgencyIndicators = [
    'urgent', 'emergency', 'asap', 'immediately', 'right now',
    'today', 'critical', 'major client', 'big deal', 'important client',
    'losing money', 'costing money', 'revenue impact'
  ];

  // Calculate weighted score
  let riskScore = 0;
  const triggersFound: string[] = [];

  // Check critical triggers (score: 100 each)
  criticalTriggers.forEach(trigger => {
    if (content.includes(trigger)) {
      riskScore += 100;
      triggersFound.push(`Critical: ${trigger}`);
    }
  });

  // Check high-risk triggers (score: 50 each)
  highRiskTriggers.forEach(trigger => {
    if (content.includes(trigger)) {
      riskScore += 50;
      triggersFound.push(`High Risk: ${trigger}`);
    }
  });

  // Check medium-risk triggers (score: 25 each)
  mediumRiskTriggers.forEach(trigger => {
    if (content.includes(trigger)) {
      riskScore += 25;
      triggersFound.push(`Medium Risk: ${trigger}`);
    }
  });

  // Check urgency indicators (score: 10 each)
  urgencyIndicators.forEach(indicator => {
    if (content.includes(indicator)) {
      riskScore += 10;
      triggersFound.push(`Urgency: ${indicator}`);
    }
  });

  // Check hostile language (score: 30 each)
  hostileLanguage.forEach(word => {
    if (content.includes(word)) {
      riskScore += 30;
      triggersFound.push(`Hostile: ${word}`);
    }
  });

  // Determine sentiment
  let sentiment: 'positive' | 'neutral' | 'negative' | 'hostile' = 'neutral';
  if (hostileLanguage.some(word => content.includes(word)) || riskScore >= 100) {
    sentiment = 'hostile';
  } else if (riskScore >= 50) {
    sentiment = 'negative';
  } else if (content.includes('thanks') || content.includes('appreciate') || content.includes('great')) {
    sentiment = 'positive';
  }

  // Determine risk level and recommended action
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  let recommendedAction: 'auto_reply' | 'manager_review' | 'immediate_escalation' | 'legal_review';
  
  if (riskScore >= 100) {
    riskLevel = 'critical';
    recommendedAction = criticalTriggers.some(trigger => content.includes(trigger)) ? 'legal_review' : 'immediate_escalation';
  } else if (riskScore >= 50) {
    riskLevel = 'high';
    recommendedAction = 'immediate_escalation';
  } else if (riskScore >= 25) {
    riskLevel = 'medium';
    recommendedAction = 'manager_review';
  } else {
    riskLevel = 'low';
    recommendedAction = 'auto_reply';
  }

  // Calculate urgency (1-10 scale)
  const urgency = Math.min(10, Math.max(1, Math.ceil(riskScore / 20) + 1));

  return {
    riskLevel,
    triggers: triggersFound,
    sentiment,
    recommendedAction,
    urgency
  };
}

/**
 * Generate escalation alert message for Slack/notifications
 */
export function generateEscalationAlert(
  clientName: string, 
  ticketId: string, 
  analysis: EscalationAnalysis,
  ticketBody: string
): string {
  const urgencyEmoji = analysis.urgency >= 8 ? '🚨' : analysis.urgency >= 6 ? '⚠️' : '📢';
  
  return `${urgencyEmoji} ESCALATION ALERT - ${analysis.riskLevel.toUpperCase()}

Client: ${clientName}
Ticket: #${ticketId}
Risk Level: ${analysis.riskLevel} (${analysis.urgency}/10)
Sentiment: ${analysis.sentiment}
Action: ${analysis.recommendedAction.replace('_', ' ').toUpperCase()}

Triggers Found:
${analysis.triggers.map(trigger => `• ${trigger}`).join('\n')}

Original Message:
"${ticketBody.substring(0, 200)}${ticketBody.length > 200 ? '...' : ''}"

${analysis.recommendedAction === 'legal_review' ? '⚖️ LEGAL REVIEW REQUIRED' : ''}
${analysis.urgency >= 8 ? '🔥 IMMEDIATE ATTENTION NEEDED' : ''}`;
}

/**
 * Route escalation to appropriate team
 */
export async function routeEscalation(
  analysis: EscalationAnalysis,
  clientName: string,
  ticketData: any
): Promise<{ success: boolean; routedTo: string; message: string }> {
  try {
    const alert = generateEscalationAlert(clientName, ticketData.ticketId, analysis, ticketData.ticketBody);
    
    switch (analysis.recommendedAction) {
      case 'legal_review':
        // Route to legal team
        await sendSlackAlert(alert, '#legal-alerts');
        await logEscalation('legal', ticketData, analysis);
        return {
          success: true,
          routedTo: 'Legal Team',
          message: 'Escalated to legal team for immediate review'
        };
        
      case 'immediate_escalation':
        // Route to senior support manager
        await sendSlackAlert(alert, '#urgent-support');
        await logEscalation('senior_manager', ticketData, analysis);
        return {
          success: true,
          routedTo: 'Senior Support Manager',
          message: 'Escalated to senior support for immediate attention'
        };
        
      case 'manager_review':
        // Route to support manager
        await sendSlackAlert(alert, '#manager-review');
        await logEscalation('manager', ticketData, analysis);
        return {
          success: true,
          routedTo: 'Support Manager',
          message: 'Flagged for manager review within 2 hours'
        };
        
      default:
        return {
          success: true,
          routedTo: 'AI Response',
          message: 'Handled automatically with AI response'
        };
    }
  } catch (error) {
    console.error('Error routing escalation:', error);
    return {
      success: false,
      routedTo: 'Error',
      message: 'Failed to route escalation - manual intervention required'
    };
  }
}

async function sendSlackAlert(message: string, channel: string) {
  // Implementation depends on your Slack integration
  console.log(`Slack Alert to ${channel}:`, message);
}

async function logEscalation(level: string, ticketData: any, analysis: EscalationAnalysis) {
  // Log to Airtable or your tracking system
  console.log(`Escalation logged - Level: ${level}`, { ticketData, analysis });
}