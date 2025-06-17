/**
 * Live Data Cleaner - Removes all hardcoded/static data from LIVE environment
 * Preserves test data functionality for TEST mode only
 */

export interface EmptyState {
  message: string;
  description?: string;
  actionRequired?: string;
}

export const EMPTY_STATES = {
  ACTIVE_SESSIONS: {
    message: "No active sessions",
    description: "Awaiting live bot connections",
    actionRequired: "Start monitoring to detect active sessions"
  },
  RECENT_ACTIVITY: {
    message: "Awaiting live data...",
    description: "No recent activity detected",
    actionRequired: "Activity will appear when bots are active"
  },
  CALL_REPORTS: {
    message: "No call reports available",
    description: "Call data will populate once monitoring begins",
    actionRequired: "Enable call monitoring to generate reports"
  },
  SYSTEM_STATUS: {
    message: "System services pending connection",
    description: "Service status will update when connections are established",
    actionRequired: "Configure service endpoints to enable monitoring"
  },
  KNOWLEDGE_BASE: {
    message: "Knowledge base empty",
    description: "No documents or memories stored",
    actionRequired: "Upload documents or add memories to populate"
  },
  AUTOMATION_LOGS: {
    message: "No automation activity",
    description: "Automation logs will appear when functions execute",
    actionRequired: "Trigger automations to see activity"
  }
} as const;

export class LiveDataCleaner {
  /**
   * Checks if system is in LIVE mode
   */
  static isLiveMode(): boolean {
    return process.env.NODE_ENV === 'production' || 
           process.env.MODE === 'LIVE' || 
           process.env.SYSTEM_MODE === 'live';
  }

  /**
   * Returns empty dashboard metrics for LIVE mode
   */
  static getEmptyDashboardMetrics() {
    return {
      totalRevenue: 0,
      monthlyRecurring: 0,
      activeClients: 0,
      automationsSaved: 0,
      conversionRate: 0,
      customerSatisfaction: 0,
      revenueGrowth: 0,
      chartData: [],
      recentTransactions: [],
      topPerformers: [],
      alerts: []
    };
  }

  /**
   * Returns empty call monitoring data for LIVE mode
   */
  static getEmptyCallMonitoring() {
    return {
      activeCalls: 0,
      totalCallsToday: 0,
      avgSentiment: 0,
      successRate: 0,
      totalDuration: "0m",
      avgDuration: "0m",
      callDetails: [],
      sentimentTrend: [],
      performanceMetrics: {
        answered: 0,
        missed: 0,
        escalated: 0,
        resolved: 0
      }
    };
  }

  /**
   * Returns empty automation performance for LIVE mode
   */
  static getEmptyAutomationPerformance() {
    return {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      successRate: 0,
      avgExecutionTime: 0,
      totalExecutions: 0,
      recentTests: [],
      performanceTrend: [],
      automationHealth: {
        healthy: 0,
        warning: 0,
        critical: 0
      }
    };
  }

  /**
   * Returns empty live activity for LIVE mode
   */
  static getEmptyLiveActivity() {
    return {
      activeConnections: 0,
      recentEvents: [],
      systemHealth: {
        status: "pending",
        uptime: "0m",
        lastCheck: new Date().toISOString()
      },
      connectionStats: {
        total: 0,
        active: 0,
        idle: 0,
        failed: 0
      }
    };
  }

  /**
   * Returns empty knowledge stats for LIVE mode
   */
  static getEmptyKnowledgeStats() {
    return {
      totalDocuments: 0,
      recentlyUpdated: 0,
      pendingReview: 0,
      categories: [],
      lastSync: null,
      searchQueries: 0,
      topQueries: []
    };
  }

  /**
   * Returns empty system services status for LIVE mode
   */
  static getEmptySystemServices() {
    return {
      services: [
        {
          name: "Monitoring Service",
          status: "inactive",
          lastPing: null,
          description: "Awaiting connection"
        },
        {
          name: "Recording Service", 
          status: "inactive",
          lastPing: null,
          description: "Awaiting connection"
        },
        {
          name: "Analytics Service",
          status: "inactive", 
          lastPing: null,
          description: "Awaiting connection"
        },
        {
          name: "Notification Service",
          status: "inactive",
          lastPing: null,
          description: "Awaiting connection"
        }
      ],
      overallHealth: "pending"
    };
  }

  /**
   * Returns empty support tickets for LIVE mode
   */
  static getEmptyZendeskTickets() {
    return {
      openTickets: 0,
      urgentTickets: 0,
      averageResponseTime: "0h",
      satisfactionScore: 0,
      recentTickets: [],
      categoryBreakdown: [],
      trends: {
        daily: [],
        weekly: [],
        resolution: []
      }
    };
  }

  /**
   * Logs live mode data access for audit trail
   */
  static logLiveModeAccess(operation: string, endpoint: string, systemMode: string) {
    if (this.isLiveMode()) {
      console.log(`[LIVE] ${operation}: ${EMPTY_STATES.RECENT_ACTIVITY.message}`, {
        timestamp: new Date().toISOString(),
        operation,
        endpoint,
        systemMode,
        result: 'empty_state',
        message: 'Live mode - no hardcoded data served'
      });
    }
  }
}

export default LiveDataCleaner;