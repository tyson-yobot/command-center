/**
 * Airtable Service - Handles all Airtable API integrations
 * Connects to Scraped Leads (Universal) and other client tables
 */

interface AirtableConfig {
  baseId: string;
  apiKey: string;
  tables: {
    scrapedLeads: string;
    bookings: string;
    supportTickets: string;
    followUps: string;
    pipelineCalls: string;
  };
}

interface Lead {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'In Pipeline' | 'Converted' | 'Closed';
  source: string;
  createdAt?: string;
  lastContactDate?: string;
  notes?: string;
}

interface BookingRecord {
  id?: string;
  clientName: string;
  email: string;
  phone: string;
  service: string;
  preferredDate: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled';
  notes?: string;
  createdAt?: string;
}

interface SupportTicket {
  id?: string;
  ticketId: string;
  name: string;
  email: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt?: string;
}

export class AirtableService {
  private config: AirtableConfig;

  constructor() {
    const apiKey = process.env.AIRTABLE_API_KEY as string;
    if (!apiKey) {
      throw new Error('AIRTABLE_API_KEY not configured for AirtableService');
    }

    this.config = {
      baseId: process.env.AIRTABLE_BASE_ID || 'appb2F3D77tC4DWla', // YoBot Lead Engine

      apiKey,

      apiKey: process.env.AIRTABLE_API_KEY as string,

      tables: {
        scrapedLeads: 'Scraped Leads (Universal) Table', // Scraped Leads (Universal)
        bookings: 'tblBookings',
        supportTickets: 'tblSupportTickets',
        followUps: 'tblFollowUps',
        pipelineCalls: 'Call Queue Table'
      }
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `https://api.airtable.com/v0/${this.config.baseId}/${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Lead Management
  async createLead(lead: Lead): Promise<Lead> {
    const record = {
      fields: {
        'First Name': lead.firstName,
        'Last Name': lead.lastName,
        'Email': lead.email,
        'Phone': lead.phone,
        'Company': lead.company || '',
        'Status': lead.status,
        'Source': lead.source,
        'Notes': lead.notes || '',
        'Created Date': new Date().toISOString()
      }
    };

    const result = await this.makeRequest(this.config.tables.scrapedLeads, {
      method: 'POST',
      body: JSON.stringify({ records: [record] })
    });

    return this.formatLead(result.records[0]);
  }

  async createLeadsBulk(leads: Lead[]): Promise<{ success: boolean; leadsCreated: number; errors: any[] }> {
    const records = leads.map(lead => ({
      fields: {
        'First Name': lead.firstName,
        'Last Name': lead.lastName,
        'Email': lead.email,
        'Phone': lead.phone,
        'Company': lead.company || '',
        'Status': lead.status || 'New',
        'Source': lead.source,
        'Notes': lead.notes || '',
        'Title': (lead as any).title || '',
        'Location': (lead as any).location || '',
        'Created Date': new Date().toISOString()
      }
    }));

    const errors: any[] = [];
    let leadsCreated = 0;

    // Airtable allows max 10 records per request
    const chunks = [];
    for (let i = 0; i < records.length; i += 10) {
      chunks.push(records.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      try {
        const result = await this.makeRequest(this.config.tables.scrapedLeads, {
          method: 'POST',
          body: JSON.stringify({ records: chunk })
        });
        leadsCreated += result.records.length;
      } catch (error) {
        errors.push({
          chunk: chunk.length,
          error: error.message
        });
      }
    }

    return {
      success: errors.length === 0,
      leadsCreated,
      errors
    };
  }

  async getLeads(filterStatus?: string): Promise<Lead[]> {
    let url = this.config.tables.scrapedLeads;
    
    if (filterStatus) {
      url += `?filterByFormula={Status}="${filterStatus}"`;
    }

    const result = await this.makeRequest(url);
    return result.records.map(this.formatLead);
  }

  async updateLeadStatus(leadId: string, status: string): Promise<Lead> {
    const record = {
      id: leadId,
      fields: {
        'Status': status,
        'Last Contact Date': new Date().toISOString()
      }
    };

    const result = await this.makeRequest(this.config.tables.scrapedLeads, {
      method: 'PATCH',
      body: JSON.stringify({ records: [record] })
    });

    return this.formatLead(result.records[0]);
  }

  // Booking Management
  async createBooking(booking: BookingRecord): Promise<BookingRecord> {
    const record = {
      fields: {
        'Client Name': booking.clientName,
        'Email': booking.email,
        'Phone': booking.phone,
        'Service': booking.service,
        'Preferred Date': booking.preferredDate,
        'Status': booking.status,
        'Notes': booking.notes || '',
        'Created Date': new Date().toISOString()
      }
    };

    const result = await this.makeRequest(this.config.tables.bookings, {
      method: 'POST',
      body: JSON.stringify({ records: [record] })
    });

    return this.formatBooking(result.records[0]);
  }

  // Support Ticket Management
  async createSupportTicket(ticket: SupportTicket): Promise<SupportTicket> {
    const record = {
      fields: {
        'Ticket ID': ticket.ticketId,
        'Name': ticket.name,
        'Email': ticket.email,
        'Subject': ticket.subject,
        'Description': ticket.description,
        'Priority': ticket.priority,
        'Status': ticket.status,
        'Created Date': new Date().toISOString()
      }
    };

    const result = await this.makeRequest(this.config.tables.supportTickets, {
      method: 'POST',
      body: JSON.stringify({ records: [record] })
    });

    return this.formatSupportTicket(result.records[0]);
  }

  // Pipeline Management
  async getQualifiedLeads(): Promise<Lead[]> {
    return this.getLeads('Qualified');
  }

  async startPipelineCalls(leadIds: string[]): Promise<{ success: boolean; callsStarted: number }> {
    const callRecords = leadIds.map(leadId => ({
      fields: {
        'Lead ID': leadId,
        'Call Status': 'Queued',
        'Call Date': new Date().toISOString(),
        'Pipeline Status': 'Active'
      }
    }));

    await this.makeRequest(this.config.tables.pipelineCalls, {
      method: 'POST',
      body: JSON.stringify({ records: callRecords })
    });

    // Update lead status to "In Pipeline"
    for (const leadId of leadIds) {
      await this.updateLeadStatus(leadId, 'In Pipeline');
    }

    return { success: true, callsStarted: leadIds.length };
  }

  // Helper methods for formatting records
  private formatLead(record: any): Lead {
    return {
      id: record.id,
      firstName: record.fields['First Name'] || '',
      lastName: record.fields['Last Name'] || '',
      email: record.fields['Email'] || '',
      phone: record.fields['Phone'] || '',
      company: record.fields['Company'] || '',
      status: record.fields['Status'] || 'New',
      source: record.fields['Source'] || '',
      createdAt: record.fields['Created Date'],
      lastContactDate: record.fields['Last Contact Date'],
      notes: record.fields['Notes'] || ''
    };
  }

  private formatBooking(record: any): BookingRecord {
    return {
      id: record.id,
      clientName: record.fields['Client Name'] || '',
      email: record.fields['Email'] || '',
      phone: record.fields['Phone'] || '',
      service: record.fields['Service'] || '',
      preferredDate: record.fields['Preferred Date'] || '',
      status: record.fields['Status'] || 'Pending',
      notes: record.fields['Notes'] || '',
      createdAt: record.fields['Created Date']
    };
  }

  private formatSupportTicket(record: any): SupportTicket {
    return {
      id: record.id,
      ticketId: record.fields['Ticket ID'] || '',
      name: record.fields['Name'] || '',
      email: record.fields['Email'] || '',
      subject: record.fields['Subject'] || '',
      description: record.fields['Description'] || '',
      priority: record.fields['Priority'] || 'Medium',
      status: record.fields['Status'] || 'Open',
      createdAt: record.fields['Created Date']
    };
  }
}

export const airtableService = new AirtableService();
