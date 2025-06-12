// Centralized system mode management
let currentSystemMode: 'test' | 'live' = 'live';

export function getSystemMode(): 'test' | 'live' {
  return currentSystemMode;
}

export function setSystemMode(mode: 'test' | 'live'): void {
  currentSystemMode = mode;
  console.log(`System mode set to: ${mode}`);
}

export function toggleSystemMode(): { previousMode: 'test' | 'live'; newMode: 'test' | 'live' } {
  const previousMode = currentSystemMode;
  currentSystemMode = currentSystemMode === 'live' ? 'test' : 'live';
  console.log(`System mode toggled from ${previousMode} to ${currentSystemMode}`);
  
  return {
    previousMode,
    newMode: currentSystemMode
  };
}