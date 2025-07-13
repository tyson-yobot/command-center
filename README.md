# YoBotAssistant Command Center

YoBotAssistant is the backend command center that powers YoBot's automation and metrics tracking. It is built with Node.js and Express and exposes a small API along with a collection of modules for scraping, voice generation, sales automation and more. Optional Python scripts handle iCloud calendar syncing.

## Running the Express Server

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the required variables. At minimum provide:
   ```bash
   AIRTABLE_API_KEY=your-airtable-api-key
   AIRTABLE_BASE_ID=your-airtable-base-id
   AIRTABLE_TABLE_NAME=Command Center · Metrics Tracker
   ICLOUD_USERNAME=your-icloud-username
   ICLOUD_PASSWORD=your-icloud-password
   DATABASE_URL=postgres-connection-string
   # optional: change the port
   PORT=3000
   ```
   Additional variables such as `SLACK_WEBHOOK_URL`, `TWILIO_*`, `GOOGLE_*` and others enable integrations. See `.env.example` for the full list.
3. Start the server:
   ```bash
   npm run dev
   ```
   The API listens on `http://localhost:3000` by default or the value of `PORT`.

## Modules

Server modules live under [`server/modules`](server/modules) and include:

- **airtable** – Airtable integrations and lead management
- **automation** – automation batch scripts
- **auth** – authentication helpers
- **command-center** – metrics and live data providers
- **control-center** – configuration helpers
- **lead-scraper** – scraping pipelines for lead generation
- **pdf** – PDF generation utilities
- **qa** – QA tracking and validation
- **rag** – RAG engine helpers
- **sales** – sales order processing
- **scraper** – generic scraping routes
- **voice** – voice generation and callbacks
- **webhooks** – centralized webhook processing

Refer to the code in each module for detailed usage. UI styling guidelines are documented in [`YOBOT_BRAND_GUIDE.md`](YOBOT_BRAND_GUIDE.md).

## Running Tests

```bash
npm test
```

## License

This project is licensed under the [MIT License](LICENSE).
