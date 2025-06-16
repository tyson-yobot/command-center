/**
 * Zendesk Integration Service
 * Handles ticket creation, management, and chat integration
 */

interface ZendeskTicket {
  subject: string;
  description: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status?: string;
  tags?: string[];
  requester?: {
    name: string;
    email: string;
  };
}

interface ZendeskResponse {
  ticket: {
    id: number;
    subject: string;
    status: string;
    priority: string;
    created_at: string;
    updated_at: string;
    description: string;
  };
}

class ZendeskService {
  private domain: string;
  private email: string;
  private apiToken: string;
  private baseUrl: string;

  constructor() {
    this.domain = process.env.ZENDESK_DOMAIN || 'your-domain.zendesk.com';
    this.email = process.env.ZENDESK_EMAIL || 'support@yourdomain.com';
    this.apiToken = process.env.ZENDESK_API_TOKEN || '';
    this.baseUrl = `https://${this.domain}/api/v2`;
  }

  private getAuthHeaders() {
    const credentials = Buffer.from(`${this.email}/token:${this.apiToken}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Create a new support ticket in Zendesk
   */
  async createTicket(ticketData: ZendeskTicket): Promise<ZendeskResponse> {
    try {
      if (!this.apiToken) {
        // Return mock response when no API token is configured
        return {
          ticket: {
            id: Math.floor(Math.random() * 10000) + 1000,
            subject: ticketData.subject,
            status: 'new',
            priority: ticketData.priority,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: ticketData.description
          }
        };
      }

      const response = await fetch(`${this.baseUrl}/tickets.json`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          ticket: {
            subject: ticketData.subject,
            comment: {
              body: ticketData.description
            },
            priority: ticketData.priority,
            status: ticketData.status || 'new',
            tags: ticketData.tags || ['yobot', 'chat_widget'],
            requester: ticketData.requester || {
              name: 'YoBot User',
              email: 'user@yobot.com'
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Zendesk API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create Zendesk ticket:', error);
      throw error;
    }
  }

  /**
   * Get tickets from Zendesk
   */
  async getTickets(filters?: { status?: string; requester_id?: string }): Promise<any[]> {
    try {
      if (!this.apiToken) {
        // Return mock tickets when no API token is configured
        return [
          {
            id: 1001,
            subject: 'Voice Command Setup Help',
            status: 'open',
            priority: 'normal',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            description: 'Need help setting up voice commands'
          },
          {
            id: 1002,
            subject: 'Calendar Sync Issue',
            status: 'pending',
            priority: 'high',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            description: 'Google Calendar not syncing properly'
          },
          {
            id: 1003,
            subject: 'Lead Scraping Configuration',
            status: 'solved',
            priority: 'normal',
            created_at: new Date(Date.now() - 259200000).toISOString(),
            description: 'Successfully configured Phantom Buster integration'
          }
        ];
      }

      let url = `${this.baseUrl}/tickets.json`;
      const params = new URLSearchParams();
      
      if (filters?.status) {
        params.append('status', filters.status);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Zendesk API error: ${response.status}`);
      }

      const data = await response.json();
      return data.tickets || [];
    } catch (error) {
      console.error('Failed to fetch Zendesk tickets:', error);
      throw error;
    }
  }

  /**
   * Update ticket status
   */
  async updateTicket(ticketId: number, updates: { status?: string; priority?: string; comment?: string }): Promise<any> {
    try {
      if (!this.apiToken) {
        return { success: true, ticket: { id: ticketId, ...updates } };
      }

      const ticketUpdate: any = {};
      
      if (updates.status) ticketUpdate.status = updates.status;
      if (updates.priority) ticketUpdate.priority = updates.priority;
      if (updates.comment) {
        ticketUpdate.comment = { body: updates.comment };
      }

      const response = await fetch(`${this.baseUrl}/tickets/${ticketId}.json`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ticket: ticketUpdate })
      });

      if (!response.ok) {
        throw new Error(`Zendesk API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to update Zendesk ticket:', error);
      throw error;
    }
  }

  /**
   * Get ticket statistics
   */
  async getTicketStats(): Promise<{ total: number; open: number; pending: number; solved: number }> {
    try {
      const tickets = await this.getTickets();
      
      const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'open').length,
        pending: tickets.filter(t => t.status === 'pending').length,
        solved: tickets.filter(t => t.status === 'solved').length
      };

      return stats;
    } catch (error) {
      console.error('Failed to get ticket stats:', error);
      return { total: 0, open: 0, pending: 0, solved: 0 };
    }
  }

  /**
   * Search tickets by query
   */
  async searchTickets(query: string): Promise<any[]> {
    try {
      if (!this.apiToken) {
        const mockTickets = await this.getTickets();
        return mockTickets.filter(ticket => 
          ticket.subject.toLowerCase().includes(query.toLowerCase()) ||
          ticket.description.toLowerCase().includes(query.toLowerCase())
        );
      }

      const response = await fetch(`${this.baseUrl}/search.json?query=${encodeURIComponent(query)}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Zendesk API error: ${response.status}`);
      }

      const data = await response.json();
      return data.results?.filter((item: any) => item.result_type === 'ticket') || [];
    } catch (error) {
      console.error('Failed to search Zendesk tickets:', error);
      return [];
    }
  }

  /**
   * Check if Zendesk is properly configured
   */
  isConfigured(): boolean {
    return !!(this.domain && this.email && this.apiToken);
  }

  /**
   * Test Zendesk connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.apiToken) {
        console.log('Zendesk running in demo mode - no API token configured');
        return true; // Return true for demo mode
      }

      const response = await fetch(`${this.baseUrl}/tickets.json?per_page=1`, {
        headers: this.getAuthHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Zendesk connection test failed:', error);
      return false;
    }
  }
}

export const zendeskService = new ZendeskService();