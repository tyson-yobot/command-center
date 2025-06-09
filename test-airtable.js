// Direct test of Airtable connection
import axios from 'axios';

const baseId = 'appRt8V3tH4g5Z5if';
const tableId = 'tbldPRZ4nHbtj9opU';
const apiKey = 'paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa';
const baseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;

async function testConnection() {
  try {
    console.log('Testing Airtable connection...');
    
    // Test read access
    const response = await axios.get(baseUrl, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      params: { maxRecords: 1 }
    });
    
    console.log('✅ Connection successful:', response.status);
    
    // Test write access
    const testEntry = {
      records: [{
        fields: {
          '🔧 Integration Name': 'Test Connection Verification',
          '✅ Pass/Fail': '✅',
          '🧠 Notes / Debug': 'Successfully connected to Airtable Integration Test Log table',
          '📅 Test Date': new Date().toISOString().split('T')[0],
          '🧑‍💻 QA Owner': 'Daniel Sharpe',
          '📤 Output Data Populated': true,
          '🗃️ Record Created?': true,
          '🔁 Retry Attempted?': false,
          '🧩 Module Type': 'System',
          '📂 Related Scenario Link': 'https://replit.dev/command-center'
        }
      }]
    };

    const writeResponse = await axios.post(baseUrl, testEntry, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Write test successful:', writeResponse.status);
    console.log('Record ID:', writeResponse.data.records[0].id);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed:', error.response?.status, error.response?.statusText);
    console.error('Error details:', error.response?.data);
    return false;
  }
}

testConnection();