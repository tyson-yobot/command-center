export function logInfo(message: string, data?: any) {
  console.log(`ℹ️ ${message}`, data || "");
}

export function logError(message: string, error?: any) {
  console.error(`❌ ${message}`, error || "");
}
