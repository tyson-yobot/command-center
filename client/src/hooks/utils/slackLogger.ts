/**
 * Slack alert utility — production-ready
 * • Uses env constant only (no inline webhook)
 * • Hardened with error handling + rate-limit notice
 */

import axios, { AxiosError } from 'axios';

const { SLACK_WEBHOOK_URL } = process.env;

if (!SLACK_WEBHOOK_URL) {
  throw new Error('❌ Missing SLACK_WEBHOOK_URL in env');
}

export async function postSlackAlert(text: string): Promise<void> {
  try {
    await axios.post(SLACK_WEBHOOK_URL!,
      { text },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5_000,
      }
    );
    // eslint-disable-next-line no-console
    console.log('✅ Slack alert sent');
  } catch (err) {
    const ae = err as AxiosError;
    if (ae.response?.status === 429) {
      console.warn('⚠️ Slack rate-limited; alert skipped');
      return;
    }
    console.error(
      `❌ Slack alert failed [${ae.response?.status || 'no-status'}]: ${
        ae.response?.data || ae.message
      }`
    );
  }
}
