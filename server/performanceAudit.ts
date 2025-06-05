import { sendAutomationFailureAlert } from "./slackAlerts";

interface AutomationMetrics {
  functionName: string;
  executionTime: number;
  timestamp: Date;
  status: 'success' | 'failure';
  retryCount?: number;
  errorMessage?: string;
}

class PerformanceAuditor {
  private metrics: AutomationMetrics[] = [];
  private readonly MAX_METRICS = 1000; // Keep last 1000 executions

  logExecution(functionName: string, executionTime: number, status: 'success' | 'failure', errorMessage?: string, retryCount?: number) {
    const metric: AutomationMetrics = {
      functionName,
      executionTime,
      timestamp: new Date(),
      status,
      retryCount,
      errorMessage
    };

    this.metrics.push(metric);
    
    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Alert on failures
    if (status === 'failure' && errorMessage) {
      sendAutomationFailureAlert(functionName, errorMessage.substring(0, 100));
    }

    // Alert on slow executions (over 30 seconds)
    if (executionTime > 30000) {
      console.warn(`⚠️ Slow automation detected: ${functionName} took ${executionTime}ms`);
    }
  }

  getTopSlowFunctions(limit: number = 10): Array<{functionName: string, avgTime: number, executions: number}> {
    const functionStats = new Map<string, {totalTime: number, count: number}>();
    
    // Calculate averages for last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneDayAgo && m.status === 'success');
    
    recentMetrics.forEach(metric => {
      const existing = functionStats.get(metric.functionName) || {totalTime: 0, count: 0};
      existing.totalTime += metric.executionTime;
      existing.count += 1;
      functionStats.set(metric.functionName, existing);
    });

    return Array.from(functionStats.entries())
      .map(([functionName, stats]) => ({
        functionName,
        avgTime: Math.round(stats.totalTime / stats.count),
        executions: stats.count
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, limit);
  }

  getFailureAnalysis(): {
    totalFailures: number;
    failureRate: number;
    topFailingFunctions: Array<{functionName: string, failures: number, lastError: string}>;
  } {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneDayAgo);
    
    const totalExecutions = recentMetrics.length;
    const totalFailures = recentMetrics.filter(m => m.status === 'failure').length;
    const failureRate = totalExecutions > 0 ? (totalFailures / totalExecutions) * 100 : 0;

    const failuresByFunction = new Map<string, {count: number, lastError: string}>();
    
    recentMetrics
      .filter(m => m.status === 'failure')
      .forEach(metric => {
        const existing = failuresByFunction.get(metric.functionName) || {count: 0, lastError: ''};
        existing.count += 1;
        if (metric.errorMessage) {
          existing.lastError = metric.errorMessage;
        }
        failuresByFunction.set(metric.functionName, existing);
      });

    const topFailingFunctions = Array.from(failuresByFunction.entries())
      .map(([functionName, data]) => ({
        functionName,
        failures: data.count,
        lastError: data.lastError.substring(0, 100)
      }))
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 5);

    return {
      totalFailures,
      failureRate: Math.round(failureRate * 100) / 100,
      topFailingFunctions
    };
  }

  getRetryAnalysis(): Array<{functionName: string, avgRetries: number, maxRetries: number}> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneDayAgo && m.retryCount !== undefined);
    
    const retryStats = new Map<string, {totalRetries: number, count: number, maxRetries: number}>();
    
    recentMetrics.forEach(metric => {
      if (metric.retryCount !== undefined) {
        const existing = retryStats.get(metric.functionName) || {totalRetries: 0, count: 0, maxRetries: 0};
        existing.totalRetries += metric.retryCount;
        existing.count += 1;
        existing.maxRetries = Math.max(existing.maxRetries, metric.retryCount);
        retryStats.set(metric.functionName, existing);
      }
    });

    return Array.from(retryStats.entries())
      .map(([functionName, stats]) => ({
        functionName,
        avgRetries: Math.round((stats.totalRetries / stats.count) * 100) / 100,
        maxRetries: stats.maxRetries
      }))
      .filter(stat => stat.avgRetries > 0)
      .sort((a, b) => b.avgRetries - a.avgRetries);
  }

  generatePerformanceReport(): {
    slowFunctions: Array<{functionName: string, avgTime: number, executions: number}>;
    failureAnalysis: {
      totalFailures: number;
      failureRate: number;
      topFailingFunctions: Array<{functionName: string, failures: number, lastError: string}>;
    };
    retryAnalysis: Array<{functionName: string, avgRetries: number, maxRetries: number}>;
    summary: {
      totalExecutions: number;
      avgExecutionTime: number;
      systemHealth: number;
    };
  } {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.timestamp > oneDayAgo);
    
    const totalExecutions = recentMetrics.length;
    const successfulExecutions = recentMetrics.filter(m => m.status === 'success');
    const avgExecutionTime = successfulExecutions.length > 0 
      ? Math.round(successfulExecutions.reduce((sum, m) => sum + m.executionTime, 0) / successfulExecutions.length)
      : 0;
    
    const systemHealth = totalExecutions > 0 
      ? Math.round((successfulExecutions.length / totalExecutions) * 100)
      : 100;

    return {
      slowFunctions: this.getTopSlowFunctions(),
      failureAnalysis: this.getFailureAnalysis(),
      retryAnalysis: this.getRetryAnalysis(),
      summary: {
        totalExecutions,
        avgExecutionTime,
        systemHealth
      }
    };
  }
}

export const performanceAuditor = new PerformanceAuditor();

export function trackAutomationPerformance<T>(
  functionName: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  let retryCount = 0;

  const executeWithTracking = async (): Promise<T> => {
    try {
      const result = await fn();
      const executionTime = Date.now() - startTime;
      performanceAuditor.logExecution(functionName, executionTime, 'success', undefined, retryCount);
      return result;
    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      performanceAuditor.logExecution(functionName, executionTime, 'failure', error.message, retryCount);
      throw error;
    }
  };

  return executeWithTracking();
}