# YoBotAssistant

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
These variables are used throughout the server modules for Airtable and iCloud
integrations.

## Setup

Install the Python dependencies:

```bash
pip install -r requirements.txt
```
