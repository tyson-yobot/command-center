export function logInfo(module: string, message: string): void {
  console.log(`[${new Date().toISOString()}] [INFO] [${module}] ${message}`);
}

export function logError(module: string, message: string): void {
  console.error(`[${new Date().toISOString()}] [ERROR] [${module}] ${message}`);
}