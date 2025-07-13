# YoBotAssistant

## Installation

1. Install Node dependencies in the project root:
   ```bash
   npm install
   ```

2. Install dependencies for the React client:
   ```bash
   cd client && npm install
   ```

3. (Optional) Install Python requirements if you plan to run the sync scripts:
   ```bash
   pip install -r requirements.txt
   ```

## Environment Variables

Create a `.env` file based on the provided `.env.example` and set the values for your environment. At minimum the following variables are required and will be read from `process.env`:

```
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_TABLE_NAME=Command Center · Metrics Tracker
ICLOUD_USERNAME=your-icloud-username
ICLOUD_PASSWORD=your-icloud-password
```

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

They require the same environment variables as above and the packages listed in `requirements.txt`.
=======
These variables are used throughout the server modules for Airtable and iCloud
integrations.

## License

This project is licensed under the [MIT License](LICENSE)
