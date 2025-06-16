/**
 * RAG Chat Service
 * Handles intelligent chat responses using knowledge base and escalation to Zendesk
 */

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { knowledgeStorage } from "./storage";
import type { KnowledgeItem } from "@shared/schema";

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
  private knowledgeCache: KnowledgeDocument[] = [];
  private lastCacheUpdate: number = 0;
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Only initialize OpenAI if we have a valid API key
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    } else {
      console.log('OpenAI API key not configured or invalid, using rule-based responses only');
    }
    this.loadKnowledgeBase();
  }

  /**
   * Load knowledge base from database with caching
   */
  private async loadKnowledgeBase() {
    try {
      // Check if cache is still valid
      const now = Date.now();
      if (this.knowledgeCache.length > 0 && (now - this.lastCacheUpdate) < this.CACHE_DURATION) {
        return;
      }

      // Load from database
      const knowledgeItems = await knowledgeStorage.getKnowledgeItems();
      
      // Convert database items to knowledge documents
      this.knowledgeCache = knowledgeItems.map(item => ({
        id: item.id.toString(),
        content: item.content,
        title: item.title,
        category: item.category
      }));

      // Load from knowledge_data directory if no database items
      if (this.knowledgeCache.length === 0) {
        const knowledgeDir = path.join(process.cwd(), 'knowledge_data');
        if (fs.existsSync(knowledgeDir)) {
          const files = fs.readdirSync(knowledgeDir);
          
          for (const file of files) {
            if (file.endsWith('.json') || file.endsWith('.txt')) {
              const filePath = path.join(knowledgeDir, file);
              const content = fs.readFileSync(filePath, 'utf-8');
              
              // Create knowledge item in database
              const item = await knowledgeStorage.createKnowledgeItem({
                title: file.replace(/\.[^/.]+$/, ""),
                content: content,
                category: 'documentation',
                type: 'document',
                tags: ['imported', 'documentation']
              });
              
              this.knowledgeCache.push({
                id: item.id.toString(),
                content: item.content,
                title: item.title,
                category: item.category
              });
            }
          }
        }
      }

      // If still no items, create essential YoBot knowledge in database
      if (this.knowledgeCache.length === 0) {
        const essentialKnowledge = [
          {
            title: 'YoBot Core Features',
            category: 'features',
            type: 'document' as const,
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
            - Zendesk integration for support ticketing`,
            tags: ['features', 'overview']
          },
          {
            title: 'Common Troubleshooting',
            category: 'support',
            type: 'document' as const,
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
               - Check system health indicators`,
            tags: ['troubleshooting', 'support']
          },
          {
            title: 'Automation Setup Guide',
            category: 'setup',
            type: 'document' as const,
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
               - Define escalation pathways`,
            tags: ['setup', 'automation']
          }
        ];

        for (const knowledge of essentialKnowledge) {
          const item = await knowledgeStorage.createKnowledgeItem(knowledge);
          this.knowledgeCache.push({
            id: item.id.toString(),
            content: item.content,
            title: item.title,
            category: item.category
          });
        }
      }

      this.lastCacheUpdate = now;
      console.log(`Loaded ${this.knowledgeCache.length} knowledge documents from database`);
    } catch (error) {
      console.error('Failed to load knowledge base:', error);
    }
  }

  /**
   * Search knowledge base for relevant documents
   */
  private async searchKnowledge(query: string): Promise<KnowledgeDocument[]> {
    // Ensure knowledge cache is up to date
    await this.loadKnowledgeBase();
    
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(' ').filter(word => word.length > 2);
    
    const scoredDocs = this.knowledgeCache.map(doc => {
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
   * Generate AI response using knowledge base with fallback to rule-based responses
   */
  async processQuery(ragQuery: RAGQuery): Promise<RAGResponse> {
    try {
      const relevantDocs = await this.searchKnowledge(ragQuery.query);
      
      // Try OpenAI first if available, then fallback to rule-based
      if (this.openai && relevantDocs.length > 0) {
        try {
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
          - If the issue requires human intervention, recommend escalation`;

          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: ragQuery.query }
            ],
            temperature: 0.3,
            max_tokens: 500
          });

          const reply = completion.choices[0]?.message?.content || '';
          
          if (reply) {
            const confidence = this.calculateConfidence(ragQuery.query, relevantDocs, reply);
            const escalationNeeded = this.shouldEscalate(ragQuery.query, reply, confidence);
            const sources = relevantDocs.map(doc => doc.title);

            return { reply, confidence, sources, escalationNeeded };
          }
        } catch (openaiError) {
          console.warn('OpenAI unavailable, using rule-based responses:', openaiError.message);
        }
      }

      // Fallback to rule-based responses using knowledge base
      return this.generateRuleBasedResponse(ragQuery.query, relevantDocs);

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
   * Generate rule-based responses using knowledge base matching
   */
  private generateRuleBasedResponse(query: string, relevantDocs: KnowledgeDocument[]): RAGResponse {
    const queryLower = query.toLowerCase();
    
    // If we have relevant documents, extract key information
    if (relevantDocs.length > 0) {
      const topDoc = relevantDocs[0];
      const sources = relevantDocs.map(doc => doc.title);
      
      // Generate response based on document content and query type
      let reply = '';
      let confidence = 0.7;
      
      if (queryLower.includes('what is yobot') || queryLower.includes('what does yobot')) {
        reply = "YoBot is an advanced automation platform that includes Smart Calendar Integration, Voice Command Interface, Lead Scraping with Phantom Buster and Apollo, Airtable CRM sync, SMS/Email automation, Call monitoring, Revenue forecasting, and SmartSpend tracking. It operates in both Test and Live environments for comprehensive automation management.";
        confidence = 0.9;
      } else if (queryLower.includes('voice') || queryLower.includes('command')) {
        reply = "For Voice Commands: Check microphone permissions, ensure Voice Interface is enabled, and verify ElevenLabs API key configuration. Voice commands use real-time processing with multiple personas available.";
        confidence = 0.8;
      } else if (queryLower.includes('calendar') || queryLower.includes('sync')) {
        reply = "For Calendar Sync: Verify Google Calendar API credentials, check file format (ICS or CSV only), ensure proper date formatting, and confirm team member schedules are uploaded correctly.";
        confidence = 0.8;
      } else if (queryLower.includes('lead') || queryLower.includes('scraping')) {
        reply = "For Lead Scraping: Confirm Phantom Buster and Apollo API keys, check Airtable write permissions, verify field mapping configuration, and ensure leads are syncing to the Scraped Leads (Universal) table.";
        confidence = 0.8;
      } else if (queryLower.includes('airtable') || queryLower.includes('connection')) {
        reply = "For Airtable Issues: Validate API key and base IDs, check field mapping configuration, ensure proper table permissions, and verify the connection to your CRM bases.";
        confidence = 0.8;
      } else if (queryLower.includes('smartspend') || queryLower.includes('budget')) {
        reply = "SmartSpend tracks budget utilization, cost per lead, ROI percentage, and budget efficiency scores. Set budget parameters, configure ROI tracking, and monitor cost per lead metrics through the dashboard.";
        confidence = 0.8;
      } else {
        // Generic response using top matching document
        const docContent = topDoc.content.substring(0, 300);
        reply = `Based on your question about "${query}", here's what I found: ${docContent}... Would you like me to create a support ticket for more detailed assistance?`;
        confidence = 0.6;
      }
      
      const escalationNeeded = confidence < 0.7 || queryLower.includes('error') || queryLower.includes('not working');
      
      return { reply, confidence, sources, escalationNeeded };
    }
    
    // No relevant documents found
    return {
      reply: "I don't have specific information about your question in my knowledge base. Let me create a support ticket so our team can provide detailed assistance with your YoBot setup.",
      confidence: 0.3,
      sources: [],
      escalationNeeded: true
    };
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
  async getKnowledgeStats() {
    await this.loadKnowledgeBase();
    const categories = [...new Set(this.knowledgeCache.map(doc => doc.category))];
    return {
      totalDocuments: this.knowledgeCache.length,
      categories: categories.map(cat => ({
        name: cat,
        count: this.knowledgeCache.filter(doc => doc.category === cat).length
      }))
    };
  }
}

export const ragChatService = new RAGChatService();