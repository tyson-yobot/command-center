import express from 'express';
import axios from 'axios';
import querystring from 'querystring';

const router = express.Router();

const CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const REDIRECT_URI = process.env.REPLIT_DOMAINS ? 
  `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/api/hubspot/callback` :
  'http://localhost:5000/api/hubspot/callback';

router.get('/auth', (_req, res) => {
  if (!CLIENT_ID) {
    return res.status(400).json({ 
      error: 'HubSpot CLIENT_ID not configured',
      message: 'Please add HUBSPOT_CLIENT_ID to your environment secrets'
    });
  }

  const installURL = `https://app.hubspot.com/oauth/authorize?${querystring.stringify({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: 'crm.objects.contacts.read crm.objects.contacts.write crm.objects.deals.read crm.objects.deals.write',
  })}`;
  
  res.redirect(installURL);
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing authorization code');

  if (!CLIENT_ID || !CLIENT_SECRET) {
    return res.status(400).send('HubSpot credentials not configured');
  }

  try {
    const tokenRes = await axios.post(
      'https://api.hubapi.com/oauth/v1/token',
      querystring.stringify({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const { access_token, refresh_token } = tokenRes.data;
    console.log('✅ HubSpot Connected Successfully!');
    console.log('Access Token:', access_token.substring(0, 20) + '...');
    
    // Store tokens in environment or database for future use
    // In production, you'd save these securely
    
    res.send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #28a745;">✅ HubSpot Integration Successful!</h1>
          <p>Your YoBot automation platform is now connected to HubSpot CRM.</p>
          <p>You can close this tab and return to your command center.</p>
          <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h3>Connection Details:</h3>
            <p>✓ Contact read/write access</p>
            <p>✓ Deal read/write access</p>
            <p>✓ Ready for automation workflows</p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('HubSpot Auth Error:', err.response?.data || err.message);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;">❌ HubSpot Connection Failed</h1>
          <p>There was an error connecting to HubSpot.</p>
          <p>Please check your credentials and try again.</p>
        </body>
      </html>
    `);
  }
});

// Test endpoint to verify HubSpot connection
router.get('/test', async (req, res) => {
  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  
  if (!accessToken) {
    return res.status(400).json({ 
      error: 'No access token provided',
      message: 'Include Authorization: Bearer YOUR_TOKEN header'
    });
  }

  try {
    const response = await axios.get('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    res.json({ 
      status: 'connected',
      message: 'HubSpot API connection verified',
      contactCount: response.data.total || 0
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'HubSpot API test failed',
      message: err.response?.data?.message || err.message
    });
  }
});

export default router;