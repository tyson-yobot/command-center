import { knowledgeStorage } from './knowledgeStorage';
import { getSystemModeLocal } from './routes';

// Test/sample content patterns to identify and remove in live mode
const TEST_CONTENT_PATTERNS = [
  'YoBot Enterprise Features',
  'Call Handling Best Practices',
  'Memory Entry - urls',
  'yobot.bot',
  'enterprise-grade voice automation',
  'Advanced call routing',
  'sentiment analysis',
  'CRM integration capabilities',
  'Always answer within 2 rings',
  'Maintain professional tone',
  'Escalate to human when sentiment drops',
  'test data',
  'sample content',
  'demo content',
  'placeholder',
  'example document'
];

const TEST_CATEGORIES = [
  'product',
  'protocols', 
  'urls',
  'demo',
  'test',
  'sample',
  'example'
];

interface KnowledgeItem {
  id: number;
  type: string;
  title: string;
  content: string;
  category: string;
  uploadTime: string;
  fileSize: number;
  fileType: string;
  keyTerms: string[];
  wordCount: number;
  status: string;
}

export class LiveKnowledgePurge {
  
  async identifyTestContent(items: KnowledgeItem[]): Promise<number[]> {
    const testItemIds: number[] = [];
    
    for (const item of items) {
      const isTestContent = this.isTestContentItem(item);
      if (isTestContent) {
        testItemIds.push(item.id);
        console.log(`[LIVE PURGE] Identified test content: ${item.title} (ID: ${item.id})`);
      }
    }
    
    return testItemIds;
  }
  
  private isTestContentItem(item: KnowledgeItem): boolean {
    // Check title for test patterns
    const titleMatch = TEST_CONTENT_PATTERNS.some(pattern => 
      item.title.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Check content for test patterns
    const contentMatch = TEST_CONTENT_PATTERNS.some(pattern => 
      item.content.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Check category for test categories
    const categoryMatch = TEST_CATEGORIES.includes(item.category.toLowerCase());
    
    // Check for generic/demo key terms
    const keyTermsMatch = item.keyTerms && item.keyTerms.some(term => 
      ['demo', 'test', 'sample', 'example', 'placeholder'].includes(term.toLowerCase())
    );
    
    return titleMatch || contentMatch || categoryMatch || keyTermsMatch;
  }
  
  async purgeTestContentInLiveMode(): Promise<{ removed: number; message: string }> {
    const systemMode = getSystemModeLocal();
    
    if (systemMode !== 'live') {
      return { removed: 0, message: 'Not in live mode - test content preserved' };
    }
    
    try {
      // Get all knowledge items from database
      const dbItems = await knowledgeStorage.getAllKnowledgeItems();
      const testItemIds = await this.identifyTestContent(dbItems);
      
      if (testItemIds.length === 0) {
        return { removed: 0, message: 'No test content found to remove' };
      }
      
      // Remove test items from database
      for (const itemId of testItemIds) {
        await knowledgeStorage.deleteKnowledgeItem(itemId);
        console.log(`[LIVE PURGE] Removed test item ID: ${itemId}`);
      }
      
      return { 
        removed: testItemIds.length, 
        message: `Removed ${testItemIds.length} test/sample knowledge items in live mode` 
      };
      
    } catch (error) {
      console.error('[LIVE PURGE] Error during knowledge purge:', error);
      return { removed: 0, message: 'Error during knowledge purge' };
    }
  }
  
  // Auto-purge on startup in live mode
  async autoInitPurge(): Promise<void> {
    const systemMode = getSystemModeLocal();
    
    if (systemMode === 'live') {
      console.log('[LIVE PURGE] Auto-purging test content on startup...');
      const result = await this.purgeTestContentInLiveMode();
      console.log(`[LIVE PURGE] Startup purge complete: ${result.message}`);
    }
  }
}

export const liveKnowledgePurge = new LiveKnowledgePurge();