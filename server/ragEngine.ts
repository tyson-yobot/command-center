import OpenAI from "openai";
import { storage } from "./newStorage";
import type { KnowledgeBase } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RAGResponse {
  enhancedReply: string;
  sourcesUsed: KnowledgeBase[];
  confidence: number;
  processingTime: number;
}

interface RAGContext {
  userQuery: string;
  conversationHistory?: string[];
  userRole?: string;
  eventType?: string;
  intent?: string;
}

/**
 * Core RAG Engine for YoBot - Retrieves and augments responses with knowledge base
 */
export class RAGEngine {
  
  /**
   * Main RAG processing function
   */
  async processQuery(context: RAGContext): Promise<RAGResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Retrieve relevant knowledge
      const relevantKnowledge = await this.retrieveRelevantKnowledge(context);
      
      // Step 2: Rank and filter knowledge by confidence and priority
      const filteredKnowledge = this.rankKnowledge(relevantKnowledge, context);
      
      // Step 3: Generate enhanced response using retrieved knowledge
      const enhancedReply = await this.generateEnhancedResponse(context, filteredKnowledge);
      
      // Step 4: Update usage statistics
      await this.updateUsageStats(filteredKnowledge);
      
      const processingTime = Date.now() - startTime;
      
      return {
        enhancedReply,
        sourcesUsed: filteredKnowledge,
        confidence: this.calculateOverallConfidence(filteredKnowledge),
        processingTime
      };
      
    } catch (error) {
      console.error('RAG processing error:', error);
      
      // Fallback to basic response
      return {
        enhancedReply: await this.generateBasicResponse(context.userQuery),
        sourcesUsed: [],
        confidence: 50,
        processingTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Retrieve knowledge entries relevant to the user query
   */
  private async retrieveRelevantKnowledge(context: RAGContext): Promise<KnowledgeBase[]> {
    const userId = 1; // Default user for demo
    
    // Get all enabled knowledge entries
    const allKnowledge = await storage.getKnowledgeBase(userId);
    const enabledKnowledge = allKnowledge.filter(kb => kb.status === 'enabled');
    
    const relevantEntries: KnowledgeBase[] = [];
    
    for (const knowledge of enabledKnowledge) {
      let isRelevant = false;
      
      // Check trigger conditions
      if (knowledge.triggerConditions) {
        const triggers = knowledge.triggerConditions as any;
        
        // Text contains matching
        if (triggers.textContains && Array.isArray(triggers.textContains)) {
          for (const keyword of triggers.textContains) {
            if (context.userQuery.toLowerCase().includes(keyword.toLowerCase())) {
              isRelevant = true;
              break;
            }
          }
        }
        
        // Event type matching
        if (triggers.eventType && context.eventType && Array.isArray(triggers.eventType)) {
          if (triggers.eventType.includes(context.eventType)) {
            isRelevant = true;
          }
        }
        
        // Intent matching
        if (triggers.intent && context.intent && Array.isArray(triggers.intent)) {
          if (triggers.intent.includes(context.intent)) {
            isRelevant = true;
          }
        }
      }
      
      // Fallback: Simple text similarity
      if (!isRelevant) {
        const queryWords = context.userQuery.toLowerCase().split(' ');
        const knowledgeText = (knowledge.name + ' ' + knowledge.content).toLowerCase();
        
        const matchingWords = queryWords.filter(word => 
          word.length > 3 && knowledgeText.includes(word)
        );
        
        if (matchingWords.length >= 1) {
          isRelevant = true;
        }
      }
      
      // Remove role visibility restrictions - allow all access
      // All knowledge entries are now universally accessible
      
      if (isRelevant) {
        relevantEntries.push(knowledge);
      }
    }
    
    return relevantEntries;
  }
  
  /**
   * Rank knowledge entries by relevance, confidence, and priority
   */
  private rankKnowledge(knowledge: KnowledgeBase[], context: RAGContext): KnowledgeBase[] {
    return knowledge
      .map(kb => ({
        ...kb,
        relevanceScore: this.calculateRelevanceScore(kb, context)
      }))
      .sort((a, b) => {
        // Sort by priority first, then relevance, then confidence
        if (a.priority !== b.priority) return b.priority - a.priority;
        if (a.relevanceScore !== b.relevanceScore) return b.relevanceScore - a.relevanceScore;
        return b.confidence - a.confidence;
      })
      .slice(0, 5) // Limit to top 5 most relevant entries
      .map(({ relevanceScore, ...kb }) => kb); // Remove temporary score
  }
  
  /**
   * Calculate relevance score for a knowledge entry
   */
  private calculateRelevanceScore(knowledge: KnowledgeBase, context: RAGContext): number {
    let score = 0;
    
    // Base score from confidence and priority
    score += knowledge.confidence * 0.3;
    score += knowledge.priority * 0.2;
    
    // Text similarity bonus
    const queryWords = context.userQuery.toLowerCase().split(' ');
    const knowledgeText = (knowledge.name + ' ' + knowledge.content).toLowerCase();
    
    const matchingWords = queryWords.filter(word => 
      word.length > 3 && knowledgeText.includes(word)
    );
    
    score += (matchingWords.length / queryWords.length) * 50;
    
    // Usage frequency bonus (popular knowledge gets slight boost)
    score += Math.min(knowledge.usageCount * 0.1, 5);
    
    return Math.min(score, 100);
  }
  
  /**
   * Generate enhanced response using OpenAI with retrieved knowledge
   */
  private async generateEnhancedResponse(context: RAGContext, knowledge: KnowledgeBase[]): Promise<string> {
    if (knowledge.length === 0) {
      return await this.generateBasicResponse(context.userQuery);
    }
    
    // Prepare knowledge context for the AI
    const knowledgeContext = knowledge.map(kb => {
      return `Knowledge: ${kb.name}\nContent: ${kb.content}\nBehavior: ${kb.overrideBehavior}\n`;
    }).join('\n---\n');
    
    const systemPrompt = `You are YoBot, an advanced AI assistant. Use the provided knowledge base entries to enhance your response.

KNOWLEDGE BASE:
${knowledgeContext}

INSTRUCTIONS:
- Use the knowledge to provide accurate, helpful responses
- If knowledge has "replace" behavior, prioritize that content
- If knowledge has "append" behavior, add it naturally to your response
- If knowledge has "conditional" behavior, use it only if highly relevant
- Maintain a professional but friendly tone
- Be concise but comprehensive

User Query: ${context.userQuery}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: context.userQuery }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      return response.choices[0].message.content || "I apologize, but I couldn't generate a proper response.";
      
    } catch (error) {
      console.error('OpenAI API error:', error);
      return await this.generateBasicResponse(context.userQuery);
    }
  }
  
  /**
   * Generate basic response without knowledge augmentation
   */
  private async generateBasicResponse(query: string): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are YoBot, a helpful AI assistant. Provide a concise, professional response." },
          { role: "user", content: query }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return response.choices[0].message.content || "I'm here to help! Could you please rephrase your question?";
      
    } catch (error) {
      console.error('Basic response generation error:', error);
      return "I'm experiencing technical difficulties. Please try again in a moment.";
    }
  }
  
  /**
   * Update usage statistics for knowledge entries
   */
  private async updateUsageStats(knowledge: KnowledgeBase[]): Promise<void> {
    for (const kb of knowledge) {
      try {
        await storage.updateKnowledgeBase(kb.id, {
          usageCount: (kb.usageCount || 0) + 1,
          lastUsedAt: new Date()
        });
      } catch (error) {
        console.error(`Failed to update usage stats for knowledge ${kb.id}:`, error);
      }
    }
  }
  
  /**
   * Calculate overall confidence based on used knowledge
   */
  private calculateOverallConfidence(knowledge: KnowledgeBase[]): number {
    if (knowledge.length === 0) return 50;
    
    const avgConfidence = knowledge.reduce((sum, kb) => sum + kb.confidence, 0) / knowledge.length;
    const priorityBonus = Math.max(...knowledge.map(kb => kb.priority)) * 0.1;
    
    return Math.min(avgConfidence + priorityBonus, 100);
  }
}

// Export singleton instance
export const ragEngine = new RAGEngine();