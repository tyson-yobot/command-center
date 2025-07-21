# YoBot Command Center Reorganization Plan

## Current Issues
- Duplicate folders (icloud_calendar_sync and icloud-calendar-sync)
- Inconsistent naming conventions (snake_case vs kebab-case)
- Scattered Python files (some in server/, some in root)
- Multiple router folders (backend/routers, routers, server/routes)
- Duplicate files (auth.py and auth.ts in server/)
- Odd folder names like "-p" in server/
- Duplicate sales_order.py files

## Proposed Structure

```
command-center/
├── assets/                      # Renamed from attached_assets
│   ├── images/                  # All images go here
│   └── docs/                    # Documentation assets
├── client/                      # Frontend code (keep as is)
│   ├── public/
│   ├── src/
│   └── ...
├── server/                      # Backend code (consolidated)
│   ├── api/                     # All API routes
│   │   ├── auth/                # Authentication routes
│   │   ├── quotes/              # Quote generation routes
│   │   ├── crm/                 # CRM integration routes
│   │   ├── lead_scraper/        # Lead scraper routes
│   │   └── webhooks/            # Webhook handlers
│   ├── core/                    # Core functionality
│   │   ├── auth.py              # Authentication logic
│   │   ├── db.py                # Database connections
│   │   └── config.py            # Configuration management
│   ├── integrations/            # External service integrations
│   │   ├── airtable/            # Airtable integration
│   │   ├── slack/               # Slack integration
│   │   ├── quickbooks/          # QuickBooks integration
│   │   ├── docusign/            # DocuSign integration
│   │   └── google_drive/        # Google Drive integration
│   ├── modules/                 # Business logic modules
│   │   ├── quotes/              # Quote generation logic
│   │   ├── sales/               # Sales order processing
│   │   ├── voice/               # Voice bot functionality
│   │   └── rag/                 # RAG functionality
│   ├── utils/                   # Utility functions
│   │   ├── function_library.py  # Core utility functions
│   │   ├── logger.py            # Logging utilities
│   │   └── validators.py        # Input validation
│   ├── app.py                   # Main application entry point
│   └── wsgi.py                  # WSGI entry point
├── scripts/                     # Utility scripts
│   ├── setup.py                 # Setup script
│   ├── deploy.py                # Deployment script
│   └── migrations/              # Database migrations
├── tests/                       # All tests
│   ├── unit/                    # Unit tests
│   ├── integration/             # Integration tests
│   └── e2e/                     # End-to-end tests
├── docs/                        # Documentation
├── .env.example                 # Example environment variables
├── requirements.txt             # Python dependencies
├── package.json                 # Node.js dependencies
└── README.md                    # Project documentation
```

## Migration Steps

1. Create the new directory structure
2. Move files to their appropriate locations
3. Update import statements in all files
4. Consolidate duplicate files
5. Standardize naming conventions
6. Update documentation
7. Test the application to ensure everything works

## Naming Conventions

- Python files and directories: snake_case (e.g., function_library.py)
- TypeScript/JavaScript files: camelCase (e.g., apiClient.ts)
- React components: PascalCase (e.g., UserProfile.tsx)
- CSS/SCSS files: kebab-case (e.g., main-styles.css)
- Environment variables: UPPER_SNAKE_CASE (e.g., API_KEY)
- Constants: UPPER_SNAKE_CASE (e.g., MAX_RETRY_COUNT)

## File Organization Rules

1. Group files by feature/module rather than by file type
2. Keep related files close to each other
3. Avoid deep nesting (max 3-4 levels)
4. Use index files to simplify imports
5. Keep the root directory clean