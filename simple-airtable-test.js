// Simple Airtable test with just the primary field
import axios from 'axios';

const baseId = 'appRt8V3tH4g5Z5if';
const tableId = 'tbly0fjE2M5uHET9X'; // Using the Integration Test Log table ID from schema
const apiKey = 'paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa';
const baseUrl = `https://api.airtable.com/v0/${baseId}/${tableId}`;

async function testSimpleWrite() {
  try {
    console.log('Testing simple Airtable write...');
    
    // Just use the primary field from the schema
    const testEntry = {
      records: [{
        fields: {
          '🔧 Integration Name': 'Airtable Connection Test - Function 1'
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
    console.error('❌ Write failed:', error.response?.status, error.response?.statusText);
    console.error('Error details:', error.response?.data);
    return false;
  }
}

testSimpleWrite();