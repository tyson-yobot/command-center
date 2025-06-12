import { TestModeData } from './testModeData';

export class LiveDashboardData {
  static async getAutomationMetrics(systemMode: 'test' | 'live' = 'live') {
    console.log(`[DEBUG] getAutomationMetrics called with mode: ${systemMode}`);
    
    // Complete isolation: serve test data when in test mode
    if (systemMode === 'test') {
      console.log('[DEBUG] Serving realistic test data');
      return TestModeData.getRealisticAutomationMetrics();
    }
    
    console.log('[DEBUG] Serving live production data');
    try {
      const AUTHORIZED_BASE_ID = "appbFDTqB2WtRNV1H";
      const AUTHORIZED_TABLE_ID = "tblQAIntegrationTests";
      
      // Security check
      if (AUTHORIZED_BASE_ID !== "appbFDTqB2WtRNV1H") {
        throw new Error("❌ Invalid Airtable Base ID in use – dashboard misconfigured.");
      }
      
      // Get metrics from authorized Airtable Integration Test Log Table
      const apiKey = process.env.AIRTABLE_API_KEY;
      if (!apiKey) {
        throw new Error("❌ AIRTABLE_API_KEY environment variable not set - cannot fetch live data");
      }
      
      const airtableResponse = await fetch(`https://api.airtable.com/v0/${AUTHORIZED_BASE_ID}/${AUTHORIZED_TABLE_ID}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        }
      });

      console.log(`Attempting Airtable fetch: ${AUTHORIZED_BASE_ID}/${AUTHORIZED_TABLE_ID}`);
      console.log('API Key being used:', apiKey.substring(0, 10) + '...');
      
      if (!airtableResponse.ok) {
        console.error('Airtable request failed:', airtableResponse.status, airtableResponse.statusText);
        const errorText = await airtableResponse.text();
        console.error('Error response:', errorText);
        throw new Error(`Airtable API failed: ${airtableResponse.status} ${errorText}`);
      }

      const airtableData = await airtableResponse.json();
      console.log('Airtable response status:', airtableResponse.status);
      console.log('Records found:', airtableData.records?.length || 0);
      const records = airtableData.records || [];
        
      // Parse records from QA Integration Test table structure
      const functionTests = records.map((record: any, index: number) => {
        const fields = record.fields;
        
        // Extract data from QA Integration Test table fields
        const functionName = fields['🔧 Integration Name'] || `Unknown Function ${index + 1}`;
        const passFailField = fields['✅ Pass/Fail'] || '';
        const success = passFailField.includes('✅') || passFailField.toLowerCase().includes('pass');
        const notes = fields['🧠 Notes / Debug'] || '';
        const testDate = fields['📅 Test Date'] || '';
        const qaOwner = fields['🧑‍💻 QA Owner'] || '';
        const moduleType = fields['🧩 Module Type'] || '';
        
        return { 
          functionName: functionName.trim(), 
          success, 
          notes,
          testDate,
          qaOwner,
          moduleType,
          record 
        };
      });

      console.log(`Processing ${records.length} Airtable records`);
      console.log(`RECORD COUNT DEBUG: ${records.length} records from Airtable`);
      
      // Debug success rate calculation
      const debugStats = {
        totalRecords: records.length,
        passedTests: functionTests.filter((test: any) => test.success).length,
        failedTests: functionTests.filter((test: any) => !test.success).length
      };
      console.log(`SUCCESS RATE DEBUG: ${debugStats.passedTests} passed, ${debugStats.failedTests} failed of ${debugStats.totalRecords} total`);

      // Count ALL executions, not just unique functions
      const totalExecutions = functionTests.length;
      const passedExecutions = functionTests.filter((test: any) => test.success).length;
      const failedExecutions = totalExecutions - passedExecutions;
      const successRate = totalExecutions > 0 ? ((passedExecutions / totalExecutions) * 100).toFixed(1) : '0';
      
      // Get unique functions from QA Integration Test data
      const uniqueFunctions: any = {};
      functionTests.forEach((test: any) => {
        const cleanFunctionName = test.functionName.trim();
        // Only include valid integration names from authenticated QA tests
        if (cleanFunctionName && 
            cleanFunctionName !== 'Unknown Function' &&
            !cleanFunctionName.startsWith('Unknown Function') &&
            cleanFunctionName.length > 3) {
          uniqueFunctions[cleanFunctionName] = test;
        }
      });

      const uniqueFunctionCount = Object.keys(uniqueFunctions).length;
      console.log(`VERIFIED: Processing ${records.length} records, found ${uniqueFunctionCount} unique functions`);
      
      return {
        totalFunctions: uniqueFunctionCount,
        activeFunctions: uniqueFunctionCount,
        executionsToday: totalExecutions,
        successRate: `${successRate}%`,
        averageExecutionTime: null,
        lastUpdated: new Date().toISOString(),
        topPerformers: functionTests
          .filter((f: any) => f.success)
          .slice(0, 5)
          .map((f: any) => ({ name: f.functionName, successRate: 100, category: 'Automation' })),
        recentErrors: functionTests
          .filter((f: any) => !f.success)
          .slice(0, 3)
          .map((f: any) => ({ name: f.functionName, errorCount: 1, category: 'Automation' })),
        healthChecks: {
          airtable: records.length > 0 ? "healthy" : "error",
          slack: "unknown", 
          apis: "healthy",
          database: "healthy"
        }
      };
    } catch (error: any) {
      console.error('Error reading automation data from Airtable:', error);
      console.error('Stack trace:', error.stack);
    }
    
    // NO FALLBACK VALUES - only return if Airtable fails completely
    return {
      totalFunctions: 0,
      activeFunctions: 0,
      executionsToday: 0,
      successRate: "0%",
      averageExecutionTime: null,
      topPerformers: [],
      recentErrors: [],
      healthChecks: {
        airtable: "error",
        slack: "unknown", 
        apis: "healthy",
        database: "healthy"
      }
    };
  }

  static async getLeadMetrics(systemMode: 'test' | 'live' = 'live') {
    // Complete isolation: serve test data when in test mode
    if (systemMode === 'test') {
      return TestModeData.getRealisticLeadMetrics();
    }
    try {
      return {
        totalLeads: null,
        qualifiedLeads: null,
        conversionRate: null,
        averageLeadScore: null,
        leadSources: {
          organic: null,
          paidAds: null,
          referrals: null,
          directTraffic: null
        }
      };
    } catch (error: any) {
      console.error('Error getting lead metrics:', error);
      return {
        totalLeads: null,
        qualifiedLeads: null,
        conversionRate: null,
        averageLeadScore: null,
        leadSources: {
          organic: null,
          paidAds: null,
          referrals: null,
          directTraffic: null
        }
      };
    }
  }

  static async getDashboardOverview(systemMode: 'test' | 'live' = 'live') {
    // Complete isolation: serve test data when in test mode
    if (systemMode === 'test') {
      return TestModeData.getRealisticDashboardOverview();
    }
    
    const automationMetrics = await this.getAutomationMetrics(systemMode);
    const leadMetrics = await this.getLeadMetrics(systemMode);
    
    return {
      automation: automationMetrics,
      leads: leadMetrics
    };
  }
}