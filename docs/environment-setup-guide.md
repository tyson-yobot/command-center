# Two-Environment Setup Guide

## Quick Setup Instructions

### Step 1: Create Test Environment
1. Fork/clone this project to new Replit: `YoBotAssistant-Test`
2. Copy `test-environment.env` to `.env` in test project
3. Set entrypoint to serve only `/test` routes
4. Configure test-specific API keys and database

### Step 2: Create Live Environment  
1. Fork/clone this project to new Replit: `YoBotAssistant-Live`
2. Copy `live-environment.env` to `.env` in live project
3. Set entrypoint to serve only `/` routes (no test endpoints)
4. Configure production API keys and database

### Step 3: Update Control Center URLs
Current Control Center automatically routes to:
- Test Mode: `https://yobot-test.tyson44.repl.co/test`
- Live Mode: `https://yobot.tyson44.repl.co/`

### Environment Variables Needed

#### Test Environment Secrets:
```
AIRTABLE_ACCESS_TOKEN=test_token
SLACK_WEBHOOK_URL=test_webhook
TWILIO_ACCOUNT_SID=test_sid
SENDGRID_API_KEY=test_key
```

#### Live Environment Secrets:
```
AIRTABLE_ACCESS_TOKEN=live_token
SLACK_WEBHOOK_URL=live_webhook
TWILIO_ACCOUNT_SID=live_sid
SENDGRID_API_KEY=live_key
```

## Benefits of Separation
- Zero risk of test data affecting production
- Safe development environment for QA
- Independent scaling and monitoring
- Clean audit trails for compliance

## Next Steps
1. Set up both Replit projects
2. Configure environment-specific secrets
3. Test connectivity from Control Center
4. Deploy live environment for production use