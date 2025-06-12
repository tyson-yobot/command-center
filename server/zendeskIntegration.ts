import { Request, Response } from 'express';
import { getSystemModeLocal } from './routes';

// Enhanced Zendesk integration with knowledge base connectivity
export class ZendeskIntegration {
  private knowledgeBase: Map<string, any> = new Map();
  private tickets: any[] = [];

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeTestTickets();
  }

  private initializeTestTickets() {
    // Add comprehensive test tickets for demo purposes
    this.tickets = [
      {
        id: 'TICK-2025-001',
        subject: 'Voice recognition not working in Chrome browser',
        description: 'The voice input feature fails to activate when using Chrome. Works fine in Firefox.',
        priority: 'High',
        status: 'Open',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        userEmail: 'sarah.manager@techcorp.com',
        assignedTo: 'Sarah Chen',
        category: 'Technical Issue',
        knowledgeResults: this.searchKnowledge('voice recognition chrome', 3)
      },
      {
        id: 'TICK-2025-002',
        subject: 'Calendar integration sync issues with Outlook',
        description: 'Appointments created in YoBot are not syncing to Outlook calendar. Getting timeout errors.',
        priority: 'Medium',
        status: 'In Progress',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        userEmail: 'admin@globaldynamics.com',
        assignedTo: 'Marcus Rodriguez',
        category: 'Integration',
        knowledgeResults: this.searchKnowledge('calendar sync outlook', 3)
      },
      {
        id: 'TICK-2025-003',
        subject: 'Automation function timeout errors in production',
        description: 'Several automation functions are timing out after 30 seconds. Performance degradation noticed.',
        priority: 'Low',
        status: 'Resolved',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        userEmail: 'devops@innovationlabs.com',
        assignedTo: 'Daniel Thompson',
        category: 'Performance',
        knowledgeResults: this.searchKnowledge('automation timeout performance', 3)
      },
      {
        id: 'TICK-2025-004',
        subject: 'Dashboard metrics not updating in real-time',
        description: 'Call monitoring dashboard shows stale data. Last update was 4 hours ago.',
        priority: 'Medium',
        status: 'Open',
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        userEmail: 'operations@dataflow.com',
        assignedTo: 'Sarah Chen',
        category: 'Dashboard',
        knowledgeResults: this.searchKnowledge('dashboard metrics real-time', 3)
      },
      {
        id: 'TICK-2025-005',
        subject: 'API key configuration help needed',
        description: 'Need assistance setting up Twilio API keys for SMS notifications. Documentation unclear.',
        priority: 'Low',
        status: 'Pending',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        userEmail: 'setup@startupx.com',
        assignedTo: 'Support Team',
        category: 'Configuration',
        knowledgeResults: this.searchKnowledge('API key configuration twilio', 3)
      },
      {
        id: 'TICK-2025-006',
        subject: 'Webhook not receiving lead notifications',
        description: 'Lead capture webhook stopped working. No notifications since yesterday.',
        priority: 'High',
        status: 'Open',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        userEmail: 'sales@cloudtech.com',
        assignedTo: 'Marcus Rodriguez',
        category: 'Integration',
        knowledgeResults: this.searchKnowledge('webhook lead notifications', 3)
      },
      {
        id: 'TICK-2025-007',
        subject: 'Mobile app login issues on iOS devices',
        description: 'Users unable to login on iPhone 15. Works on Android and desktop.',
        priority: 'Medium',
        status: 'In Progress',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        userEmail: 'mobile@enterprise.com',
        assignedTo: 'Daniel Thompson',
        category: 'Mobile',
        knowledgeResults: this.searchKnowledge('mobile login iOS', 3)
      },
      {
        id: 'TICK-2025-008',
        subject: 'Billing integration with Stripe failing',
        description: 'Payment processing stopped working. Customers cannot complete purchases.',
        priority: 'Critical',
        status: 'Open',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        userEmail: 'billing@techinnovations.com',
        assignedTo: 'Sarah Chen',
        category: 'Payment',
        knowledgeResults: this.searchKnowledge('stripe billing payment', 3)
      }
    ];
  }

  private initializeKnowledgeBase() {
    // Initialize with common support topics
    this.knowledgeBase.set('voice-issues', {
      title: 'Voice Recognition Issues',
      content: 'Common voice recognition problems and solutions',
      tags: ['voice', 'recognition', 'microphone'],
      solutions: [
        'Check microphone permissions in browser settings',
        'Ensure microphone is not muted',
        'Try refreshing the page',
        'Check for browser compatibility'
      ]
    });

    this.knowledgeBase.set('automation-errors', {
      title: 'Automation Function Errors',
      content: 'Troubleshooting automation failures',
      tags: ['automation', 'functions', 'errors'],
      solutions: [
        'Check system health status',
        'Review error logs',
        'Verify API connections',
        'Restart affected functions'
      ]
    });

    this.knowledgeBase.set('integration-problems', {
      title: 'Third-party Integration Issues',
      content: 'Resolving connectivity problems with external services',
      tags: ['integration', 'api', 'connectivity'],
      solutions: [
        'Verify API credentials',
        'Check service status',
        'Review rate limits',
        'Test endpoint connectivity'
      ]
    });
  }

  public searchKnowledge(query: string, maxResults: number = 5) {
    const results: any[] = [];
    const searchTerms = query.toLowerCase().split(' ');

    for (const [key, article] of this.knowledgeBase) {
      let relevanceScore = 0;
      
      // Check title match
      searchTerms.forEach(term => {
        if (article.title.toLowerCase().includes(term)) {
          relevanceScore += 3;
        }
        if (article.content.toLowerCase().includes(term)) {
          relevanceScore += 2;
        }
        article.tags.forEach((tag: string) => {
          if (tag.toLowerCase().includes(term)) {
            relevanceScore += 1;
          }
        });
      });

      if (relevanceScore > 0) {
        results.push({
          id: key,
          title: article.title,
          content: article.content,
          solutions: article.solutions,
          relevanceScore
        });
      }
    }

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxResults);
  }

  public createTicket(data: any) {
    const ticket = {
      id: `TICK-${Date.now()}`,
      subject: data.subject,
      description: data.description,
      priority: data.priority || 'Medium',
      status: 'Open',
      createdAt: new Date().toISOString(),
      userEmail: data.userEmail || 'support@engage-smarter.com',
      knowledgeResults: this.searchKnowledge(`${data.subject} ${data.description}`, 3)
    };

    this.tickets.push(ticket);
    return ticket;
  }

  public getTickets() {
    return this.tickets;
  }

  public addKnowledgeArticle(key: string, article: any) {
    this.knowledgeBase.set(key, article);
  }

  public getKnowledgeStats() {
    return {
      totalArticles: this.knowledgeBase.size,
      totalTickets: this.tickets.length,
      recentTickets: this.tickets.slice(-5)
    };
  }
}

// Global instance
export const zendeskIntegration = new ZendeskIntegration();

// Route handlers
export function registerZendeskRoutes(app: any) {
  // Create support ticket with knowledge base integration
  app.post('/api/zendesk/create-ticket', (req: Request, res: Response) => {
    try {
      const ticket = zendeskIntegration.createTicket(req.body);
      
      res.json({
        success: true,
        ticket,
        message: 'Support ticket created with knowledge base integration'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get all tickets
  app.get('/api/zendesk/tickets', (req: Request, res: Response) => {
    try {
      const systemMode = getSystemModeLocal();
      let tickets;
      
      if (systemMode === 'test') {
        // Return test data
        tickets = zendeskIntegration.getTickets();
      } else {
        // Live mode - return empty array for authentic data only
        tickets = [];
      }
      
      res.json({
        success: true,
        tickets
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Search knowledge base
  app.post('/api/zendesk/knowledge/search', (req: Request, res: Response) => {
    try {
      const systemMode = getSystemModeLocal();
      const { query, maxResults = 5 } = req.body;
      let results;
      
      if (systemMode === 'test') {
        // Return test knowledge base results
        results = zendeskIntegration.searchKnowledge(query, maxResults);
      } else {
        // Live mode - return empty results for authentic data only
        results = [];
      }
      
      res.json({
        success: true,
        results,
        query
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });

  // Get knowledge base stats
  app.get('/api/zendesk/stats', (req: Request, res: Response) => {
    try {
      const systemMode = getSystemModeLocal();
      let stats;
      
      if (systemMode === 'test') {
        // Return test stats
        stats = zendeskIntegration.getKnowledgeStats();
      } else {
        // Live mode - return empty stats for authentic data only
        stats = {
          totalTickets: 0,
          openTickets: 0,
          resolvedTickets: 0,
          knowledgeArticles: 0,
          recentTickets: []
        };
      }
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}