# YoBot Deployment Architecture

## Separation Strategy: Two Independent Environments

### Test Environment: YoBotAssistant-Test
- **URL**: https://yobot-test.tyson44.repl.co/test
- **Purpose**: Safe development, QA testing, sandbox operations
- **Entrypoint**: server.py (test-only configuration)
- **Features**:
  - Diagnostic testing
  - Bot development sandbox
  - Safe API testing with dummy data
  - QA validation workflows
  - Development logging (isolated from production)

### Live Environment: YoBotAssistant-Live
- **URL**: https://yobot.tyson44.repl.co/
- **Purpose**: Production operations with real client data
- **Entrypoint**: server.py (live configuration)
- **Features**:
  - Live client calls and interactions
  - Production Airtable/QuickBooks/Slack integrations
  - Real automation workflows
  - Production logging and monitoring
  - Client-facing services

## Configuration Differences

### Environment Variables
```
# Test Environment
ENVIRONMENT=test
AIRTABLE_BASE_ID=test_base_id
SLACK_WEBHOOK=test_webhook
DATABASE_URL=test_database

# Live Environment  
ENVIRONMENT=live
AIRTABLE_BASE_ID=live_base_id
SLACK_WEBHOOK=live_webhook
DATABASE_URL=live_database
```

### Code Separation
- No shared state between environments
- Independent database instances
- Separate API credentials
- Isolated logging systems

## Benefits
1. **Zero Risk**: Test operations cannot affect live data
2. **Clean Development**: Safe environment for QA and debugging
3. **Production Stability**: Live environment remains untouched during development
4. **Client Safety**: No accidental test data in production systems
5. **Compliance**: Clear audit trail separation

## Migration Path
1. Clone current project to create test environment
2. Configure environment-specific variables
3. Update Control Center to point to appropriate endpoints
4. Test both environments independently
5. Deploy live environment for production use