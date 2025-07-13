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

YoBotAssistant is the backend command center that powers YoBot’s automation and metrics tracking. It exposes a small Express API and a collection of modules for scraping, voice generation, automation runs and more.

## Running the Express Server

1. Install dependencies:


## Installation

1. Install Node dependencies in the project root:

   ```bash
   npm install
   ```


2. Start the development server:

   ```bash
   npm run dev
   ```

   The server listens on `http://localhost:3000` by default or the value of the `PORT` environment variable.

2. Install dependencies for the React client:
   ```bash
   cd client && npm install
   ```

3. (Optional) Install Python requirements if you plan to run the sync scripts:
   ```bash
   pip install -r requirements.txt
   ```


## Environment Variables

Create a `.env` file based on `.env.example` and fill in the values for your environment. At minimum the server expects:

```bash
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_TABLE_NAME=Command Center · Metrics Tracker
ICLOUD_USERNAME=your-icloud-username
ICLOUD_PASSWORD=your-icloud-password
DATABASE_URL=postgres-connection-string

The `DATABASE_URL` is required for the database pool and `PORT` can be set to change the listening port. Other environment variables such as `ELEVENLABS_API_KEY`, `SLACK_WEBHOOK_URL` or `TWILIO_*` enable additional integrations.

## Available Modules


Not every variable is required for a basic development setup, but specific features (voice automation, Slack integration, lead scraping, etc.) will require the related keys.
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

Ensure `AIRTABLE_API_KEY` is provided in your environment before running the server.

These variables are used throughout the server modules for Airtable and iCloud integrations.

## Running the Node/Express Server

Start the API server from the project root:

```bash
npm run dev
```

The server listens on `PORT` (default `3000`).

## Starting the React Client

The front‑end lives in `client/`. Launch the Vite dev server:

```bash
cd client
npm run dev
```

This starts the React client on port `5173` by default.

## Optional Python Scripts

Two helper scripts provide iCloud calendar syncing:

* `app.py` – a small Flask server that schedules `sync_calendar_to_airtable` every 15 minutes.
* `sync.py` – a standalone script for manual one‑off syncs.
* `server/yobot_command_center/sales_order.py` – processes sales order data when triggered from the Express API.

They require the same environment variables as above and the packages listed in `requirements.txt`.

These variables are used throughout the server modules for Airtable and iCloud
integrations.


## Setup

Install the Python dependencies:

```bash
pip install -r requirements.txt
```

## Running Tests

Install dependencies if you haven't already:

```bash
npm install
```

Then run the test suite with:

```bash
npm test
```

## License

This project is licensed under the [MIT License](LICENSE)

