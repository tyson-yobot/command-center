import axios from 'axios';

interface ZendeskConfig {
  apiKey: string;
  email: string;
  domain: string;
}

interface ZendeskReplyData {
  ticketId: string;
  replyText: string;
  isPublic?: boolean;
  authorId?: string;
}

interface ZendeskResponse {
  status: 'success' | 'error';
  message: string;
  ticketId?: string;
  code?: number;
  response?: any;
}

/**
 * Post AI-generated reply to Zendesk ticket
 */
export async function postReplyToZendesk(data: ZendeskReplyData): Promise<ZendeskResponse> {
  const config = getZendeskConfig();
  
  if (!config) {
    return {
      status: 'error',
      message: 'Zendesk configuration missing. Please set ZENDESK_API_KEY, ZENDESK_EMAIL, and ZENDESK_DOMAIN environment variables.'
    };
  }

  const { ticketId, replyText, isPublic = false } = data;
  const url = `https://${config.domain}/api/v2/tickets/${ticketId}.json`;

  const headers = {
    'Authorization': `Basic ${Buffer.from(`${config.email}/token:${config.apiKey}`).toString('base64')}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  const payload = {
    ticket: {
      comment: {
        body: replyText,
        public: isPublic, // false = internal note, true = customer-facing reply
        author_id: data.authorId // Optional: specify which agent posted the reply
      }
    }
  };

  try {
    const response = await axios.put(url, payload, { headers });

    if (response.status === 200) {
      return {
        status: 'success',
        message: 'Reply posted to Zendesk successfully',
        ticketId,
        response: response.data
      };
    } else {
      return {
        status: 'error',
        message: `Unexpected response status: ${response.status}`,
        code: response.status,
        response: response.data
      };
    }
  } catch (error: any) {
    console.error('Zendesk API error:', error.response?.data || error.message);
    
    return {
      status: 'error',
      message: error.response?.data?.description || error.message || 'Failed to post reply to Zendesk',
      code: error.response?.status,
      response: error.response?.data
    };
  }
}

/**
 * Get ticket details from Zendesk
 */
export async function getZendeskTicket(ticketId: string): Promise<any> {
  const config = getZendeskConfig();
  
  if (!config) {
    throw new Error('Zendesk configuration missing');
  }

  const url = `https://${config.domain}/api/v2/tickets/${ticketId}.json`;
  
  const headers = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.get(url, { headers });
    return response.data.ticket;
  } catch (error: any) {
    console.error('Error fetching Zendesk ticket:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Update ticket priority and tags based on escalation analysis
 */
export async function updateTicketPriority(
  ticketId: string, 
  priority: 'low' | 'normal' | 'high' | 'urgent',
  tags: string[] = []
): Promise<ZendeskResponse> {
  const config = getZendeskConfig();
  
  if (!config) {
    return {
      status: 'error',
      message: 'Zendesk configuration missing'
    };
  }

  const url = `https://${config.domain}/api/v2/tickets/${ticketId}.json`;
  
  const headers = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  };

  const payload = {
    ticket: {
      priority,
      tags: [...tags, 'ai_processed', 'yobot_analyzed']
    }
  };

  try {
    const response = await axios.put(url, payload, { headers });
    
    return {
      status: 'success',
      message: `Ticket priority updated to ${priority}`,
      ticketId,
      response: response.data
    };
  } catch (error: any) {
    console.error('Error updating ticket priority:', error.response?.data || error.message);
    
    return {
      status: 'error',
      message: error.response?.data?.description || error.message || 'Failed to update ticket priority',
      code: error.response?.status
    };
  }
}

/**
 * Create internal escalation ticket for urgent issues
 */
export async function createEscalationTicket(
  originalTicketId: string,
  escalationReason: string,
  clientName: string,
  priority: 'high' | 'urgent' = 'high'
): Promise<ZendeskResponse> {
  const config = getZendeskConfig();
  
  if (!config) {
    return {
      status: 'error',
      message: 'Zendesk configuration missing'
    };
  }

  const url = `https://${config.domain}/api/v2/tickets.json`;
  
  const headers = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  };

  const payload = {
    ticket: {
      subject: `ESCALATION: ${clientName} - Ticket #${originalTicketId}`,
      comment: {
        body: `🚨 AUTOMATIC ESCALATION
        
Original Ticket: #${originalTicketId}
Client: ${clientName}
Escalation Reason: ${escalationReason}

This ticket has been automatically escalated by the YoBot AI system due to detected risk factors. Please review and take appropriate action immediately.

Link to original ticket: https://${config.domain}/agent/tickets/${originalTicketId}`,
        public: false
      },
      priority,
      type: 'incident',
      tags: ['escalation', 'ai_generated', 'urgent_review', 'yobot_escalation'],
      assignee_id: null, // Will be assigned to default escalation group
      group_id: null // Set this to your escalation team's group ID if known
    }
  };

  try {
    const response = await axios.post(url, payload, { headers });
    
    return {
      status: 'success',
      message: 'Escalation ticket created successfully',
      ticketId: response.data.ticket.id.toString(),
      response: response.data
    };
  } catch (error: any) {
    console.error('Error creating escalation ticket:', error.response?.data || error.message);
    
    return {
      status: 'error',
      message: error.response?.data?.description || error.message || 'Failed to create escalation ticket',
      code: error.response?.status
    };
  }
}

/**
 * Get Zendesk configuration from environment variables
 */
function getZendeskConfig(): ZendeskConfig | null {
  const apiKey = process.env.ZENDESK_API_KEY;
  const email = process.env.ZENDESK_EMAIL;
  const domain = process.env.ZENDESK_DOMAIN;

  if (!apiKey || !email || !domain) {
    console.warn('Zendesk configuration incomplete. Missing:', {
      apiKey: !apiKey,
      email: !email,
      domain: !domain
    });
    return null;
  }

  return { apiKey, email, domain };
}

/**
 * Test Zendesk connection
 */
export async function testZendeskConnection(): Promise<{ success: boolean; message: string }> {
  const config = getZendeskConfig();
  
  if (!config) {
    return {
      success: false,
      message: 'Zendesk configuration missing'
    };
  }

  const url = `https://${config.domain}/api/v2/tickets.json?per_page=1`;
  
  const headers = {
    'Authorization': `Bearer ${config.apiKey}`,
    'Content-Type': 'application/json'
  };

  try {
    const response = await axios.get(url, { headers });
    
    return {
      success: true,
      message: `Connected to Zendesk successfully. Found ${response.data.count} tickets.`
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.description || error.message || 'Failed to connect to Zendesk'
    };
  }
}