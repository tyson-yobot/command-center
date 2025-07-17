import express from 'express';
import axios from 'axios';

const router = express.Router();

interface PhantombusterAgent {
  id: string;
  name: string;
  script: string;
  status: string;
}

interface LeadData {
  name: string;
  email: string;
  company: string;
  linkedinUrl?: string;
  title?: string;
}

class PhantombusterService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PHANTOMBUSTER_API_KEY || '';
    this.baseUrl = 'https://phantombuster.com/api/v2';
  }

  private getHeaders() {
    return {
      'X-Phantombuster-Key': this.apiKey,
      'Content-Type': 'application/json'
    };
  }

  async getAgents(): Promise<PhantombusterAgent[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/agents`, {
        headers: this.getHeaders()
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching Phantombuster agents:', error);
      throw new Error('Failed to fetch agents');
    }
  }

  async launchAgent(agentId: string, agentArgs?: any): Promise<any> {
    try {
      const payload = {
        id: agentId,
        ...(agentArgs && { arguments: agentArgs })
      };
      const response = await axios.post(`${this.baseUrl}/agents/launch`, payload, {
        headers: this.getHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error launching Phantombuster agent:', error);
      throw new Error('Failed to launch agent');
    }
  }

  async getAgentOutput(agentId: string): Promise<LeadData[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/agents/output?id=${agentId}`, {
        headers: this.getHeaders()
      });
      return response.data || [];
    } catch (error) {
      console.error('Error getting agent output:', error);
      throw new Error('Failed to get agent output');
    }
  }

  async syncLeadsToHubSpot(leads: LeadData[]): Promise<number> {
    let syncedCount = 0;
    
    for (const lead of leads) {
      try {
        // Create contact in HubSpot
        const hubspotData = {
          properties: {
            email: lead.email,
            firstname: lead.name.split(' ')[0],
            lastname: lead.name.split(' ').slice(1).join(' '),
            company: lead.company,
            jobtitle: lead.title || '',
            website: lead.linkedinUrl || '',
            lifecyclestage: 'lead',
            lead_source: 'Phantombuster'
          }
        };

        const hubspotResponse = await axios.post(
          'https://api.hubapi.com/crm/v3/objects/contacts',
          hubspotData,
          {
            headers: {
              'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (hubspotResponse.status === 201) {
          syncedCount++;
        }
      } catch (error) {
        console.error(`Failed to sync lead ${lead.email}:`, error);
      }
    }

    return syncedCount;
  }
}

const phantombusterService = new PhantombusterService();

// Get all Phantombuster agents
router.get('/agents', async (req, res) => {
  try {
    const agents = await phantombusterService.getAgents();
    res.json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Launch a Phantombuster agent
router.post('/agents/:agentId/launch', async (req, res) => {
  try {
    const { agentId } = req.params;
    const { arguments: agentArgs } = req.body;
    
    const result = await phantombusterService.launchAgent(agentId, agentArgs);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get agent output and sync to CRM
router.get('/agents/:agentId/output', async (req, res) => {
  try {
    const { agentId } = req.params;
    const leads = await phantombusterService.getAgentOutput(agentId);
    
    // Auto-sync to HubSpot if leads are found
    let syncedCount = 0;
    if (leads.length > 0) {
      syncedCount = await phantombusterService.syncLeadsToHubSpot(leads);
    }
    
    res.json({ 
      success: true, 
      leads,
      totalLeads: leads.length,
      syncedToHubSpot: syncedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Phantombuster connection
router.get('/test', async (req, res) => {
  try {
    const agents = await phantombusterService.getAgents();
    res.json({ 
      success: true, 
      message: 'Phantombuster connected successfully',
      agentCount: agents.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
