import type { Express } from "express";
import axios from 'axios';

export function registerAutomationLogsEndpoint(app: Express) {
  
  // Get automation test logs from Airtable
  app.get("/api/automation-logs", async (req, res) => {
    try {
      const response = await axios.get(
        'https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbly0fjE2M5uHET9X',
        {
          headers: {
            'Authorization': 'Bearer paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa'
          },
          params: {
            maxRecords: 50,
            sort: [{ field: 'createdTime', direction: 'desc' }]
          }
        }
      );

      const logs = response.data.records.map((record: any) => {
        const integrationName = record.fields['🔧 Integration Name'] || '';
        const functionName = integrationName.split(' - ')[0];
        const success = integrationName.includes('✅');
        const notes = record.fields['🧠 Notes / Debug'] || '';
        const qaOwner = record.fields['🧑‍💻 QA Owner'] || 'Unknown';
        const moduleType = record.fields['🧩 Module Type'] || 'Unknown';
        
        return {
          id: record.id,
          functionName,
          success,
          status: success ? 'PASSED' : 'FAILED',
          notes,
          qaOwner,
          moduleType,
          timestamp: record.createdTime,
          rawIntegrationName: integrationName
        };
      });

      res.json({
        success: true,
        logs,
        total: logs.length
      });

    } catch (error) {
      console.error('Failed to fetch automation logs:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch automation logs'
      });
    }
  });
}