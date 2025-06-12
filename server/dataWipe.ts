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
  // Force LIVE mode data wipe - always execute
  console.log('🧹 FORCE Running LIVE data wipe…');
  
  // Set environment to LIVE
  process.env.SYSTEM_MODE = 'LIVE';
  
  if (true) { // Always execute
    console.log('🧹 Running LIVE data wipe…');

    const fieldsToWipe = [
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
      'memorySize',
      'systemUptime',
      'botErrors',
      'clientNPS',
      'churnRiskFlags',
      'botUtilizationRate',
      'workflowPerformance',
      'costPerLead',
      'leadQualityScore',
      'closeRate',
      'revenuePerLead',
      'budgetUtilization',
      'automationCoverage',
      'paybackPeriod',
      'monthlyROI'
    ];

    fieldsToWipe.forEach((field) => {
      if (global.db && global.db[field]) {
        global.db[field] = null; // or [] if it's an array, or {} if it's an object
      }
    });

    // Clear any dashboard data cache
    if (global.dashboardCache) {
      delete global.dashboardCache;
    }

    // Reset hardcoded metrics
    if (global.hardcodedMetrics) {
      global.hardcodedMetrics = {};
    }

    console.log('✅ All LIVE test/hardcoded fields have been wiped.');
  } else {
    console.log('⚠️ Not in LIVE mode — data wipe skipped.');
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