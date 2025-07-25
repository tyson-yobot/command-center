/**
 * Simple event logging utility for YoBot Command Center
 * Logs events to console and can be extended to send to backend
 */

/**
 * Log an event with category, action, and optional label
 * @param category Event category (e.g., 'calendar', 'leads', 'calls')
 * @param action Action performed (e.g., 'refresh', 'create', 'delete')
 * @param label Optional label for additional context (e.g., 'success', 'error')
 */
export function logEvent(category: string, action: string, label?: string): void {
  const timestamp = new Date().toISOString();
  const eventData = {
    category,
    action,
    label,
    timestamp
  };
  
  console.log(`[EVENT] ${category}:${action}${label ? `:${label}` : ''}`, eventData);
  
  // This could be extended to send events to a backend API
  // Example:
  // fetch('/api/log', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(eventData)
  // }).catch(err => console.error('Failed to log event:', err));
}

/**
 * Log an error event
 * @param category Error category
 * @param error Error object or message
 */
export function logError(category: string, error: Error | string): void {
  const errorMessage = error instanceof Error ? error.message : error;
  logEvent(category, 'error', errorMessage);
  console.error(`[ERROR] ${category}:`, error);
}