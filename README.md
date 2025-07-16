
# YoBotAssistant

## Environment Variables

The application relies on several environment variables. Create a `.env` file or
configure these variables in your deployment environment:

- `ICLOUD_USERNAME` – iCloud account username
- `ICLOUD_PASSWORD` – iCloud app-specific password
- `AIRTABLE_API_KEY` – API key for Airtable access
- `AIRTABLE_BASE_ID` – Airtable base identifier
- `AIRTABLE_TABLE_NAME` – default table used for metrics

# YoBotAssistant Command Center

YoBotAssistant is the backend command center that powers YoBot's automation and metrics tracking. It exposes a small Express API along with modules for scraping, voice generation, sales automation and more. Optional Python scripts handle iCloud calendar syncing.

## Running the Express Server

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure the following variables:
   ```bash
   AIRTABLE_API_KEY=your-airtable-api-key
   AIRTABLE_BASE_ID=your-airtable-base-id
   AIRTABLE_TABLE_NAME=Command Center · Metrics Tracker
   ICLOUD_USERNAME=your-icloud-username
   ICLOUD_PASSWORD=your-icloud-password
   DATABASE_URL=postgres-connection-string
   PORT=3000 # optional
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   The API listens on `http://localhost:3000` by default.

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

Refer to the code in each module for detailed usage. UI guidelines are documented in [`YOBOT_BRAND_GUIDE.md`](YOBOT_BRAND_GUIDE.md).

## Prerequisites

- Node.js 18+ (20 recommended)
- PNPM 8+ or npm
- Python 3.10+ for the optional calendar sync scripts

## Setup

1. Install Node dependencies in the project root:
   ```bash
   npm install
   # or
   pnpm install
   ```
2. Install client dependencies:
   ```bash
   cd client
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your environment variables.
4. Start the Express server:
   ```bash
   npm run dev
   ```
   The API listens on `PORT` (defaults to `3000`).
5. Launch the React client:
   ```bash
   cd client
   npm run dev
   ```
   The client runs on `http://localhost:5173`.
6. (Optional) install Python requirements and run `app.py` to sync iCloud calendars.

## Environment Variables

At minimum provide the following variables:

```bash
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_TABLE_NAME=Command Center - Metrics Tracker Table
ICLOUD_USERNAME=your-icloud-username
ICLOUD_PASSWORD=your-icloud-password
DATABASE_URL=postgres-connection-string
```

Additional variables such as `SLACK_WEBHOOK_URL`, `TWILIO_*`, `ELEVENLABS_API_KEY` and others enable optional integrations. See `.env.example` for the full list.

## Optional Python Scripts

- `app.py` – schedules regular calendar syncs
- `sync.py` – runs a one-off calendar sync
- `server/yobot_command_center/sales_order.py` – processes sales order data

These scripts require the same environment variables as the Node server.

**Security Notice:** example credentials previously committed to `client/src/.env` have been removed. If you used them, rotate your Airtable and iCloud credentials.

## Running Tests

```bash
npm test
```

## License

This project is licensed under the [MIT License](LICENSE).
