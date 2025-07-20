import type { Express } from "express";
import { COMMAND_CENTER_BASE_ID } from "@shared/airtableConfig";

export function registerPipelineDashboardRoutes(app: Express) {
  // Pipeline Stages API Endpoint
  app.get('/api/pipeline/stages', (req, res) => {
    // Generate realistic pipeline data
    const pipelineStages = [
      {
        id: 'stage_lead_gen',
        name: 'Lead Generation',
        count: 12,
        value: 45000,
        leads: [
          {
            id: 'lead_1',
            name: 'John Smith',
            company: 'Acme Corp',
            value: 5000,
            status: 'Lead Generation',
            lastContact: '2023-05-15',
            nextAction: 'Follow-up call',
            probability: 20
          },
          {
            id: 'lead_2',
            name: 'Sarah Johnson',
            company: 'Tech Solutions',
            value: 7500,
            status: 'Lead Generation',
            lastContact: '2023-05-16',
            nextAction: 'Send proposal',
            probability: 25
          },
          {
            id: 'lead_3',
            name: 'Michael Brown',
            company: 'Global Industries',
            value: 10000,
            status: 'Lead Generation',
            lastContact: '2023-05-14',
            nextAction: 'Demo scheduled',
            probability: 30
          },
          {
            id: 'lead_4',
            name: 'Emily Davis',
            company: 'Innovative Solutions',
            value: 6500,
            status: 'Lead Generation',
            lastContact: '2023-05-17',
            nextAction: 'Qualification call',
            probability: 15
          },
          {
            id: 'lead_5',
            name: 'Robert Wilson',
            company: 'Strategic Partners',
            value: 8000,
            status: 'Lead Generation',
            lastContact: '2023-05-13',
            nextAction: 'Send information',
            probability: 20
          },
          {
            id: 'lead_6',
            name: 'Jennifer Lee',
            company: 'Premier Services',
            value: 8000,
            status: 'Lead Generation',
            lastContact: '2023-05-12',
            nextAction: 'Follow-up email',
            probability: 15
          }
        ]
      },
      {
        id: 'stage_qualification',
        name: 'Qualification',
        count: 8,
        value: 60000,
        leads: [
          {
            id: 'lead_7',
            name: 'David Miller',
            company: 'Quantum Computing',
            value: 12000,
            status: 'Qualification',
            lastContact: '2023-05-15',
            nextAction: 'Technical assessment',
            probability: 40
          },
          {
            id: 'lead_8',
            name: 'Lisa Anderson',
            company: 'Future Tech',
            value: 9000,
            status: 'Qualification',
            lastContact: '2023-05-16',
            nextAction: 'Budget discussion',
            probability: 35
          },
          {
            id: 'lead_9',
            name: 'James Taylor',
            company: 'Innovative Systems',
            value: 15000,
            status: 'Qualification',
            lastContact: '2023-05-14',
            nextAction: 'Needs analysis',
            probability: 45
          },
          {
            id: 'lead_10',
            name: 'Patricia Moore',
            company: 'Digital Solutions',
            value: 8000,
            status: 'Qualification',
            lastContact: '2023-05-17',
            nextAction: 'Product demo',
            probability: 30
          },
          {
            id: 'lead_11',
            name: 'Thomas Wright',
            company: 'Advanced Technologies',
            value: 16000,
            status: 'Qualification',
            lastContact: '2023-05-13',
            nextAction: 'Technical call',
            probability: 40
          }
        ]
      },
      {
        id: 'stage_demo',
        name: 'Demo Scheduled',
        count: 5,
        value: 75000,
        leads: [
          {
            id: 'lead_12',
            name: 'Richard Harris',
            company: 'Enterprise Solutions',
            value: 20000,
            status: 'Demo Scheduled',
            lastContact: '2023-05-15',
            nextAction: 'Demo preparation',
            probability: 60
          },
          {
            id: 'lead_13',
            name: 'Karen Lewis',
            company: 'Global Systems',
            value: 15000,
            status: 'Demo Scheduled',
            lastContact: '2023-05-16',
            nextAction: 'Technical setup',
            probability: 55
          },
          {
            id: 'lead_14',
            name: 'Daniel Clark',
            company: 'Modern Solutions',
            value: 18000,
            status: 'Demo Scheduled',
            lastContact: '2023-05-14',
            nextAction: 'Prepare materials',
            probability: 65
          },
          {
            id: 'lead_15',
            name: 'Nancy Walker',
            company: 'Premier Technologies',
            value: 22000,
            status: 'Demo Scheduled',
            lastContact: '2023-05-13',
            nextAction: 'Confirm attendees',
            probability: 60
          }
        ]
      },
      {
        id: 'stage_proposal',
        name: 'Proposal',
        count: 3,
        value: 85000,
        leads: [
          {
            id: 'lead_16',
            name: 'Steven Young',
            company: 'Innovative Corp',
            value: 30000,
            status: 'Proposal',
            lastContact: '2023-05-15',
            nextAction: 'Proposal review',
            probability: 75
          },
          {
            id: 'lead_17',
            name: 'Laura Martinez',
            company: 'Tech Enterprises',
            value: 25000,
            status: 'Proposal',
            lastContact: '2023-05-14',
            nextAction: 'Follow-up call',
            probability: 70
          },
          {
            id: 'lead_18',
            name: 'Christopher Allen',
            company: 'Strategic Innovations',
            value: 30000,
            status: 'Proposal',
            lastContact: '2023-05-16',
            nextAction: 'Address questions',
            probability: 80
          }
        ]
      },
      {
        id: 'stage_negotiation',
        name: 'Negotiation',
        count: 2,
        value: 70000,
        leads: [
          {
            id: 'lead_19',
            name: 'Michelle Scott',
            company: 'Global Enterprises',
            value: 35000,
            status: 'Negotiation',
            lastContact: '2023-05-15',
            nextAction: 'Contract review',
            probability: 85
          },
          {
            id: 'lead_20',
            name: 'Edward King',
            company: 'Advanced Systems',
            value: 35000,
            status: 'Negotiation',
            lastContact: '2023-05-16',
            nextAction: 'Final terms',
            probability: 90
          }
        ]
      },
      {
        id: 'stage_closed',
        name: 'Closed Won',
        count: 1,
        value: 40000,
        leads: [
          {
            id: 'lead_21',
            name: 'Amanda Turner',
            company: 'Premier Solutions',
            value: 40000,
            status: 'Closed Won',
            lastContact: '2023-05-14',
            nextAction: 'Onboarding',
            probability: 100
          }
        ]
      }
    ];

    res.json(pipelineStages);
  });

  // Call Metrics API Endpoint
  app.get('/api/calls/metrics', (req, res) => {
    const callMetrics = {
      total: 127,
      completed: 98,
      scheduled: 29,
      avgDuration: 12,
      successRate: 76,
      recentCalls: [
        {
          time: '10:30 AM',
          title: 'Call with Acme Corp',
          duration: '14 minutes',
          outcome: 'Success'
        },
        {
          time: '11:15 AM',
          title: 'Demo for Tech Solutions',
          duration: '28 minutes',
          outcome: 'Success'
        },
        {
          time: '1:45 PM',
          title: 'Follow-up with Global Industries',
          duration: '8 minutes',
          outcome: 'Neutral'
        },
        {
          time: '2:30 PM',
          title: 'Qualification call with Innovative Solutions',
          duration: '17 minutes',
          outcome: 'Success'
        },
        {
          time: '3:15 PM',
          title: 'Missed call with Strategic Partners',
          duration: '0 minutes',
          outcome: 'Negative'
        }
      ]
    };

    res.json(callMetrics);
  });

  // Pipeline Analytics API Endpoint
  app.get('/api/pipeline/analytics', (req, res) => {
    const analyticsData = {
      conversionRates: {
        leadToQualification: {
          label: 'Lead → Qual',
          percentage: 67
        },
        qualificationToDemo: {
          label: 'Qual → Demo',
          percentage: 62
        },
        demoToProposal: {
          label: 'Demo → Prop',
          percentage: 60
        },
        proposalToNegotiation: {
          label: 'Prop → Neg',
          percentage: 67
        },
        negotiationToClosed: {
          label: 'Neg → Closed',
          percentage: 50
        }
      },
      valueDistribution: {
        totalValue: '375,000',
        segments: {
          leadGeneration: {
            label: 'Lead Generation',
            percentage: 12,
            color: '#FF6EC7',
            rotation: 0,
            clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)'
          },
          qualification: {
            label: 'Qualification',
            percentage: 16,
            color: '#FFFF33',
            rotation: 45,
            clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%)'
          },
          demoScheduled: {
            label: 'Demo Scheduled',
            percentage: 20,
            color: '#39FF14',
            rotation: 135,
            clipPath: 'polygon(50% 50%, 100% 100%, 50% 100%)'
          },
          proposal: {
            label: 'Proposal',
            percentage: 23,
            color: '#0d82da',
            rotation: 225,
            clipPath: 'polygon(50% 50%, 50% 100%, 0% 100%, 0% 50%)'
          },
          negotiation: {
            label: 'Negotiation',
            percentage: 19,
            color: '#DA70D6',
            rotation: 315,
            clipPath: 'polygon(50% 50%, 0% 50%, 0% 0%, 50% 0%)'
          },
          closedWon: {
            label: 'Closed Won',
            percentage: 10,
            color: '#00FF00',
            rotation: 360,
            clipPath: 'polygon(50% 50%, 50% 0%, 75% 0%, 75% 25%)'
          }
        }
      },
      metrics: {
        avgDealSize: {
          title: 'Avg Deal Size',
          value: '$12,500',
          trend: {
            direction: 'positive',
            arrow: '↑',
            text: '8% vs last month'
          }
        },
        conversionRate: {
          title: 'Conversion Rate',
          value: '23%',
          trend: {
            direction: 'positive',
            arrow: '↑',
            text: '5% vs last month'
          }
        },
        salesCycle: {
          title: 'Sales Cycle',
          value: '32 days',
          trend: {
            direction: 'negative',
            arrow: '↓',
            text: '3 days longer'
          }
        },
        winRate: {
          title: 'Win Rate',
          value: '68%',
          trend: {
            direction: 'positive',
            arrow: '↑',
            text: '7% vs last month'
          }
        }
      }
    };

    res.json(analyticsData);
  });

  console.log('✅ Pipeline Dashboard routes registered successfully');
}