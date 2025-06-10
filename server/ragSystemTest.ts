import { storage } from "./storage";
import { RAGEngine } from "./ragEngine";

export async function testRAGSystem() {
  const results = {
    knowledgeStorage: false,
    knowledgeRetrieval: false,
    knowledgeSearch: false,
    ragProcessing: false,
    errors: [] as string[]
  };

  try {
    // Test 1: Create knowledge base entry
    console.log('Testing knowledge storage...');
    const testKnowledge = await storage.createKnowledgeBase({
      userId: 1,
      name: "Test Knowledge Entry",
      content: "This is a test knowledge entry for YoBot automation system testing. It contains information about voice synthesis, automation functions, and system capabilities.",
      category: "test",
      tags: ["test", "yobot", "automation", "voice", "synthesis"],
      priority: 5,
      confidence: 0.9,
      enabled: true,
      triggerConditions: {
        textContains: ["test", "yobot", "automation"],
        eventType: ["knowledge_search", "test_query"],
        intent: ["testing", "verification"]
      }
    });
    
    if (testKnowledge && testKnowledge.id) {
      results.knowledgeStorage = true;
      console.log('✓ Knowledge storage working');
    }

    // Test 2: Retrieve knowledge
    console.log('Testing knowledge retrieval...');
    const retrievedKnowledge = await storage.getKnowledgeBaseById(testKnowledge.id);
    if (retrievedKnowledge && retrievedKnowledge.content.includes("test knowledge entry")) {
      results.knowledgeRetrieval = true;
      console.log('✓ Knowledge retrieval working');
    }

    // Test 3: Search knowledge base
    console.log('Testing knowledge search...');
    const searchResults = await storage.searchKnowledgeBase(1, "yobot automation test");
    if (searchResults.length > 0) {
      results.knowledgeSearch = true;
      console.log('✓ Knowledge search working');
    }

    // Test 4: RAG processing
    console.log('Testing RAG processing...');
    const ragEngine = new RAGEngine();
    const ragResponse = await ragEngine.processQuery({
      userQuery: "Tell me about YoBot automation testing",
      userRole: "admin",
      eventType: "test_query",
      intent: "testing"
    });
    
    if (ragResponse && ragResponse.enhancedReply) {
      results.ragProcessing = true;
      console.log('✓ RAG processing working');
    }

    // Cleanup: Remove test entry
    await storage.deleteKnowledgeBase(testKnowledge.id);
    console.log('✓ Test cleanup completed');

  } catch (error) {
    results.errors.push(error.message);
    console.error('RAG system test error:', error);
  }

  return results;
}

export async function verifyRAGEndpoints() {
  const endpointTests = {
    upload: false,
    search: false,
    stats: false,
    errors: [] as string[]
  };

  try {
    // Test knowledge stats endpoint
    const response = await fetch('http://localhost:5000/api/knowledge/stats');
    if (response.ok) {
      endpointTests.stats = true;
      console.log('✓ Knowledge stats endpoint working');
    }

    // Test search endpoint
    const searchResponse = await fetch('http://localhost:5000/api/knowledge/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: "test", limit: 5 })
    });
    
    if (searchResponse.ok) {
      endpointTests.search = true;
      console.log('✓ Knowledge search endpoint working');
    }

  } catch (error) {
    endpointTests.errors.push(error.message);
    console.error('Endpoint test error:', error);
  }

  return endpointTests;
}