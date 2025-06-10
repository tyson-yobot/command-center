import { Request, Response } from 'express';

// Enhanced Zendesk integration with knowledge base connectivity
export class ZendeskIntegration {
  private knowledgeBase: Map<string, any> = new Map();
  private tickets: any[] = [];

  constructor() {
    this.initializeKnowledgeBase();
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
      const tickets = zendeskIntegration.getTickets();
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
      const { query, maxResults = 5 } = req.body;
      const results = zendeskIntegration.searchKnowledge(query, maxResults);
      
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
      const stats = zendeskIntegration.getKnowledgeStats();
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