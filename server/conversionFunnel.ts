import express from 'express';
import axios from 'axios';

const router = express.Router();

interface FunnelMetrics {
  calls: number;
  leads: number;
  meetings: number;
  deals: number;
  conversionRates: {
    callsToLeads: number;
    leadsToMeetings: number;
    meetingsToDeals: number;
    overallConversion: number;
  };
  revenue: {
    totalValue: number;
    avgDealSize: number;
    projectedMonthly: number;
  };
}

// Get conversion funnel metrics
router.get('/metrics', async (req, res) => {
  try {
    let funnelData: FunnelMetrics = {
      calls: 0,
      leads: 0,
      meetings: 0,
      deals: 0,
      conversionRates: {
        callsToLeads: 0,
        leadsToMeetings: 0,
        meetingsToDeals: 0,
        overallConversion: 0
      },
      revenue: {
        totalValue: 0,
        avgDealSize: 0,
        projectedMonthly: 0
      }
    };

    // Get data from HubSpot if available
    if (process.env.HUBSPOT_API_KEY) {
      try {
        // Get total contacts (leads)
        const contactsResponse = await axios.get(
          'https://api.hubapi.com/contacts/v1/lists/all/contacts/all',
          {
            headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` },
            params: { count: 1 }
          }
        );
        funnelData.leads = contactsResponse.data['total-count'] || 0;

        // Get deals
        const dealsResponse = await axios.get(
          'https://api.hubapi.com/deals/v1/deal/paged',
          {
            headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` },
            params: { limit: 100 }
          }
        );
        
        const deals = dealsResponse.data.deals || [];
        funnelData.deals = deals.length;
        
        // Calculate meetings (deals in meeting stage)
        funnelData.meetings = deals.filter((deal: any) => 
          deal.properties?.dealstage?.value === 'appointmentscheduled'
        ).length;

        // Calculate revenue metrics
        const totalValue = deals.reduce((sum: number, deal: any) => {
          const amount = parseFloat(deal.properties?.amount?.value || '0');
          return sum + amount;
        }, 0);
        
        funnelData.revenue.totalValue = totalValue;
        funnelData.revenue.avgDealSize = funnelData.deals > 0 ? totalValue / funnelData.deals : 0;
        funnelData.revenue.projectedMonthly = totalValue * 1.2; // 20% growth projection

      } catch (error: any) {
        console.error('HubSpot API error:', error.response?.data || error.message);
      }
    }

    // Get call data from Airtable if available
    if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
      try {
        const callsResponse = await axios.get(
          `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Call%20Logs`,
          {
            headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` }
          }
        );
        funnelData.calls = callsResponse.data.records?.length || 0;
      } catch (error: any) {
        console.error('Airtable API error:', error.response?.data || error.message);
      }
    }

    // Calculate conversion rates
    if (funnelData.calls > 0) {
      funnelData.conversionRates.callsToLeads = (funnelData.leads / funnelData.calls) * 100;
    }
    if (funnelData.leads > 0) {
      funnelData.conversionRates.leadsToMeetings = (funnelData.meetings / funnelData.leads) * 100;
    }
    if (funnelData.meetings > 0) {
      funnelData.conversionRates.meetingsToDeals = (funnelData.deals / funnelData.meetings) * 100;
    }
    if (funnelData.calls > 0) {
      funnelData.conversionRates.overallConversion = (funnelData.deals / funnelData.calls) * 100;
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      funnel: funnelData,
      dataSource: {
        hubspot: !!process.env.HUBSPOT_API_KEY,
        airtable: !!(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID)
      }
    });

  } catch (error: any) {
    console.error('Conversion funnel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversion funnel metrics',
      details: error.message
    });
  }
});

// Update funnel stage for a contact/deal
router.post('/update-stage', async (req, res) => {
  const { contactId, dealId, newStage, source } = req.body;
  
  try {
    if (source === 'hubspot' && process.env.HUBSPOT_API_KEY) {
      if (dealId) {
        await axios.put(
          `https://api.hubapi.com/deals/v1/deal/${dealId}`,
          {
            properties: [
              { name: 'dealstage', value: newStage }
            ]
          },
          {
            headers: { Authorization: `Bearer ${process.env.HUBSPOT_API_KEY}` }
          }
        );
      }
    }

    res.json({
      success: true,
      message: 'Funnel stage updated successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to update funnel stage',
      details: error.message
    });
  }
});

export default router;