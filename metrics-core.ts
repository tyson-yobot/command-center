// ✅ PRODUCTION-READY BACKEND METRICS MODULE — FULL AUTOMATION, NO PARAMETERS

import axios from 'axios';

export class CommandCenterMetrics {
  baseId = 'appRt8V3tH4g5Z5if';
  tableId = 'tblhxA9YOTf4ynJi2';
  integrationTestTable = 'tblvEZM0GLZP58m8m';
  localBackup: any[] = [];

  async logMetricsAction(fields: Record<string, any>) {
    const payload = {
      records: [{ fields }]
    };

    try {
      await axios.post(
        `https://api.airtable.com/v0/${this.baseId}/${this.tableId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('✅ Metrics logged');
      this.localBackup.push({ ...fields });
    } catch (err) {
      console.error('❌ Failed to log metrics:', err);
    }
  }

  async logIntegrationTest(fields: Record<string, any>) {
    const payload = {
      records: [{ fields }]
    };

    try {
      await axios.post(
        `https://api.airtable.com/v0/${this.baseId}/${this.integrationTestTable}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      console.log('📌 Integration test log sent');
    } catch (err) {
      console.error('❌ Integration test log failed:', err);
    }
  }

  getLocalBackupLog() {
    return this.localBackup;
  }
}
