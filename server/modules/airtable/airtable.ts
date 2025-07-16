import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_API_URL = "https://api.airtable.com/v0";
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID;

// Universal fetch route (flexible for dynamic dashboard widgets)
router.get('/:baseId/:tableName', async (req, res) => {
  const { baseId, tableName } = req.params;
  const url = `${AIRTABLE_API_URL}/${baseId}/${tableName}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Error fetching Airtable data:", error.message);
    res.status(500).json({ error: "Failed to fetch Airtable data" });
  }
});

// Base Airtable API URL
const AIRTABLE_BASE_URL = `${AIRTABLE_API_URL}/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

// Get all records from Airtable
router.get('/records', async (req, res) => {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
      return res.status(400).json({ 
        error: 'Airtable credentials not configured. Please check API key, base ID, and table ID.' 
      });
    }

    const response = await axios.get(AIRTABLE_BASE_URL, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        maxRecords: 100,
        view: 'Grid view' // Default view
      }
    });

    console.log('✅ Successfully retrieved Airtable records:', response.data.records.length);
    
    res.json({
      success: true,
      records: response.data.records,
      total: response.data.records.length
    });

  } catch (error: any) {
    console.error('❌ Airtable API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      res.status(401).json({ error: 'Invalid Airtable API key' });
    } else if (error.response?.status === 404) {
      res.status(404).json({ error: 'Airtable base or table not found' });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch Airtable records',
        details: error.response?.data || error.message 
      });
    }
  }
});

// Get a specific record by ID
router.get('/records/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    
    const response = await axios.get(`${AIRTABLE_BASE_URL}/${recordId}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Retrieved Airtable record: ${recordId}`);
    
    res.json({
      success: true,
      record: response.data
    });

  } catch (error: any) {
    console.error('❌ Airtable Record Error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Record not found' });
    } else {
      res.status(500).json({ 
        error: 'Failed to fetch record',
        details: error.response?.data || error.message 
      });
    }
  }
});

// Create a new record
router.post('/records', async (req, res) => {
  try {
    const { fields } = req.body;
    
    if (!fields) {
      return res.status(400).json({ error: 'Missing fields data' });
    }

    const response = await axios.post(AIRTABLE_BASE_URL, {
      fields: fields
    }, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Created new Airtable record:', response.data.id);
    
    res.json({
      success: true,
      record: response.data,
      message: 'Record created successfully'
    });

  } catch (error: any) {
    console.error('❌ Airtable Create Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create record',
      details: error.response?.data || error.message 
    });
  }
});

// Update an existing record
router.patch('/records/:recordId', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { fields } = req.body;
    
    if (!fields) {
      return res.status(400).json({ error: 'Missing fields data' });
    }

    const response = await axios.patch(`${AIRTABLE_BASE_URL}/${recordId}`, {
      fields: fields
    }, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Updated Airtable record: ${recordId}`);
    
    res.json({
      success: true,
      record: response.data,
      message: 'Record updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Airtable Update Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to update record',
      details: error.response?.data || error.message 
    });
  }
});

// Integration endpoint for quote generation
router.post('/generate-quote', async (req, res) => {
  try {
    const { recordId } = req.body;
    
    if (!recordId) {
      return res.status(400).json({ error: 'Missing record ID' });
    }

    const recordResponse = await axios.get(`${AIRTABLE_BASE_URL}/${recordId}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const record = recordResponse.data;
    console.log('📄 Processing quote for record:', recordId);

    res.json({
      success: true,
      message: 'Quote generation initiated',
      record: record,
      recordId: recordId,
      status: 'Processing quote from Airtable data'
    });

  } catch (error: any) {
    console.error('❌ Quote Generation Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate quote',
      details: error.response?.data || error.message 
    });
  }
});

// Test connection endpoint
router.get('/test', async (req, res) => {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
      return res.status(400).json({ 
        error: 'Airtable credentials not configured',
        missing: {
          apiKey: !AIRTABLE_API_KEY,
          baseId: !AIRTABLE_BASE_ID,
          tableId: !AIRTABLE_TABLE_ID
        }
      });
    }

    const response = await axios.get(`${AIRTABLE_BASE_URL}?maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      success: true,
      message: 'Airtable connection successful',
      baseId: AIRTABLE_BASE_ID,
      tableId: AIRTABLE_TABLE_ID,
      recordCount: response.data.records.length
    });

  } catch (error: any) {
    console.error('❌ Airtable Test Error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Airtable connection failed',
      details: error.response?.data || error.message 
    });
  }
});

export default router;
