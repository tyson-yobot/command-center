import { useEffect, useState } from 'react';

export const useLiveMode = () => {
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    // Check environment variable for live mode
    const mode = (import.meta as any).env?.VITE_MODE;
    const isLiveMode = mode === 'LIVE';
    
    setIsLive(isLiveMode);

    if (isLiveMode) {
      console.log('🔒 LIVE mode: blocking all test/dummy data.');
      
      // Validate against hardcoded data in live mode
      const validateLiveData = (value: any): void => {
        if (typeof value === 'string') {
          const blocklist = ['Client A', 'Sample Company', 'John Smith', 'Jane Doe', 'Test User', 'Demo Client', '100%', '42', '99.8%', '$0'];
          for (const blocked of blocklist) {
            if (value.includes(blocked)) {
              console.error(`BLOCKED: hardcoded value "${blocked}" detected in LIVE mode`);
            }
          }
        }
      };

      // Global validation for live mode
      (window as any).__validateLiveData = validateLiveData;
    }
  }, []);

  return {
    isLive,
    safeLiveData: (liveValue: any, testValue: any) => {
      return isLive ? (liveValue ?? '--') : testValue;
    },
    display: (value: any, demoValue?: any) => {
      if (isLive) {
        return value ?? '--';
      }
      return demoValue ?? value;
    }
  };
};

export const blockTestDataInLive = (payload: any): void => {
  const mode = (import.meta as any).env?.VITE_MODE;
  if (mode === 'LIVE' && payload) {
    const stringPayload = JSON.stringify(payload);
    const blocklist = ['Client A', 'Sample Company', 'John Smith', 'Jane Doe', 'Test User', 'Demo Client'];
    blocklist.forEach(blocked => {
      if (stringPayload.includes(blocked)) {
        throw new Error(`BLOCKED: dummy data "${blocked}" in live payload`);
      }
    });
  }
};