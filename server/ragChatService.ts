/**
 * RAG Chat Service
 * Handles intelligent chat responses using knowledge base and escalation to Zendesk
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

interface RAGQuery {
  query: string;
  context: string;
}

interface RAGResponse {
  reply: string;
  confidence: number;
  sources: string[];
  escalationNeeded: boolean;
}

interface KnowledgeDocument {
  id: string;
  content: string;
  title: string;
  category: string;
  relevanceScore?: number;
}

class RAGChatService {
  private openai: OpenAI;
  private knowledgeBase: KnowledgeDocument[] = [];

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.loadKnowledgeBase();
  }

  /**
   * Load knowledge base from files and documents
   */
  private async loadKnowledgeBase() {
    try {
      // Load from knowledge_data directory
      const knowledgeDir = path.join(process.cwd(), 'knowledge_data');
      if (fs.existsSync(knowledgeDir)) {
        const files = fs.readdirSync(knowledgeDir);
        
        for (const file of files) {
          if (file.endsWith('.json') || file.endsWith('.txt')) {
            const filePath = path.join(knowledgeDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            this.knowledgeBase.push({
              id: file,
              content: content,
              title: file.replace(/\.[^/.]+$/, ""),
              category: 'documentation'
            });
          }
        }
      }

      // Add YoBot-specific knowledge
      this.knowledgeBase.push(
        {
          id: 'yobot_features',
          title: 'YoBot Core Features',
          category: 'features',
          content: `YoBot is an advanced automation platform that includes:
          
          - Smart Calendar Integration with Google Calendar sync
          - Voice Command Interface with real-time processing
          - Lead Scraping with Phantom Buster and Apollo integration
          - Airtable CRM sync for lead management
          - SMS and Email automation
          - Call monitoring and sentiment analysis
          - Revenue forecasting and SmartSpend tracking
          - Multi-mode operation (Test/Live environments)
          - Knowledge base management with RAG capabilities
          - Zendesk integration for support ticketing`
        },
        {
          id: 'troubleshooting',
          title: 'Common Troubleshooting',
          category: 'support',
          content: `Common YoBot issues and solutions:
          
          1. Voice Commands Not Working:
             - Check microphone permissions
             - Ensure Voice Interface is enabled
             - Verify ElevenLabs API key is configured
          
          2. Calendar Sync Issues:
             - Verify Google Calendar API credentials
             - Check file format (ICS or CSV only)
             - Ensure proper date formatting
          
          3. Lead Scraping Problems:
             - Confirm Phantom Buster API key
             - Check Apollo integration settings
             - Verify Airtable write permissions
          
          4. Airtable Connection Errors:
             - Validate API key and base IDs
             - Check field mapping configuration
             - Ensure proper table permissions
          
          5. System Mode Issues:
             - Toggle between Test/Live modes
             - Clear browser cache if needed
             - Check system health indicators`
        },
        {
          id: 'automation_setup',
          title: 'Automation Setup Guide',
          category: 'setup',
          content: `Setting up YoBot automations:
          
          1. Pipeline Configuration:
             - Configure lead sources (Apollo, Phantom Buster)
             - Set up Airtable base connections
             - Define automation triggers and actions
          
          2. Voice Bot Setup:
             - Configure ElevenLabs voice personas
             - Set up call monitoring preferences
             - Define escalation rules
          
          3. Smart Calendar:
             - Connect Google Calendar account
             - Upload team member schedules
             - Configure booking preferences
          
          4. SmartSpend Tracking:
             - Set budget parameters
             - Configure ROI tracking
             - Set up cost per lead monitoring
          
          5. Notification Setup:
             - Configure Slack alerts
             - Set up email notifications
             - Define escalation pathways`
        }
      );

      console.log(`Loaded ${this.knowledgeBase.length} knowledge documents`);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
    }
  }

  /**
   * Search knowledge base for relevant documents
   */
  private searchKnowledge(query: string): KnowledgeDocument[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter(word => word.length > 2);
    
    const scoredDocs = this.knowledgeBase.map(doc => {
      let score = 0;
      const docContent = doc.content.toLowerCase();
      const docTitle = doc.title.toLowerCase();
      
      // Score based on keyword matches
      keywords.forEach(keyword => {
        const titleMatches = (docTitle.match(new RegExp(keyword, 'g')) || []).length;
        const contentMatches = (docContent.match(new RegExp(keyword, 'g')) || []).length;
        
        score += titleMatches * 3; // Title matches are more important
        score += contentMatches;
      });
      
      // Boost score for exact phrase matches
      if (docContent.includes(queryLower)) {
        score += 10;
      }
      
      return { ...doc, relevanceScore: score };
    });
    
    return scoredDocs
      .filter(doc => doc.relevanceScore! > 0)
      .sort((a, b) => b.relevanceScore! - a.relevanceScore!)
      .slice(0, 3); // Return top 3 most relevant documents
  }

  /**
   * Generate AI response using OpenAI with RAG context
   */
  async processQuery(ragQuery: RAGQuery): Promise<RAGResponse> {
    try {
      const relevantDocs = this.searchKnowledge(ragQuery.query);
      
      // Build context from relevant documents
      const context = relevantDocs
        .map(doc => `${doc.title}: ${doc.content}`)
        .join('\n\n');
      
      const systemPrompt = `You are YoBot Support Assistant, an expert on the YoBot automation platform. 
      
      Use the following knowledge base to answer user questions accurately and helpfully:
      
      ${context}
      
      Guidelines:
      - Provide specific, actionable answers based on the knowledge base
      - If the answer isn't in the knowledge base, say so and suggest creating a support ticket
      - Be concise but thorough
      - Include relevant steps or troubleshooting when applicable
      - If the issue requires human intervention, recommend escalation
      
      Escalation triggers:
      - Complex technical issues requiring code changes
      - Account-specific problems requiring access to user data
      - Billing or subscription issues
      - Issues not covered in the knowledge base`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: ragQuery.query }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const reply = completion.choices[0]?.message?.content || 
        "I'm unable to process your request right now. Let me create a support ticket for you.";

      // Calculate confidence based on knowledge match and response quality
      const confidence = this.calculateConfidence(ragQuery.query, relevantDocs, reply);
      
      // Determine if escalation is needed
      const escalationNeeded = this.shouldEscalate(ragQuery.query, reply, confidence);
      
      const sources = relevantDocs.map(doc => doc.title);

      return {
        reply,
        confidence,
        sources,
        escalationNeeded
      };

    } catch (error) {
      console.error('RAG processing error:', error);
      
      return {
        reply: "I'm experiencing technical difficulties. I'll create a support ticket for you so our team can assist directly.",
        confidence: 0,
        sources: [],
        escalationNeeded: true
      };
    }
  }

  /**
   * Calculate confidence score based on knowledge matches and response quality
   */
  private calculateConfidence(query: string, docs: KnowledgeDocument[], reply: string): number {
    let confidence = 0.3; // Base confidence
    
    // Boost confidence based on knowledge matches
    if (docs.length > 0) {
      const avgRelevance = docs.reduce((sum, doc) => sum + (doc.relevanceScore || 0), 0) / docs.length;
      confidence += Math.min(avgRelevance / 100, 0.4); // Max boost of 0.4
    }
    
    // Boost confidence if reply contains specific information
    if (reply.includes('step') || reply.includes('configure') || reply.includes('check')) {
      confidence += 0.2;
    }
    
    // Reduce confidence for generic responses
    if (reply.includes("I'm unable") || reply.includes("create a support ticket")) {
      confidence = Math.min(confidence, 0.3);
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Determine if human escalation is needed
   */
  private shouldEscalate(query: string, reply: string, confidence: number): boolean {
    // Low confidence responses should escalate
    if (confidence < 0.6) return true;
    
    // Specific escalation keywords in query
    const escalationKeywords = [
      'billing', 'payment', 'refund', 'cancel', 'delete account',
      'not working', 'broken', 'error', 'bug', 'urgent', 'emergency'
    ];
    
    const queryLower = query.toLowerCase();
    if (escalationKeywords.some(keyword => queryLower.includes(keyword))) {
      return true;
    }
    
    // If reply suggests escalation
    if (reply.includes('support ticket') || reply.includes('contact support')) {
      return true;
    }
    
    return false;
  }

  /**
   * Get knowledge base statistics
   */
  getKnowledgeStats() {
    const categories = [...new Set(this.knowledgeBase.map(doc => doc.category))];
    return {
      totalDocuments: this.knowledgeBase.length,
      categories: categories.map(cat => ({
        name: cat,
        count: this.knowledgeBase.filter(doc => doc.category === cat).length
      }))
    };
  }
}

export const ragChatService = new RAGChatService();