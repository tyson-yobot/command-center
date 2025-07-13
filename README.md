# YoBotAssistant

## Setup

1. Install the Node.js dependencies:
   ```bash
   npm install
   ```
2. Install the Python requirements if you plan to run the iCloud sync service:
   ```bash
   pip install -r requirements.txt
   ```
3. Copy `.env.example` to `.env` and fill in the environment variables.
4. Start the development server:
   ```bash
   npm run dev
   ```
   The server listens on the port defined by `PORT` (defaults to `3000`).
5. To manually start the iCloud calendar sync run:
   ```bash
   python app.py
   ```

## Environment Variables

The application relies on a number of environment variables for external services. Below is a consolidated list of all variables referenced in the codebase:

```
ADMIN_PASSWORD
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
AIRTABLE_COMMAND_CENTER_BASE_TOKEN
AIRTABLE_PERSONAL_ACCESS_TOKEN
AIRTABLE_TABLE_ID
AIRTABLE_TABLE_NAME
AIRTABLE_VALID_TOKEN
APIFY_API_KEY
APOLLO_API_KEY
BOOKING_LINK
COMMAND_CENTER_URL
DASHBOARD_ID
DATABASE_URL
ELEVENLABS_API_KEY
ELEVENLABS_VOICE_ID
EMAIL_APP_PASSWORD
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
HUBSPOT_API_KEY
HUBSPOT_WEBHOOK_URL
ICLOUD_PASSWORD
ICLOUD_USERNAME
KILL_SWITCH
LINKEDIN_SESSION_COOKIE
MAKE_WEBHOOK_URL
NODE_ENV
OPENAI_API_KEY
PHANTOMBUSTER_AGENT_ID
PHANTOMBUSTER_API_KEY
PORT
QUICKBOOKS_ACCESS_TOKEN
QUICKBOOKS_REALM_ID
REPL_ID
SLACK_BOT_TOKEN
SLACK_CHANNEL_ID
SLACK_WEBHOOK_URL
STRIPE_SECRET_KEY
SYSTEM_MODE
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
TWILIO_SMS_URL
VOICEBOT_API_KEY
VOICEBOT_TRIGGER_URL
ZENDESK_API_TOKEN
ZENDESK_DOMAIN
ZENDESK_EMAIL
```

Not every variable is required for a basic development setup, but specific features (voice automation, Slack integration, lead scraping, etc.) will require the related keys.
