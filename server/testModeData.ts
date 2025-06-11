export class TestModeData {
  static getRealisticAutomationMetrics() {
    // Realistic business performance: 80% good, 20% needs improvement
    const testFunctions = [
      // Sales & CRM - Mostly good performance
      { name: "Lead Capture Integration", success: true, lastRun: "2025-06-11T05:15:23.000Z", responseTime: 245 },
      { name: "CRM Data Sync", success: true, lastRun: "2025-06-11T05:12:15.000Z", responseTime: 892 },
      { name: "Quote Generation", success: false, lastRun: "2025-06-11T04:58:32.000Z", responseTime: 0, error: "API timeout" },
      { name: "Invoice Processing", success: true, lastRun: "2025-06-11T05:14:01.000Z", responseTime: 567 },
      { name: "Payment Gateway Sync", success: true, lastRun: "2025-06-11T05:13:45.000Z", responseTime: 334 },
      { name: "Customer Onboarding", success: true, lastRun: "2025-06-11T05:11:28.000Z", responseTime: 1245 },
      { name: "Stripe Payment Processing", success: true, lastRun: "2025-06-11T05:16:12.000Z", responseTime: 423 },
      { name: "Revenue Recognition", success: false, lastRun: "2025-06-11T04:45:18.000Z", responseTime: 0, error: "Data validation failed" },
      
      // Communication - Good overall
      { name: "Email Campaign Automation", success: true, lastRun: "2025-06-11T05:14:33.000Z", responseTime: 678 },
      { name: "Slack Notification System", success: true, lastRun: "2025-06-11T05:15:44.000Z", responseTime: 156 },
      { name: "SMS Alert Service", success: true, lastRun: "2025-06-11T05:13:22.000Z", responseTime: 234 },
      { name: "Customer Support Chat", success: true, lastRun: "2025-06-11T05:12:55.000Z", responseTime: 445 },
      { name: "Newsletter Distribution", success: false, lastRun: "2025-06-11T04:32:17.000Z", responseTime: 0, error: "SMTP connection failed" },
      
      // Operations - Mixed performance
      { name: "Inventory Management", success: true, lastRun: "2025-06-11T05:15:12.000Z", responseTime: 789 },
      { name: "Order Fulfillment", success: true, lastRun: "2025-06-11T05:14:45.000Z", responseTime: 567 },
      { name: "Shipping Coordination", success: false, lastRun: "2025-06-11T04:28:39.000Z", responseTime: 0, error: "Carrier API down" },
      { name: "Supply Chain Tracking", success: true, lastRun: "2025-06-11T05:13:18.000Z", responseTime: 934 },
      { name: "Quality Assurance Checks", success: true, lastRun: "2025-06-11T05:11:52.000Z", responseTime: 1567 },
      
      // Analytics - Strong performance
      { name: "Revenue Analytics", success: true, lastRun: "2025-06-11T05:15:33.000Z", responseTime: 1234 },
      { name: "Customer Behavior Tracking", success: true, lastRun: "2025-06-11T05:14:21.000Z", responseTime: 678 },
      { name: "Performance Metrics", success: true, lastRun: "2025-06-11T05:13:57.000Z", responseTime: 445 },
      { name: "Conversion Rate Analysis", success: true, lastRun: "2025-06-11T05:12:43.000Z", responseTime: 892 },
      { name: "ROI Calculations", success: true, lastRun: "2025-06-11T05:15:08.000Z", responseTime: 567 },
      
      // HR & Compliance - Some issues
      { name: "Employee Onboarding", success: true, lastRun: "2025-06-11T05:14:15.000Z", responseTime: 1345 },
      { name: "Payroll Processing", success: true, lastRun: "2025-06-11T05:13:02.000Z", responseTime: 2134 },
      { name: "Compliance Monitoring", success: false, lastRun: "2025-06-11T04:15:44.000Z", responseTime: 0, error: "Regulation update required" },
      { name: "Training Management", success: true, lastRun: "2025-06-11T05:11:37.000Z", responseTime: 876 },
      { name: "Performance Reviews", success: true, lastRun: "2025-06-11T05:14:52.000Z", responseTime: 1456 },
      
      // Technology - Mostly stable
      { name: "Database Backup", success: true, lastRun: "2025-06-11T05:15:41.000Z", responseTime: 3456 },
      { name: "Security Monitoring", success: true, lastRun: "2025-06-11T05:14:28.000Z", responseTime: 234 },
      { name: "API Rate Limiting", success: true, lastRun: "2025-06-11T05:13:14.000Z", responseTime: 123 },
      { name: "Load Balancing", success: false, lastRun: "2025-06-11T04:52:33.000Z", responseTime: 0, error: "Server capacity exceeded" },
      { name: "Cache Management", success: true, lastRun: "2025-06-11T05:12:19.000Z", responseTime: 345 },
      
      // Marketing - Good results
      { name: "Lead Scoring", success: true, lastRun: "2025-06-11T05:15:27.000Z", responseTime: 567 },
      { name: "Campaign Analytics", success: true, lastRun: "2025-06-11T05:14:03.000Z", responseTime: 789 },
      { name: "Social Media Automation", success: true, lastRun: "2025-06-11T05:13:41.000Z", responseTime: 445 },
      { name: "Content Distribution", success: true, lastRun: "2025-06-11T05:12:58.000Z", responseTime: 623 },
      { name: "A/B Testing Framework", success: false, lastRun: "2025-06-11T04:41:26.000Z", responseTime: 0, error: "Statistical significance not reached" },
      
      // Customer Service - Mixed
      { name: "Ticket Routing", success: true, lastRun: "2025-06-11T05:15:19.000Z", responseTime: 234 },
      { name: "Knowledge Base Sync", success: true, lastRun: "2025-06-11T05:14:36.000Z", responseTime: 567 },
      { name: "Customer Feedback Analysis", success: true, lastRun: "2025-06-11T05:13:23.000Z", responseTime: 1234 },
      { name: "Escalation Management", success: false, lastRun: "2025-06-11T04:37:15.000Z", responseTime: 0, error: "Manager notification failed" },
      { name: "Response Time Tracking", success: true, lastRun: "2025-06-11T05:11:47.000Z", responseTime: 345 }
    ];

    const totalFunctions = testFunctions.length;
    const successfulFunctions = testFunctions.filter(f => f.success).length;
    const failedFunctions = totalFunctions - successfulFunctions;
    const successRate = Math.round((successfulFunctions / totalFunctions) * 100);

    // Calculate realistic metrics
    const avgResponseTime = Math.round(
      testFunctions
        .filter(f => f.success)
        .reduce((sum, f) => sum + f.responseTime, 0) / successfulFunctions
    );

    const lastUpdated = new Date().toISOString();

    return {
      totalFunctions,
      activeFunctions: successfulFunctions,
      failedFunctions,
      successRate,
      avgResponseTime,
      lastUpdated,
      functionDetails: testFunctions
    };
  }

  static getRealisticLeadMetrics() {
    return {
      totalLeads: 1247,
      qualifiedLeads: 892,
      convertedLeads: 156,
      conversionRate: 12.5,
      avgLeadScore: 68,
      leadsToday: 23,
      qualifiedToday: 16,
      convertedToday: 3,
      recentLeads: [
        { name: "Acme Corp", score: 85, status: "Qualified", source: "Website" },
        { name: "TechStart Inc", score: 72, status: "New", source: "LinkedIn" },
        { name: "Global Solutions", score: 91, status: "Converted", source: "Referral" },
        { name: "Innovation Labs", score: 45, status: "Cold", source: "Cold Outreach" },
        { name: "Digital Dynamics", score: 78, status: "Qualified", source: "Google Ads" }
      ]
    };
  }

  static getRealisticDashboardOverview() {
    const automationMetrics = this.getRealisticAutomationMetrics();
    const leadMetrics = this.getRealisticLeadMetrics();

    return {
      automation: {
        totalFunctions: automationMetrics.totalFunctions,
        activeFunctions: automationMetrics.activeFunctions,
        failedFunctions: automationMetrics.failedFunctions,
        successRate: automationMetrics.successRate,
        executionsToday: 247,
        avgResponseTime: automationMetrics.avgResponseTime,
        lastExecution: "2025-06-11T05:15:23.000Z"
      },
      sales: {
        totalLeads: leadMetrics.totalLeads,
        qualifiedLeads: leadMetrics.qualifiedLeads,
        convertedLeads: leadMetrics.convertedLeads,
        conversionRate: leadMetrics.conversionRate,
        totalRevenue: 284750,
        monthlyRevenue: 23890,
        avgDealSize: 1825,
        salesTarget: 350000,
        targetProgress: 81.4
      },
      support: {
        totalTickets: 159,
        openTickets: 17,
        resolvedTickets: 142,
        avgResolutionTime: "4.2 hours",
        satisfaction: 4.2,
        escalatedTickets: 3,
        firstResponseTime: "1.8 hours"
      },
      operations: {
        systemHealth: 84,
        uptime: "99.2%",
        activeUsers: 156,
        totalUsers: 189,
        dataProcessed: "2.3TB",
        apiCalls: 45670,
        errorRate: 2.1,
        avgLoadTime: "1.2s"
      },
      finance: {
        mrr: 23890,
        arr: 286680,
        churnRate: 3.2,
        ltv: 4250,
        cac: 185,
        grossMargin: 78.5,
        burnRate: 12400,
        runway: "18 months"
      },
      recentActivity: [
        { type: "automation", message: "Lead Capture Integration completed successfully", time: "2 minutes ago", status: "success" },
        { type: "alert", message: "Quote Generation system requires attention", time: "15 minutes ago", status: "warning" },
        { type: "success", message: "Revenue Analytics updated", time: "23 minutes ago", status: "success" },
        { type: "automation", message: "Email Campaign Automation executed", time: "31 minutes ago", status: "success" },
        { type: "alert", message: "Compliance Monitoring needs update", time: "1 hour ago", status: "warning" },
        { type: "error", message: "Newsletter Distribution failed - SMTP timeout", time: "1.2 hours ago", status: "error" },
        { type: "success", message: "Database backup completed", time: "2 hours ago", status: "success" },
        { type: "automation", message: "Inventory sync processed 450 items", time: "2.5 hours ago", status: "success" }
      ]
    };
  }

  static getRealisticKnowledgeStats() {
    return {
      success: true,
      totalDocuments: 342,
      recentlyAdded: 23,
      categories: [
        { name: "Product Documentation", count: 89 },
        { name: "API Reference", count: 67 },
        { name: "Training Materials", count: 54 },
        { name: "SOPs", count: 43 },
        { name: "Troubleshooting", count: 89 }
      ],
      searchQueries: 1567,
      popularDocuments: [
        { title: "API Integration Guide", views: 234 },
        { title: "Customer Onboarding Process", views: 189 },
        { title: "Billing FAQ", views: 156 }
      ],
      lastUpdated: "2025-06-11T05:14:32.000Z"
    };
  }

  static getRealisticZendeskTickets() {
    return {
      success: true,
      tickets: [
        {
          id: "ZD-2401",
          subject: "Integration timeout issues",
          status: "open",
          priority: "high",
          created: "2025-06-11T09:15:00Z",
          assignee: "Sarah Chen"
        },
        {
          id: "ZD-2402", 
          subject: "Dashboard loading slowly",
          status: "pending",
          priority: "medium",
          created: "2025-06-11T08:30:00Z",
          assignee: "Mike Rodriguez"
        },
        {
          id: "ZD-2403",
          subject: "API rate limit exceeded",
          status: "resolved",
          priority: "low",
          created: "2025-06-11T07:45:00Z",
          assignee: "Lisa Park"
        }
      ],
      total: 17,
      open: 8,
      pending: 4,
      resolved: 142,
      avgResolutionTime: "4.2 hours",
      satisfaction: 4.3,
      slaBreaches: 2
    };
  }

  static getRealisticLiveActivity() {
    return {
      success: true,
      message: "Live activity monitoring active",
      activities: [
        {
          timestamp: "2025-06-11T21:55:23.000Z",
          type: "api_call",
          description: "Stripe payment processed",
          status: "success",
          user: "system"
        },
        {
          timestamp: "2025-06-11T21:54:45.000Z", 
          type: "automation",
          description: "Lead scoring automation completed",
          status: "success",
          user: "automation"
        },
        {
          timestamp: "2025-06-11T21:53:12.000Z",
          type: "user_action",
          description: "Dashboard accessed by user",
          status: "info",
          user: "john.doe@company.com"
        },
        {
          timestamp: "2025-06-11T21:52:33.000Z",
          type: "system",
          description: "Database backup initiated",
          status: "info",
          user: "system"
        }
      ],
      activeUsers: 23,
      systemLoad: 67,
      memoryUsage: 78
    };
  }

  static getRealisticCallMonitoring() {
    return {
      success: true,
      data: {
        activeCalls: 3,
        totalCallsToday: 47,
        avgCallDuration: "8m 34s",
        callQuality: 4.1,
        recordings: [
          {
            id: "REC-001",
            duration: "12:45",
            quality: 4.5,
            sentiment: "positive",
            timestamp: "2025-06-11T14:30:00Z"
          },
          {
            id: "REC-002", 
            duration: "6:12",
            quality: 3.8,
            sentiment: "neutral",
            timestamp: "2025-06-11T13:15:00Z"
          }
        ],
        agents: [
          { name: "Agent A", status: "available", calls: 12 },
          { name: "Agent B", status: "busy", calls: 8 },
          { name: "Agent C", status: "available", calls: 15 }
        ]
      }
    };
  }
}