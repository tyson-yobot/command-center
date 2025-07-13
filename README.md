# YoBotAssistant

YoBotAssistant is the backend command center that powers YoBot's automation and metrics tracking. It exposes a small Express API and a collection of modules for scraping, voice generation, automation runs and more.

## Prerequisites

- Node.js v20 or higher
- PNPM package manager (`npm install -g pnpm`)
- Python 3.11 (only required for the optional calendar sync scripts)

## Setup

1. Install Node dependencies:

   ```bash
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

## Running Tests

```bash
npm test
```

## License

This project is licensed under the [MIT License](LICENSE).
