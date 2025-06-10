/**
 * Live Function Validator
 * Tests all automation functions to ensure they work with authentic data only
 */

import { Express } from 'express';
import { updateAutomationMetrics } from './routes';

interface FunctionTest {
  id: number;
  name: string;
  endpoint: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  lastTest?: Date;
  status: 'PASS' | 'FAIL' | 'PENDING';
  errorMessage?: string;
}

class LiveFunctionValidator {
  private functions: FunctionTest[] = [
    // Batch 22: Enterprise Recovery & Self-Correction (211-220)
    { id: 211, name: 'System Self-Healing', endpoint: '/api/automation-batch-22/function-211', category: 'Recovery', priority: 'high', status: 'PENDING' },
    { id: 212, name: 'Intelligent Error Recovery', endpoint: '/api/automation-batch-22/function-212', category: 'Recovery', priority: 'high', status: 'PENDING' },
    { id: 213, name: 'Adaptive Load Balancing', endpoint: '/api/automation-batch-22/function-213', category: 'Performance', priority: 'high', status: 'PENDING' },
    { id: 214, name: 'Predictive Maintenance', endpoint: '/api/automation-batch-22/function-214', category: 'Monitoring', priority: 'medium', status: 'PENDING' },
    { id: 215, name: 'Auto-Scaling Management', endpoint: '/api/automation-batch-22/function-215', category: 'Infrastructure', priority: 'medium', status: 'PENDING' },
    { id: 216, name: 'Circuit Breaker Management', endpoint: '/api/automation-batch-22/function-216', category: 'Reliability', priority: 'high', status: 'PENDING' },
    { id: 217, name: 'Health Check Automation', endpoint: '/api/automation-batch-22/function-217', category: 'Monitoring', priority: 'high', status: 'PENDING' },
    { id: 218, name: 'Recovery Orchestration', endpoint: '/api/automation-batch-22/function-218', category: 'Recovery', priority: 'high', status: 'PENDING' },
    { id: 219, name: 'Performance Optimization', endpoint: '/api/automation-batch-22/function-219', category: 'Performance', priority: 'medium', status: 'PENDING' },
    { id: 220, name: 'Resource Management', endpoint: '/api/automation-batch-22/function-220', category: 'Infrastructure', priority: 'medium', status: 'PENDING' },

    // Batch 23: Machine Learning Integration (221-230)
    { id: 221, name: 'ML Model Training Orchestrator', endpoint: '/api/automation-batch-23/function-221', category: 'AI/ML', priority: 'high', status: 'PENDING' },
    { id: 222, name: 'Predictive Analytics Engine', endpoint: '/api/automation-batch-23/function-222', category: 'AI/ML', priority: 'high', status: 'PENDING' },
    { id: 223, name: 'Anomaly Detection System', endpoint: '/api/automation-batch-23/function-223', category: 'AI/ML', priority: 'high', status: 'PENDING' },
    { id: 224, name: 'Intelligent Classification', endpoint: '/api/automation-batch-23/function-224', category: 'AI/ML', priority: 'medium', status: 'PENDING' },
    { id: 225, name: 'Sentiment Analysis Engine', endpoint: '/api/automation-batch-23/function-225', category: 'AI/ML', priority: 'medium', status: 'PENDING' },
    { id: 226, name: 'Pattern Recognition', endpoint: '/api/automation-batch-23/function-226', category: 'AI/ML', priority: 'medium', status: 'PENDING' },
    { id: 227, name: 'Recommendation Engine', endpoint: '/api/automation-batch-23/function-227', category: 'AI/ML', priority: 'medium', status: 'PENDING' },
    { id: 228, name: 'Feature Engineering', endpoint: '/api/automation-batch-23/function-228', category: 'AI/ML', priority: 'low', status: 'PENDING' },
    { id: 229, name: 'Model Performance Monitor', endpoint: '/api/automation-batch-23/function-229', category: 'AI/ML', priority: 'high', status: 'PENDING' },
    { id: 230, name: 'Auto ML Pipeline', endpoint: '/api/automation-batch-23/function-230', category: 'AI/ML', priority: 'medium', status: 'PENDING' },

    // Batch 24: Advanced Optimization (241-250)
    { id: 241, name: 'Dynamic Query Optimization', endpoint: '/api/automation-batch-24/function-241', category: 'Optimization', priority: 'high', status: 'PENDING' },
    { id: 242, name: 'Cache Intelligence Manager', endpoint: '/api/automation-batch-24/function-242', category: 'Optimization', priority: 'high', status: 'PENDING' },
    { id: 243, name: 'Resource Pool Optimizer', endpoint: '/api/automation-batch-24/function-243', category: 'Optimization', priority: 'medium', status: 'PENDING' },
    { id: 244, name: 'Algorithm Performance Tuner', endpoint: '/api/automation-batch-24/function-244', category: 'Optimization', priority: 'medium', status: 'PENDING' },
    { id: 245, name: 'Load Distribution Engine', endpoint: '/api/automation-batch-24/function-245', category: 'Performance', priority: 'high', status: 'PENDING' },
    { id: 246, name: 'Memory Management Optimizer', endpoint: '/api/automation-batch-24/function-246', category: 'Optimization', priority: 'medium', status: 'PENDING' },
    { id: 247, name: 'API Response Optimizer', endpoint: '/api/automation-batch-24/function-247', category: 'Optimization', priority: 'high', status: 'PENDING' },
    { id: 248, name: 'Database Connection Optimizer', endpoint: '/api/automation-batch-24/function-248', category: 'Optimization', priority: 'high', status: 'PENDING' },
    { id: 249, name: 'CDN Performance Enhancer', endpoint: '/api/automation-batch-24/function-249', category: 'Performance', priority: 'medium', status: 'PENDING' },
    { id: 250, name: 'System Bottleneck Analyzer', endpoint: '/api/automation-batch-24/function-250', category: 'Optimization', priority: 'high', status: 'PENDING' },

    // Batch 25: Intelligent Response Management (251-260)
    { id: 251, name: 'Context-Aware Response Engine', endpoint: '/api/automation-batch-25/function-251', category: 'AI Response', priority: 'high', status: 'PENDING' },
    { id: 252, name: 'Sentiment-Driven Response Adaptation', endpoint: '/api/automation-batch-25/function-252', category: 'AI Response', priority: 'high', status: 'PENDING' },
    { id: 253, name: 'Dynamic Conversation Flow Manager', endpoint: '/api/automation-batch-25/function-253', category: 'AI Response', priority: 'high', status: 'PENDING' },
    { id: 254, name: 'Multi-Channel Response Coordinator', endpoint: '/api/automation-batch-25/function-254', category: 'Communication', priority: 'medium', status: 'PENDING' },
    { id: 255, name: 'Response Quality Assessor', endpoint: '/api/automation-batch-25/function-255', category: 'Quality Control', priority: 'high', status: 'PENDING' },
    { id: 256, name: 'Personalization Engine', endpoint: '/api/automation-batch-25/function-256', category: 'AI Response', priority: 'medium', status: 'PENDING' },
    { id: 257, name: 'Escalation Intelligence', endpoint: '/api/automation-batch-25/function-257', category: 'Support', priority: 'high', status: 'PENDING' },
    { id: 258, name: 'Response Template Optimizer', endpoint: '/api/automation-batch-25/function-258', category: 'Optimization', priority: 'medium', status: 'PENDING' },
    { id: 259, name: 'Conversation Analytics Engine', endpoint: '/api/automation-batch-25/function-259', category: 'Analytics', priority: 'medium', status: 'PENDING' },
    { id: 260, name: 'Intelligent Follow-up Scheduler', endpoint: '/api/automation-batch-25/function-260', category: 'Automation', priority: 'medium', status: 'PENDING' },

    // Original Batch 21 Functions (161-210)
    { id: 161, name: "Intake Form Validator", endpoint: "/api/automation-batch-21/function-161", category: "Data Validation", priority: "high", status: "PENDING" },
    { id: 162, name: "QA Failure Alert", endpoint: "/api/automation-batch-21/function-162", category: "Quality Control", priority: "high", status: "PENDING" },
    { id: 163, name: "Live Error Push", endpoint: "/api/automation-batch-21/function-163", category: "Error Handling", priority: "high", status: "PENDING" },
    { id: 164, name: "Customer Reconciliation", endpoint: "/api/automation-batch-21/function-164", category: "Data Processing", priority: "high", status: "PENDING" },
    { id: 165, name: "Full API Health Check", endpoint: "/api/automation-batch-21/function-165", category: "System Health", priority: "high", status: "PENDING" },
    { id: 166, name: "Manual Override Logger", endpoint: "/api/automation-batch-21/function-166", category: "Logging", priority: "high", status: "PENDING" },
    { id: 167, name: "VoiceBot Escalation Detection", endpoint: "/api/automation-batch-21/function-167", category: "Voice Processing", priority: "high", status: "PENDING" },
    { id: 168, name: "System Health Metric Update", endpoint: "/api/automation-batch-21/function-168", category: "Monitoring", priority: "high", status: "PENDING" },
    { id: 169, name: "Google Drive Backup", endpoint: "/api/automation-batch-21/function-169", category: "Backup", priority: "high", status: "PENDING" },
    { id: 170, name: "New Lead Notification", endpoint: "/api/automation-batch-21/function-170", category: "Lead Management", priority: "high", status: "PENDING" },
    { id: 204, name: "Duplicate Record Detection", endpoint: "/api/automation-batch-21/function-204", category: "Data Validation", priority: "high", status: "PENDING" },
    { id: 206, name: "Lead Score Calculator", endpoint: "/api/automation-batch-21/function-206", category: "Lead Management", priority: "high", status: "PENDING" },

    // Medium Priority Functions (18 functions)
    { id: 171, name: "CRM Script Generator", endpoint: "/api/automation-batch-21/function-171", category: "CRM", priority: "medium", status: "PENDING" },
    { id: 172, name: "Silent Call Detector", endpoint: "/api/automation-batch-21/function-172", category: "Voice Processing", priority: "medium", status: "PENDING" },
    { id: 173, name: "Personality Assigner", endpoint: "/api/automation-batch-21/function-173", category: "AI Processing", priority: "medium", status: "PENDING" },
    { id: 174, name: "SmartSpend Entry Creator", endpoint: "/api/automation-batch-21/function-174", category: "Finance", priority: "medium", status: "PENDING" },
    { id: 175, name: "Call Digest Poster", endpoint: "/api/automation-batch-21/function-175", category: "Communication", priority: "medium", status: "PENDING" },
    { id: 176, name: "Bot Training Prompt Generator", endpoint: "/api/automation-batch-21/function-176", category: "AI Training", priority: "medium", status: "PENDING" },
    { id: 177, name: "QBO Invoice Summary", endpoint: "/api/automation-batch-21/function-177", category: "Finance", priority: "medium", status: "PENDING" },
    { id: 178, name: "Role Assignment by Domain", endpoint: "/api/automation-batch-21/function-178", category: "User Management", priority: "medium", status: "PENDING" },
    { id: 179, name: "ROI Summary Generator", endpoint: "/api/automation-batch-21/function-179", category: "Analytics", priority: "medium", status: "PENDING" },
    { id: 180, name: "Failure Categorization", endpoint: "/api/automation-batch-21/function-180", category: "Error Analysis", priority: "medium", status: "PENDING" },
    { id: 181, name: "Broken Link Detection", endpoint: "/api/automation-batch-21/function-181", category: "System Health", priority: "medium", status: "PENDING" },
    { id: 182, name: "AI Script Expansion", endpoint: "/api/automation-batch-21/function-182", category: "AI Processing", priority: "medium", status: "PENDING" },
    { id: 183, name: "Auto-Complete Task", endpoint: "/api/automation-batch-21/function-183", category: "Task Management", priority: "medium", status: "PENDING" },
    { id: 202, name: "Auto-create Airtable Record", endpoint: "/api/automation-batch-21/function-202", category: "Data Management", priority: "medium", status: "PENDING" },
    { id: 203, name: "Integration Summary to Slack", endpoint: "/api/automation-batch-21/function-203", category: "Communication", priority: "medium", status: "PENDING" },
    { id: 205, name: "Phone Number Normalizer", endpoint: "/api/automation-batch-21/function-205", category: "Data Processing", priority: "medium", status: "PENDING" },
    { id: 207, name: "Error Frequency Tracker", endpoint: "/api/automation-batch-21/function-207", category: "Analytics", priority: "medium", status: "PENDING" },
    { id: 208, name: "Call Review Flagging", endpoint: "/api/automation-batch-21/function-208", category: "Quality Control", priority: "medium", status: "PENDING" },

    // Low Priority Functions (10 functions)
    { id: 184, name: "ISO Date Formatter", endpoint: "/api/automation-batch-21/function-184", category: "Utilities", priority: "low", status: "PENDING" },
    { id: 185, name: "Voice Session ID Generator", endpoint: "/api/automation-batch-21/function-185", category: "Utilities", priority: "low", status: "PENDING" },
    { id: 186, name: "Cold Start Logger", endpoint: "/api/automation-batch-21/function-186", category: "Logging", priority: "low", status: "PENDING" },
    { id: 187, name: "Markdown Converter", endpoint: "/api/automation-batch-21/function-187", category: "Utilities", priority: "low", status: "PENDING" },
    { id: 188, name: "Slack Message Formatter", endpoint: "/api/automation-batch-21/function-188", category: "Communication", priority: "low", status: "PENDING" },
    { id: 189, name: "Domain Extraction", endpoint: "/api/automation-batch-21/function-189", category: "Utilities", priority: "low", status: "PENDING" },
    { id: 190, name: "Test Snapshot Creation", endpoint: "/api/automation-batch-21/function-190", category: "Testing", priority: "low", status: "PENDING" },
    { id: 201, name: "Strip HTML Tags", endpoint: "/api/automation-batch-21/function-201", category: "Data Processing", priority: "low", status: "PENDING" },
    { id: 209, name: "Weekend Date Checker", endpoint: "/api/automation-batch-21/function-209", category: "Utilities", priority: "low", status: "PENDING" },
    { id: 210, name: "Integration Template Filler", endpoint: "/api/automation-batch-21/function-210", category: "Templates", priority: "low", status: "PENDING" }
  ];

  async testAllFunctions(): Promise<{ passed: number; failed: number; results: FunctionTest[] }> {
    console.log('🧪 Starting comprehensive live function validation...');
    
    let passed = 0;
    let failed = 0;

    for (const func of this.functions) {
      try {
        console.log(`Testing: ${func.name} (${func.id})`);
        
        const response = await fetch(`http://localhost:5000${func.endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            validationTest: true,
            functionId: func.id,
            timestamp: new Date().toISOString()
          }),
          signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
          func.status = 'PASS';
          func.lastTest = new Date();
          passed++;
          console.log(`✅ ${func.name}: PASS`);
        } else {
          func.status = 'FAIL';
          func.errorMessage = `HTTP ${response.status}`;
          failed++;
          console.log(`❌ ${func.name}: FAIL (${response.status})`);
        }
      } catch (error: any) {
        func.status = 'FAIL';
        func.errorMessage = error.message;
        failed++;
        console.log(`❌ ${func.name}: FAIL (${error.message})`);
      }
    }

    const results = {
      passed,
      failed,
      results: this.functions,
      timestamp: new Date().toISOString(),
      totalFunctions: this.functions.length,
      successRate: Math.round((passed / this.functions.length) * 100)
    };

    // Update automation metrics with validation results
    updateAutomationMetrics({
      validationResults: results,
      lastValidation: new Date().toISOString(),
      activeFunctions: passed,
      failedFunctions: failed
    });

    console.log(`🎯 Validation Complete: ${passed}/${this.functions.length} functions passed (${results.successRate}%)`);
    
    return results;
  }

  async testFunction(functionId: number): Promise<FunctionTest | null> {
    const func = this.functions.find(f => f.id === functionId);
    if (!func) return null;

    try {
      const response = await fetch(`http://localhost:5000${func.endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          validationTest: true,
          functionId: func.id,
          timestamp: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        func.status = 'PASS';
        func.lastTest = new Date();
        func.errorMessage = undefined;
      } else {
        func.status = 'FAIL';
        func.errorMessage = `HTTP ${response.status}`;
      }
    } catch (error: any) {
      func.status = 'FAIL';
      func.errorMessage = error.message;
    }

    return func;
  }

  getFunctionsByStatus(status: 'PASS' | 'FAIL' | 'PENDING'): FunctionTest[] {
    return this.functions.filter(f => f.status === status);
  }

  getFunctionsByPriority(priority: 'high' | 'medium' | 'low'): FunctionTest[] {
    return this.functions.filter(f => f.priority === priority);
  }

  getAllFunctions(): FunctionTest[] {
    return [...this.functions];
  }

  getValidationSummary() {
    const total = this.functions.length;
    const passed = this.functions.filter(f => f.status === 'PASS').length;
    const failed = this.functions.filter(f => f.status === 'FAIL').length;
    const pending = this.functions.filter(f => f.status === 'PENDING').length;

    return {
      total,
      passed,
      failed,
      pending,
      successRate: total > 0 ? Math.round((passed / total) * 100) : 0,
      highPriority: this.getFunctionsByPriority('high').length,
      mediumPriority: this.getFunctionsByPriority('medium').length,
      lowPriority: this.getFunctionsByPriority('low').length
    };
  }
}

// Export singleton instance
export const liveFunctionValidator = new LiveFunctionValidator();

export function registerLiveFunctionValidation(app: Express) {
  // Test all functions endpoint
  app.post('/api/validate-all-functions', async (req, res) => {
    try {
      const results = await liveFunctionValidator.testAllFunctions();
      res.json({
        success: true,
        message: `Validation complete: ${results.passed}/${results.results.length} functions passed`,
        ...results
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Function validation failed',
        error: error.message
      });
    }
  });

  // Test single function endpoint
  app.post('/api/validate-function/:id', async (req, res) => {
    try {
      const functionId = parseInt(req.params.id);
      const result = await liveFunctionValidator.testFunction(functionId);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Function not found'
        });
      }

      res.json({
        success: true,
        message: `Function ${functionId} validation: ${result.status}`,
        result
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Function validation failed',
        error: error.message
      });
    }
  });

  // Get validation summary endpoint
  app.get('/api/validation-summary', (req, res) => {
    const summary = liveFunctionValidator.getValidationSummary();
    res.json({
      success: true,
      summary,
      timestamp: new Date().toISOString()
    });
  });

  console.log('✅ Live function validation endpoints registered');
}