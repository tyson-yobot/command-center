import { google } from 'googleapis';
import express from 'express';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.REPLIT_DEV_DOMAIN || 'https://localhost:5000'}/api/calendar/oauth/callback`
);

export const calendarRouter = express.Router();

// Initiate OAuth flow
calendarRouter.get('/oauth', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
  });
  res.redirect(url);
});

// Handle OAuth callback
calendarRouter.get('/oauth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);
    
    res.send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>✅ Google Calendar Connected Successfully!</h2>
          <p>Your YoBot automation platform can now sync with Google Calendar.</p>
          <button onclick="window.close()">Close Window</button>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Calendar OAuth error:', error);
    res.status(500).send('Calendar connection failed');
  }
});

// Get upcoming events
calendarRouter.get('/events', async (req, res) => {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    const events = response.data.items?.map(event => ({
      id: event.id,
      summary: event.summary,
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      attendees: event.attendees?.length || 0
    })) || [];
    
    res.json(events);
  } catch (error) {
    console.error('Calendar events error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Create new event
calendarRouter.post('/events', async (req, res) => {
  try {
    const { summary, description, startTime, endTime, attendeeEmails } = req.body;
    
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const event = {
      summary,
      description,
      start: { dateTime: startTime },
      end: { dateTime: endTime },
      attendees: attendeeEmails?.map((email: string) => ({ email })) || []
    };
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    res.json({
      success: true,
      eventId: response.data.id,
      eventLink: response.data.htmlLink
    });
  } catch (error) {
    console.error('Calendar create event error:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

export { oauth2Client };