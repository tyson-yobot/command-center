/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly AIRTABLE_API_KEY: string;
  readonly SLACK_BOT_TOKEN: string;
  readonly SLACK_ALERTS_CHANNEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
