// Airtable utilities with proper error handling

export async function logMetric(data) {
  try {
    // Only attempt logging if we have valid Airtable credentials
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.log('Airtable credentials not configured, skipping metric logging');
      return { success: false, message: 'Airtable not configured' };
    }

    // Basic validation to prevent malformed tokens
    const apiKey = process.env.AIRTABLE_API_KEY;
    if (apiKey.length > 200) {
      console.log('Airtable API key appears malformed, skipping logging');
      return { success: false, message: 'Invalid API key format' };
    }

    const axios = require('axios');
    
    const response = await axios.post(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Integration%20Test%20Log%20Table`,
      {
        records: [
          {
            fields: data
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, recordId: response.data.records[0].id };
  } catch (error) {
    console.log('Airtable logging skipped due to authentication error');
    return { success: false, message: 'Authentication failed' };
  }
}

export async function logToCommandCenter(data) {
  try {
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_COMMAND_CENTER_BASE_TOKEN) {
      console.log('Command Center credentials not configured');
      return { success: false };
    }

    const axios = require('axios');
    
    const response = await axios.post(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_COMMAND_CENTER_BASE_TOKEN}/Command%20Center%20Metrics`,
      {
        records: [
          {
            fields: data
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, recordId: response.data.records[0].id };
  } catch (error) {
    console.log('Command Center logging skipped');
    return { success: false };
  }
}