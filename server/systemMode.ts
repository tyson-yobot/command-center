// Centralized system mode management
import { isLiveMode } from './liveMode';

let currentSystemMode: 'test' | 'live' = 'test';

export function getSystemMode(): 'test' | 'live' {
  // Global environment gate ALWAYS overrides manual mode - zero tolerance
  if (isLiveMode()) {
    currentSystemMode = 'live'; // Force sync with global environment
    return 'live';
  }
  return currentSystemMode;
}

export function setSystemMode(mode: 'test' | 'live'): void {
  // Global environment gate blocks manual mode changes in LIVE
  if (isLiveMode()) {
    console.log(`BLOCKED: Cannot set mode to ${mode} - global LIVE environment active`);
    return;
  }
  currentSystemMode = mode;
  console.log(`System mode set to: ${mode}`);
}

export function toggleSystemMode(): { previousMode: 'test' | 'live'; newMode: 'test' | 'live' } {
  // Global environment gate blocks manual toggles in LIVE  
  if (isLiveMode()) {
    console.log(`BLOCKED: Cannot toggle system mode - global LIVE environment active`);
    return {
      previousMode: 'live',
      newMode: 'live'
    };
  }
  
  const previousMode = currentSystemMode;
  currentSystemMode = currentSystemMode === 'live' ? 'test' : 'live';
  console.log(`System mode toggled from ${previousMode} to ${currentSystemMode}`);
  
  return {
    previousMode,
    newMode: currentSystemMode
  };
}