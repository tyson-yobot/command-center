/**
 * System Automation Orchestrator
 * Complete automation management for all YoBot platform functions
 */

import { Express } from 'express';
import cron from 'node-cron';

interface AutomationTask {
  id: string;
  name: string;
  schedule: string;
  endpoint: string;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  status: 'active' | 'paused' | 'error';
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface SystemMetrics {
  totalAutomations: number;
  activeAutomations: number;
  successfulRuns: number;
  failedRuns: number;
  systemUptime: string;
  lastHealthCheck: Date;
}

class SystemAutomationOrchestrator {
  private automationTasks: Map<string, AutomationTask> = new Map();
  private scheduledJobs: Map<string, any> = new Map();
  private metrics: SystemMetrics;
  private isRunning: boolean = false;

  constructor() {
    this.metrics = {
      totalAutomations: 0,
      activeAutomations: 0,
      successfulRuns: 0,
      failedRuns: 0,
      systemUptime: '0h 0m',
      lastHealthCheck: new Date()
    };
    this.initializeDefaultAutomations();
  }

  private initializeDefaultAutomations() {
    const defaultAutomations: AutomationTask[] = [
      // Core System Monitoring
      {
        id: 'health-check',
        name: 'System Health Check',
        schedule: '*/5 * * * *', // Every 5 minutes
        endpoint: '/api/system/health',
        enabled: true,
        status: 'active',
        category: 'monitoring',
        priority: 'high'
      },
      {
        id: 'metrics-update',
        name: 'Metrics Update',
        schedule: '*/1 * * * *', // Every minute
        endpoint: '/api/metrics/update',
        enabled: true,
        status: 'active',
        category: 'monitoring',
        priority: 'high'
      },
      
      // Lead Management Automation
      {
        id: 'lead-processing',
        name: 'Lead Processing Pipeline',
        schedule: '*/10 * * * *', // Every 10 minutes
        endpoint: '/api/lead-management/process-queue',
        enabled: true,
        status: 'active',
        category: 'lead-management',
        priority: 'high'
      },
      {
        id: 'crm-sync',
        name: 'CRM Data Synchronization',
        schedule: '0 */2 * * *', // Every 2 hours
        endpoint: '/api/crm/sync',
        enabled: true,
        status: 'active',
        category: 'crm',
        priority: 'medium'
      },
      
      // Voice Automation
      {
        id: 'voice-call-processing',
        name: 'Voice Call Processing',
        schedule: '*/5 * * * *', // Every 5 minutes
        endpoint: '/api/voice/process-queue',
        enabled: true,
        status: 'active',
        category: 'voice',
        priority: 'high'
      },
      {
        id: 'voice-sentiment-analysis',
        name: 'Voice Sentiment Analysis',
        schedule: '*/15 * * * *', // Every 15 minutes
        endpoint: '/api/voice/sentiment-analysis',
        enabled: true,
        status: 'active',
        category: 'voice',
        priority: 'medium'
      },
      
      // Financial Automation
      {
        id: 'stripe-sync',
        name: 'Stripe Payment Sync',
        schedule: '*/30 * * * *', // Every 30 minutes
        endpoint: '/api/stripe/sync',
        enabled: true,
        status: 'active',
        category: 'financial',
        priority: 'high'
      },
      {
        id: 'quickbooks-sync',
        name: 'QuickBooks Invoice Sync',
        schedule: '0 */4 * * *', // Every 4 hours
        endpoint: '/api/quickbooks/sync',
        enabled: true,
        status: 'active',
        category: 'financial',
        priority: 'medium'
      },
      
      // Communication Automation
      {
        id: 'slack-notifications',
        name: 'Slack Notification Dispatch',
        schedule: '*/2 * * * *', // Every 2 minutes
        endpoint: '/api/slack/dispatch-notifications',
        enabled: true,
        status: 'active',
        category: 'communication',
        priority: 'medium'
      },
      {
        id: 'email-queue-processing',
        name: 'Email Queue Processing',
        schedule: '*/5 * * * *', // Every 5 minutes
        endpoint: '/api/email/process-queue',
        enabled: true,
        status: 'active',
        category: 'communication',
        priority: 'medium'
      },
      
      // Data Management
      {
        id: 'airtable-sync',
        name: 'Airtable Data Sync',
        schedule: '*/20 * * * *', // Every 20 minutes
        endpoint: '/api/airtable/sync',
        enabled: true,
        status: 'active',
        category: 'data',
        priority: 'medium'
      },
      {
        id: 'database-backup',
        name: 'Database Backup',
        schedule: '0 2 * * *', // Daily at 2 AM
        endpoint: '/api/database/backup',
        enabled: true,
        status: 'active',
        category: 'data',
        priority: 'high'
      },
      
      // AI Automation
      {
        id: 'ai-training-updates',
        name: 'AI Training Updates',
        schedule: '0 6 * * *', // Daily at 6 AM
        endpoint: '/api/ai/training-update',
        enabled: true,
        status: 'active',
        category: 'ai',
        priority: 'low'
      },
      {
        id: 'bot-performance-optimization',
        name: 'Bot Performance Optimization',
        schedule: '0 */6 * * *', // Every 6 hours
        endpoint: '/api/bot/optimize',
        enabled: true,
        status: 'active',
        category: 'ai',
        priority: 'medium'
      },
      
      // Batch Function Automation (131-160)
      {
        id: 'batch-14-automation',
        name: 'Batch 14 Functions (131-140)',
        schedule: '*/30 * * * *', // Every 30 minutes
        endpoint: '/api/automation-batch-14/execute-all',
        enabled: true,
        status: 'active',
        category: 'batch-automation',
        priority: 'medium'
      },
      {
        id: 'batch-15-automation',
        name: 'Batch 15 Functions (141-150)',
        schedule: '*/30 * * * *', // Every 30 minutes
        endpoint: '/api/automation-batch-15/execute-all',
        enabled: true,
        status: 'active',
        category: 'batch-automation',
        priority: 'medium'
      },
      {
        id: 'batch-16-automation',
        name: 'Batch 16 Functions (151-160)',
        schedule: '*/30 * * * *', // Every 30 minutes
        endpoint: '/api/automation-batch-16/execute-all',
        enabled: true,
        status: 'active',
        category: 'batch-automation',
        priority: 'medium'
      }
    ];

    defaultAutomations.forEach(automation => {
      this.automationTasks.set(automation.id, automation);
    });

    this.metrics.totalAutomations = this.automationTasks.size;
    this.updateActiveAutomationCount();
  }

  public startOrchestrator() {
    if (this.isRunning) {
      console.log('🤖 System Automation Orchestrator already running');
      return;
    }

    console.log('🚀 Starting System Automation Orchestrator');
    this.isRunning = true;

    // Schedule all enabled automations
    this.automationTasks.forEach((task, id) => {
      if (task.enabled) {
        this.scheduleTask(id, task);
      }
    });

    // Start system monitoring
    this.startSystemMonitoring();

    console.log(`✅ Orchestrator started with ${this.metrics.activeAutomations} active automations`);
  }

  public stopOrchestrator() {
    console.log('🛑 Stopping System Automation Orchestrator');
    
    // Stop all scheduled jobs
    this.scheduledJobs.forEach((job, id) => {
      job.stop();
      console.log(`   Stopped: ${this.automationTasks.get(id)?.name}`);
    });
    
    this.scheduledJobs.clear();
    this.isRunning = false;
    
    console.log('✅ Orchestrator stopped');
  }

  private scheduleTask(id: string, task: AutomationTask) {
    try {
      const job = cron.schedule(task.schedule, async () => {
        await this.executeTask(id, task);
      }, {
        scheduled: false
      });

      job.start();
      this.scheduledJobs.set(id, job);
      
      // Calculate next run time
      task.nextRun = this.getNextRunTime(task.schedule);
      
      console.log(`   Scheduled: ${task.name} (${task.schedule})`);
    } catch (error) {
      console.error(`   Failed to schedule ${task.name}:`, error);
      task.status = 'error';
    }
  }

  private async executeTask(id: string, task: AutomationTask) {
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Executing: ${task.name}`);
      
      // Make HTTP request to endpoint with Command Center authentication
      const response = await fetch(`http://localhost:5000${task.endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-internal-request': 'command-center'
        },
        body: JSON.stringify({ 
          automationId: id, 
          scheduledExecution: true,
          timestamp: new Date().toISOString()
        })
      });

      const duration = Date.now() - startTime;
      task.lastRun = new Date();
      task.nextRun = this.getNextRunTime(task.schedule);

      if (response.ok) {
        this.metrics.successfulRuns++;
        console.log(`✅ Completed: ${task.name} (${duration}ms)`);
        
        // Log successful execution
        await this.logExecution(id, task, 'success', duration);
      } else {
        this.metrics.failedRuns++;
        task.status = 'error';
        console.log(`❌ Failed: ${task.name} - Status ${response.status}`);
        
        // Log failed execution
        await this.logExecution(id, task, 'failure', duration, `HTTP ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.failedRuns++;
      task.status = 'error';
      task.lastRun = new Date();
      
      console.error(`❌ Error executing ${task.name}:`, error);
      
      // Log error
      await this.logExecution(id, task, 'error', duration, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async logExecution(id: string, task: AutomationTask, status: string, duration: number, error?: string) {
    try {
        testName: `Automation: ${task.name}`,
        status: status === 'success' ? 'PASS' : 'FAIL',
        timestamp: new Date().toISOString(),
        details: `Scheduled execution completed in ${duration}ms. Category: ${task.category}, Priority: ${task.priority}`,
        errorMessage: error || ''
      });
    } catch (logError) {
      console.warn(`Failed to log execution for ${task.name}:`, logError);
    }
  }

  private startSystemMonitoring() {
    // Update metrics every minute
    cron.schedule('*/1 * * * *', () => {
      this.updateMetrics();
    });

    // Health check every 5 minutes
    cron.schedule('*/5 * * * *', () => {
      this.performHealthCheck();
    });

    console.log('📊 System monitoring started');
  }

  private updateMetrics() {
    this.updateActiveAutomationCount();
    this.metrics.lastHealthCheck = new Date();
    
    // Calculate system uptime (simplified)
    const uptimeMs = process.uptime() * 1000;
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
    this.metrics.systemUptime = `${hours}h ${minutes}m`;
  }

  private updateActiveAutomationCount() {
    this.metrics.activeAutomations = Array.from(this.automationTasks.values())
      .filter(task => task.enabled && task.status === 'active').length;
  }

  private async performHealthCheck() {
    console.log('🏥 Performing system health check');
    
    let healthyTasks = 0;
    let unhealthyTasks = 0;

    this.automationTasks.forEach(task => {
      if (task.enabled) {
        if (task.status === 'active') {
          healthyTasks++;
        } else {
          unhealthyTasks++;
        }
      }
    });

    const healthPercentage = (healthyTasks / (healthyTasks + unhealthyTasks)) * 100;
    
    console.log(`   Healthy Tasks: ${healthyTasks}/${healthyTasks + unhealthyTasks} (${healthPercentage.toFixed(1)}%)`);
    
    if (healthPercentage < 80) {
      console.warn('⚠️ System health below 80% - investigating unhealthy tasks');
      await this.restartUnhealthyTasks();
    }
  }

  private async restartUnhealthyTasks() {
    console.log('🔧 Restarting unhealthy tasks');
    
    this.automationTasks.forEach((task, id) => {
      if (task.enabled && task.status === 'error') {
        console.log(`   Restarting: ${task.name}`);
        task.status = 'active';
        
        // Stop existing job if it exists
        const existingJob = this.scheduledJobs.get(id);
        if (existingJob) {
          existingJob.stop();
        }
        
        // Reschedule the task
        this.scheduleTask(id, task);
      }
    });
  }

  private getNextRunTime(schedule: string): Date {
    // Simplified next run calculation - in production, use a proper cron library
    const now = new Date();
    return new Date(now.getTime() + 60000); // Add 1 minute as placeholder
  }

  // Public API methods
  public getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  public getAutomationStatus(): { id: string, task: AutomationTask }[] {
    return Array.from(this.automationTasks.entries()).map(([id, task]) => ({ id, task }));
  }

  public enableAutomation(id: string): boolean {
    const task = this.automationTasks.get(id);
    if (task) {
      task.enabled = true;
      task.status = 'active';
      this.scheduleTask(id, task);
      this.updateActiveAutomationCount();
      console.log(`✅ Enabled automation: ${task.name}`);
      return true;
    }
    return false;
  }

  public disableAutomation(id: string): boolean {
    const task = this.automationTasks.get(id);
    if (task) {
      task.enabled = false;
      task.status = 'paused';
      
      const job = this.scheduledJobs.get(id);
      if (job) {
        job.stop();
        this.scheduledJobs.delete(id);
      }
      
      this.updateActiveAutomationCount();
      console.log(`⏸️ Disabled automation: ${task.name}`);
      return true;
    }
    return false;
  }

  public addCustomAutomation(automation: Omit<AutomationTask, 'lastRun' | 'nextRun'>): string {
    const id = `custom-${Date.now()}`;
    this.automationTasks.set(id, {
      ...automation,
      id
    });
    
    if (automation.enabled) {
      this.scheduleTask(id, automation as AutomationTask);
    }
    
    this.metrics.totalAutomations++;
    this.updateActiveAutomationCount();
    
    console.log(`➕ Added custom automation: ${automation.name}`);
    return id;
  }
}

// Global orchestrator instance
const orchestrator = new SystemAutomationOrchestrator();

export { orchestrator, SystemAutomationOrchestrator };
export default orchestrator;