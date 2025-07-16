// utils/airtableUtils.js
import axios from 'axios';

const BASE_ID = 'appRt8V3tH4g5Z5if'; // YoBot Base
const SLACK_WEBHOOK = 'https://hooks.slack.com/services/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';

const airtableApi = axios.create({
  baseURL: `https://api.airtable.com/v0/${BASE_ID}`,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// GET
export async function airtableGet(tableId, filterByFormula) {
  try {
    const response = await airtableApi.get(`/${tableId}`, {
      params: filterByFormula ? { filterByFormula } : {},
    });
    return response.data.records;
  } catch (error) {
    await logAirtableError('GET', tableId, error.message);
    return [];
  }
}

// POST
export async function airtablePost(tableId, fields) {
  try {
    const response = await airtableApi.post(`/${tableId}`, { fields });
    return response.data;
  } catch (error) {
    await logAirtableError('POST', tableId, error.message, fields);
    return null;
  }
}

// PATCH
export async function airtablePatch(tableId, recordId, fields) {
  try {
    const response = await airtableApi.patch(`/${tableId}/${recordId}`, { fields });
    return response.data;
  } catch (error) {
    await logAirtableError('PATCH', tableId, error.message, fields);
    return null;
  }
}

// DELETE
export async function airtableDelete(tableId, recordId) {
  try {
    const response = await airtableApi.delete(`/${tableId}/${recordId}`);
    return response.status === 200;
  } catch (error) {
    await logAirtableError('DELETE', tableId, error.message, recordId);
    return false;
  }
}

// 🛡️ Error Logger
async function logAirtableError(method, tableId, errorMsg, fields = null) {
  const slackText = {
    text: `🚨 Airtable ${method} Error\n• Table: \`${tableId}\`\n• Error: \`${errorMsg}\`${fields ? `\n• Fields: \`\`\`${JSON.stringify(fields, null, 2)}\`\`\`` : ''}`,
  };

  try {
    await axios.post(SLACK_WEBHOOK, slackText);
  } catch (_) {}

  try {
    await airtableApi.post('/tblhxA9YOTf4ynJi2', {
      fields: {
        '🛠️ Module': `Airtable ${method}`,
        '📋 Target Table': tableId,
        '🚨 Error Message': errorMsg,
        '🕵️‍♂️ Logger Source': 'airtableUtils.js',
        '🚩 Failure Type': 'Airtable Sync',
        '📅 Timestamp': new Date().toISOString(),
      },
    });
  } catch (_) {}
}
