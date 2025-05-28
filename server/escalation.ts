import { sendSlackAlert } from './alerts';

export async function escalateFallback(escalationId: number) {
  await sendSlackAlert(`🚨 *Call Escalation* – ID ${escalationId} was not handled in time. Auto-routing fallback triggered.`);
}