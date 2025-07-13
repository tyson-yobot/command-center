# YoBotAssistant

YoBotAssistant is the backend command center that powers YoBot’s automation and metrics tracking. It exposes a small Express API and a collection of modules for scraping, voice generation, automation runs and more.

## Running the Express Server

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   The server listens on `http://localhost:3000` by default or the value of the `PORT` environment variable.

## Environment Variables

Create a `.env` file based on `.env.example` and fill in the values for your environment. At minimum the server expects:

```bash
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_TABLE_NAME=Command Center · Metrics Tracker
ICLOUD_USERNAME=your-icloud-username
ICLOUD_PASSWORD=your-icloud-password
DATABASE_URL=postgres-connection-string
```

The `DATABASE_URL` is required for the database pool and `PORT` can be set to change the listening port. Other environment variables such as `ELEVENLABS_API_KEY`, `SLACK_WEBHOOK_URL` or `TWILIO_*` enable additional integrations.

## Available Modules

Server modules live under [`server/modules`](server/modules) and include:

- **airtable** – Airtable integrations and lead management
- **automation** – various automation batch scripts
- **auth** – auth helpers and role utilities
- **command-center** – dashboard metrics and real/live data providers
- **control-center** – configuration helpers
- **lead-scraper** – scraping pipelines for lead generation
- **pdf** – PDF generation utilities
- **qa** – QA tracking and validation
- **rag** – RAG engine and knowledge store helpers
- **sales** – sales order processing
- **scraper** – generic scraping routes
- **voice** – voice generation and callback handling
- **webhooks** – centralized webhook processing

See [`YOBOT_BRAND_GUIDE.md`](YOBOT_BRAND_GUIDE.md) for UI styling guidelines.
