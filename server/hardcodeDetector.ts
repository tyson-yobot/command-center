// 🔐 HARDCODE DETECTOR: Zero tolerance for fake data in LIVE mode
// Scans and blocks all hardcoded values, placeholders, and test data

import { getSystemMode } from './systemMode';

class HardcodeDetector {
  
  private static BLOCKED_VALUES = [
    // Numbers and percentages
    '94.2%', '99.8%', '8.5%', '247%', '93.6%', '1.2s', '2 min ago',
    '47', '87', '142', '38', '23', '5', '6', '0', '54', '1,068',
    
    // Currency and business metrics
    '$85K', '$0', '4.7/5', '8.7/10', '12.3%',
    
    // Status indicators
    'flagged', 'errors', '/day', 'View Events', 'Online', 'Active',
    
    // Placeholder text
    'No operational data', 'No AI processing', 'Live automation active',
    'No scraping data', 'Not Processing', 'No Scheduling',
    
    // Test identifiers
    'test', 'demo', 'sample', 'mock', 'fake', 'placeholder',
    'Client A', 'Sample Company', 'John Smith', 'Jane Doe',
    'Test User', 'Demo Client', 'Example Corp'
  ];

  /**
   * 🛡️ Scan object for hardcoded values
   */
  static scanForHardcodes(data: any, context: string = ''): string[] {
    const violations: string[] = [];
    const systemMode = getSystemMode();
    
    if (systemMode !== 'live') {
      return violations; // Only enforce in LIVE mode
    }

    const dataString = JSON.stringify(data).toLowerCase();
    
    for (const blocked of this.BLOCKED_VALUES) {
      if (dataString.includes(blocked.toLowerCase())) {
        violations.push(`${context}: Blocked hardcode "${blocked}"`);
      }
    }

    return violations;
  }

  /**
   * 🔒 Block request with hardcoded data
   */
  static blockHardcodedRequest(data: any, endpoint: string): boolean {
    const violations = this.scanForHardcodes(data, endpoint);
    
    if (violations.length > 0) {
      console.error('🚨 HARDCODE VIOLATIONS DETECTED:');
      violations.forEach(v => console.error(`  - ${v}`));
      return true; // Block the request
    }
    
    return false; // Allow the request
  }

  /**
   * 🧹 Clean data by removing hardcoded values
   */
  static cleanLiveData(data: any): any {
    const systemMode = getSystemMode();
    
    if (systemMode !== 'live') {
      return data; // Return as-is in test mode
    }

    if (typeof data === 'string') {
      // Check if string contains hardcoded values
      for (const blocked of this.BLOCKED_VALUES) {
        if (data.toLowerCase().includes(blocked.toLowerCase())) {
          return ''; // Return empty string if hardcode detected
        }
      }
      return data;
    }

    if (typeof data === 'object' && data !== null) {
      const cleaned: any = Array.isArray(data) ? [] : {};
      
      for (const key in data) {
        cleaned[key] = this.cleanLiveData(data[key]);
      }
      
      return cleaned;
    }

    return data;
  }

  /**
   * 🎯 Validate API response for LIVE mode compliance
   */
  static validateLiveResponse(response: any, endpoint: string): boolean {
    const systemMode = getSystemMode();
    
    if (systemMode !== 'live') {
      return true; // Skip validation in test mode
    }

    const violations = this.scanForHardcodes(response, `API Response ${endpoint}`);
    
    if (violations.length > 0) {
      console.error(`🚨 LIVE MODE VIOLATION in ${endpoint}:`);
      violations.forEach(v => console.error(`  - ${v}`));
      return false;
    }

    return true;
  }

  /**
   * 📊 Generate compliance report
   */
  static generateComplianceReport(data: any): {
    compliant: boolean;
    violations: string[];
    cleanedData: any;
  } {
    const violations = this.scanForHardcodes(data, 'Compliance Check');
    const cleanedData = this.cleanLiveData(data);
    
    return {
      compliant: violations.length === 0,
      violations,
      cleanedData
    };
  }
}

export default HardcodeDetector;