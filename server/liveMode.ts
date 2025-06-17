// Global Live Mode Environment Gate - EMERGENCY OVERRIDE ACTIVE
export const isLiveMode = (): boolean => {
  // EMERGENCY ROLLBACK: Force disable live mode regardless of environment
  return false;
};

export const display = (value: any, demoValue?: any): any => {
  if (isLiveMode()) {
    return value ?? '--';
  }
  return demoValue ?? value;
};

export const safeLiveData = (liveValue: any, testValue: any): any => {
  return isLiveMode() ? (liveValue ?? '--') : testValue;
};

// Live Mode Hardcode Detector
const HARDCODE_BLOCKLIST = [
  'Client A', 'Sample Company', 'John Smith', 'Jane Doe',
  'Test User', 'Demo Client', 'Example Corp',
  '100%', '42', '99.8%', '$0', 'N/A'
];

export const validateLiveData = (value: any): void => {
  if (isLiveMode() && typeof value === 'string') {
    for (const blocked of HARDCODE_BLOCKLIST) {
      if (value.includes(blocked)) {
        throw new Error(`BLOCKED: hardcoded value "${blocked}" detected in LIVE mode`);
      }
    }
  }
};

export const blockTestData = (payload: any): void => {
  if (isLiveMode() && payload) {
    const stringPayload = JSON.stringify(payload);
    HARDCODE_BLOCKLIST.forEach(blocked => {
      if (stringPayload.includes(blocked)) {
        throw new Error(`BLOCKED: dummy data "${blocked}" in live payload`);
      }
    });
  }
};