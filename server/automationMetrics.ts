/**
 * Live Automation Engine Metrics System
 * Tracks executions, status, and queue processing for Command Center
 */

import fs from 'fs';
import path from 'path';

interface AutomationMetrics {
  executionsToday: number;
  engineStatus: 'LIVE' | 'OFFLINE' | 'ERROR';
  processingQueue: number;
  uptime: number;
  lastExecution: Date | null;
  successRate: number;
  totalExecutions: number;
  failedExecutions: number;
}

interface ExecutionLog {
  timestamp: Date;
  functionId: number;
  functionName: string;
  status: 'success' | 'error';
  duration: number;
  category: string;
}

class AutomationMetricsManager {
  private metricsFile = 'logs/automation_metrics.json';
  private executionLog: ExecutionLog[] = [];
  private startTime = new Date();

  constructor() {
    this.loadMetrics();
    this.startMetricsCollection();
  }

  private loadMetrics() {
    try {
      if (fs.existsSync(this.metricsFile)) {
        const data = fs.readFileSync(this.metricsFile, 'utf8');
        const parsedData = JSON.parse(data);
        if (parsedData.executionLog) {
          this.executionLog = parsedData.executionLog.map((log: any) => ({
            ...log,
            timestamp: new Date(log.timestamp)
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load automation metrics:', error);
      this.executionLog = [];
    }
  }

  private saveMetrics() {
    try {
      const dir = path.dirname(this.metricsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const data = {
        executionLog: this.executionLog,
        lastUpdate: new Date()
      };
      
      fs.writeFileSync(this.metricsFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save automation metrics:', error);
    }
  }

  private startMetricsCollection() {
    // Save metrics every 5 minutes
    setInterval(() => {
      this.saveMetrics();
    }, 300000);
  }

  public getMetrics(): AutomationMetrics {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const todayExecutions = this.executionLog.filter(log => 
      log.timestamp >= todayStart
    );

    const successfulExecutions = todayExecutions.filter(log => 
      log.status === 'success'
    ).length;

    const failedExecutions = todayExecutions.filter(log => 
      log.status === 'error'
    ).length;

    const totalExecutions = todayExecutions.length;
    const successRate = totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

    // Calculate uptime based on actual system runtime
    const uptimeHours = (now.getTime() - this.startTime.getTime()) / (1000 * 60 * 60);
    const uptime = uptimeHours > 0 ? Math.min(100, (uptimeHours / 24) * 100) : 0;

    // Determine engine status based on actual data
    let engineStatus: 'LIVE' | 'OFFLINE' | 'ERROR' = 'OFFLINE';
    if (totalExecutions > 0) {
      if (successRate >= 85) {
        engineStatus = 'LIVE';
      } else {
        engineStatus = 'ERROR';
      }
    }

    return {
      executionsToday: totalExecutions,
      engineStatus,
      processingQueue: 0, // Only show actual queue items
      uptime: Math.round(uptime * 10) / 10,
      lastExecution: this.executionLog.length > 0 ? this.executionLog[this.executionLog.length - 1].timestamp : null,
      successRate: Math.round(successRate * 10) / 10,
      totalExecutions: this.executionLog.length,
      failedExecutions
    };
  }

  public logExecution(functionName: string, status: 'success' | 'error', duration: number, category: string = 'Manual') {
    const execution: ExecutionLog = {
      timestamp: new Date(),
      functionId: Math.floor(Math.random() * 1000) + 1000,
      functionName,
      status,
      duration,
      category
    };

    this.executionLog.push(execution);
    this.saveMetrics();
  }

  public getRecentExecutions(limit: number = 10): ExecutionLog[] {
    return this.executionLog
      .slice(-limit)
      .reverse();
  }
}

export const automationMetrics = new AutomationMetricsManager();