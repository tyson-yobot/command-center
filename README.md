# YoBotAssistant

YoBotAssistant is the backend command center that powers YoBot's automation and metrics tracking. It exposes a small Express API and a collection of modules for scraping, voice generation, automation runs and more.

## Prerequisites

- Node.js v20 or higher
- PNPM package manager (`npm install -g pnpm`)
- Python 3.11 (only required for the optional calendar sync scripts)

## Setup

1. Install Node dependencies:

## Prerequisites

- **Node.js** 18 or higher
- **PNPM** 8+ (optional, can use `npm` instead)
- **Python** 3.10+ for the optional iCloud sync scripts

## Environment Variables

The application relies on several environment variables. Create a `.env` file or
configure these variables in your deployment environment:

- `ICLOUD_USERNAME` – iCloud account username
- `ICLOUD_PASSWORD` – iCloud app-specific password
- `AIRTABLE_API_KEY` – API key for Airtable access
- `AIRTABLE_BASE_ID` – Airtable base identifier
- `AIRTABLE_TABLE_NAME` – default table used for metrics


## Setup

1. Install Node dependencies in the project root:
   ```bash
   npm install
   # or
   pnpm install
   ```
2. Install dependencies for the React client:

   ```bash
   cd client
   npm install

   cd client && npm install
   ```

2. Copy `.env.example` to `.env` and fill in your environment variables.
3. Start the Express development server:

   ```bash
   npm run dev
   ```

   The server listens on `PORT` (defaults to `3000`).

4. Launch the React client:

   ```bash
   cd client
   npm run dev
   ```

   The client starts on `http://localhost:5173` by default.

5. (Optional) Install Python requirements and run the calendar sync:

   ```bash
   pip install -r requirements.txt
   python app.py
   ```

   # or
   pnpm install
   cd ..
   ```
3. (Optional) install the Python requirements if you plan to run the iCloud sync service:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in the environment variables.
5. Start the Express server:
   ```bash
   npm run dev
   ```
   The server listens on `PORT` (defaults to `3000`).
6. In another terminal start the React client:
   ```bash
   cd client
   npm run dev
   ```
   The client runs on `http://localhost:5173` by default.
7. To manually run the iCloud calendar sync:
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


## Environment Variables

At minimum provide the following variables in your `.env` file:

```bash
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_TABLE_NAME=Command Center - Metrics Tracker Table
ICLOUD_USERNAME=your-icloud-username
ICLOUD_PASSWORD=your-icloud-password
DATABASE_URL=postgres-connection-string
# PORT=3000
```

Additional variables such as `SLACK_WEBHOOK_URL`, `ELEVENLABS_API_KEY`,
`TWILIO_*` and many others enable optional integrations. See
`.env.example` for the full list used across the project.

## Available Modules

Server modules under [`server/modules`](server/modules) handle Airtable
integrations, lead scraping, PDF generation, voice automation and more.
Refer to the source for details.

## Optional Python Scripts

Two helper scripts provide iCloud calendar syncing:


- `app.py` – small Flask server scheduling `sync_calendar_to_airtable`
- `sync.py` – manual one‑off sync

They require the same environment variables and packages from
`requirements.txt`.

* `app.py` – a small Flask server that schedules `sync_calendar_to_airtable` every 15 minutes.
* `sync.py` – a standalone script for manual one‑off syncs.
* `server/yobot_command_center/sales_order.py` – processes sales order data when triggered from the Express API.

They require the same environment variables as above and the packages listed in `requirements.txt`.

These variables are used throughout the server modules for Airtable and iCloud
integrations.


**Security Notice:** The repository previously contained example credentials in
`client/src/.env`. Those values have been removed from version control. If you
used them, rotate your iCloud and Airtable credentials immediately and update
your personal `.env` file with fresh keys.


## Setup

Install the Python dependencies:

```bash
pip install -r requirements.txt
```



## Running Tests

```bash
npm test
```

## License


This project is licensed under the [MIT License](LICENSE).

This project is licensed under the [MIT License](LICENSE)


