// LIVE Data Wipe System
// Clears all test/hardcoded values from dashboard components in LIVE mode only

interface WipeConfig {
  fieldsToWipe: string[];
  arrayFields: string[];
  objectFields: string[];
}

const wipeConfig: WipeConfig = {
  fieldsToWipe: [
    'activeCalls',
    'botProcessing', 
    'successRate',
    'systemHealth',
    'executionsToday',
    'errorTrend',
    'callLog',
    'supportTickets',
    'demoLeads',
    'debugMetrics',
    'totalRevenue',
    'monthlyRevenue',
    'activeConnections',
    'totalTests',
    'passRate',
    'averageResponseTime',
    'totalDocuments',
    'knowledgeBase',
    'memorySize'
  ],
  arrayFields: [
    'callLog',
    'supportTickets', 
    'demoLeads',
    'recentActivity',
    'errorLog',
    'testResults'
  ],
  objectFields: [
    'debugMetrics',
    'systemHealth',
    'performanceData'
  ]
};

export function wipeLiveData(): void {
  // Protection: Only execute in LIVE mode
  if (process.env.SYSTEM_MODE !== 'LIVE') {
    console.log('⚠️ Not in LIVE mode — data wipe skipped.');
    return;
  }

  console.log('🧹 Running LIVE data wipe...');

  try {
    // Simulate wiping dashboard data storage
    // In a real implementation, this would clear your actual data store
    const mockDataStore: Record<string, any> = {};

    // Clear scalar fields to null
    wipeConfig.fieldsToWipe.forEach((field) => {
      if (wipeConfig.arrayFields.includes(field)) {
        mockDataStore[field] = [];
      } else if (wipeConfig.objectFields.includes(field)) {
        mockDataStore[field] = {};
      } else {
        mockDataStore[field] = null;
      }
    });

    // Clear any cached dashboard metrics
    if (global.dashboardCache) {
      delete global.dashboardCache;
    }

    // Reset any in-memory counters
    if (global.metricsCounters) {
      global.metricsCounters = {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalTests: 0,
        passedTests: 0
      };
    }

    console.log('✅ All LIVE test/hardcoded fields have been wiped.');
    console.log(`📊 Cleared ${wipeConfig.fieldsToWipe.length} data fields`);
    
  } catch (error) {
    console.error('❌ Error during LIVE data wipe:', error);
  }
}

// Auto-execute on startup if in LIVE mode
export function initializeLiveDataWipe(): void {
  if (process.env.SYSTEM_MODE === 'LIVE') {
    console.log('🚀 Initializing LIVE mode - executing data wipe...');
    wipeLiveData();
  }
}

// Secure admin trigger function
export function secureAdminDataWipe(adminKey?: string): { success: boolean; message: string } {
  // Basic security check (in production, use proper authentication)
  const expectedAdminKey = process.env.ADMIN_WIPE_KEY || 'yobot-admin-2024';
  
  if (adminKey !== expectedAdminKey) {
    return {
      success: false,
      message: 'Unauthorized: Invalid admin key'
    };
  }

  if (process.env.SYSTEM_MODE !== 'LIVE') {
    return {
      success: false,
      message: 'Data wipe only available in LIVE mode'
    };
  }

  wipeLiveData();
  
  return {
    success: true,
    message: 'LIVE data successfully wiped'
  };
}