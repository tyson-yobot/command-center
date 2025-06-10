// Global system mode state management
let currentSystemMode: 'test' | 'live' = 'live';

export function getSystemMode(): 'test' | 'live' {
  return currentSystemMode;
}

export function setSystemMode(mode: 'test' | 'live'): void {
  currentSystemMode = mode;
  console.log(`System mode updated to: ${mode}`);
}

export function isLiveMode(): boolean {
  return currentSystemMode === 'live';
}

export function isTestMode(): boolean {
  return currentSystemMode === 'test';
}