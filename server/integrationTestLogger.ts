import { Express } from 'express';

interface TestLogEntry {
  integrationName: string;
  passFail: 'PASS' | 'FAIL';
  notes: string;
  testDate: string;
  qaOwner: string;
  outputDataPopulated: boolean;
  recordCreated: boolean;
  retryAttempted: boolean;
  moduleType: string;
  relatedScenario: string;
  errorDetails?: string;
}

class IntegrationTestLogger {
  private airtableApiKey = 'paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa';
  private integrationTestLogBase = 'appRt8V3tH4g5Z5if';
  private integrationTestLogTable = 'tbly0fjE2M5uHET9X';

  async logTest(testData: TestLogEntry): Promise<boolean> {
    try {
      const response = await fetch(`https://api.airtable.com/v0/${this.integrationTestLogBase}/${this.integrationTestLogTable}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.airtableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: [{
            fields: {
              '🔧 Integration Name': `${testData.integrationName} - ${testData.passFail} - ${testData.notes} - Module: ${testData.moduleType} - QA: ${testData.qaOwner} - Date: ${testData.testDate}`
            }
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to log integration test:', errorText);
        console.error('Response status:', response.status);
        console.error('Request body:', JSON.stringify({
          records: [{
            fields: {
              '🔧 Integration Name': `${testData.integrationName} - ${testData.passFail} - ${testData.notes} - Module: ${testData.moduleType} - QA: ${testData.qaOwner} - Date: ${testData.testDate}`
            }
          }]
        }, null, 2));
        return false;
      }

      console.log(`✅ Integration test logged: ${testData.integrationName} - ${testData.passFail}`);
      return true;
    } catch (error) {
      console.error('Integration test logging error:', error);
      return false;
    }
  }

  async logSuccess(integrationName: string, moduleType: string, notes: string, relatedScenario: string = ''): Promise<boolean> {
    return this.logTest({
      integrationName,
      passFail: 'PASS',
      notes,
      testDate: new Date().toISOString(),
      qaOwner: 'YoBot System',
      outputDataPopulated: true,
      recordCreated: true,
      retryAttempted: false,
      moduleType,
      relatedScenario
    });
  }

  async logFailure(integrationName: string, moduleType: string, errorDetails: string, relatedScenario: string = ''): Promise<boolean> {
    return this.logTest({
      integrationName,
      passFail: 'FAIL',
      notes: `Integration failed: ${errorDetails}`,
      testDate: new Date().toISOString(),
      qaOwner: 'YoBot System',
      outputDataPopulated: false,
      recordCreated: false,
      retryAttempted: false,
      moduleType,
      relatedScenario,
      errorDetails
    });
  }
}

export const integrationLogger = new IntegrationTestLogger();

export function registerIntegrationTestRoutes(app: Express) {
  // Manual test logging endpoint
  app.post('/api/integration-test-log', async (req, res) => {
    try {
      const testData: TestLogEntry = req.body;
      const success = await integrationLogger.logTest(testData);
      
      res.json({
        success,
        message: success ? 'Test logged successfully' : 'Failed to log test',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Get integration test history
  app.get('/api/integration-test-log', async (req, res) => {
    try {
      const response = await fetch(`https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tblIntegrationTestLog?maxRecords=100&sort%5B0%5D%5Bfield%5D=📅%20Test%20Date&sort%5B0%5D%5Bdirection%5D=desc`, {
        headers: {
          'Authorization': 'Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test log');
      }

      const data = await response.json();
      res.json({
        success: true,
        tests: data.records.map(record => ({
          id: record.id,
          integrationName: record.fields['✅ Integration Name'],
          passFail: record.fields['✅ Pass/Fail'],
          notes: record.fields['📝 Notes / Debug'],
          testDate: record.fields['📅 Test Date'],
          qaOwner: record.fields['👤 QA Owner'],
          moduleType: record.fields['⚙️ Module Type'],
          relatedScenario: record.fields['📁 Related Scenario']
        }))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
}