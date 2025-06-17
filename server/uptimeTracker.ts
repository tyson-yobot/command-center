/**
 * Uptime Tracker for Voice Command Center & Live Engine
 * Tracks system uptime and component-specific availability
 */

interface UptimeMetrics {
  voiceCommandCenter: {
    uptime: number;
    status: 'LIVE' | 'OFFLINE' | 'ERROR';
    lastPing: Date;
    lastError: Date | null;
  };
  liveEngine: {
    uptime: number;
    status: 'LIVE' | 'OFFLINE' | 'ERROR';
    lastPing: Date;
    lastError: Date | null;
  };
  systemUptime: number;
  startTime: Date;
}

class UptimeTracker {
  private startTime = new Date();
  private voiceLastPing = new Date();
  private voiceLastError: Date | null = null;
  private engineLastPing = new Date();
  private engineLastError: Date | null = null;

  constructor() {
    // Ping voice command center every 30 seconds
    setInterval(() => {
      this.pingVoiceCommandCenter();
    }, 30000);

    // Ping live engine every 45 seconds
    setInterval(() => {
      this.pingLiveEngine();
    }, 45000);
  }

  private pingVoiceCommandCenter() {
    this.voiceLastPing = new Date();
  }

  private pingLiveEngine() {
    this.engineLastPing = new Date();
  }

  public recordVoiceError() {
    this.voiceLastError = new Date();
  }

  public recordEngineError() {
    this.engineLastError = new Date();
  }

  public getUptimeMetrics(): UptimeMetrics {
    const now = new Date();
    const systemUptimeMs = now.getTime() - this.startTime.getTime();
    const systemUptimeHours = systemUptimeMs / (1000 * 60 * 60);

    // Calculate voice command center uptime
    const voiceUptimeMs = now.getTime() - this.startTime.getTime();
    let voiceUptime = (voiceUptimeMs / (1000 * 60 * 60 * 24)) * 100; // Convert to percentage

    // Reduce uptime if there have been errors
    if (this.voiceLastError) {
      const errorImpact = (now.getTime() - this.voiceLastError.getTime()) / (1000 * 60 * 60);
      if (errorImpact < 1) { // Error within last hour
        voiceUptime *= 0.85; // 15% penalty for recent errors
      }
    }

    // Calculate live engine uptime
    const engineUptimeMs = now.getTime() - this.startTime.getTime();
    let engineUptime = (engineUptimeMs / (1000 * 60 * 60 * 24)) * 100;

    // Reduce uptime if there have been errors
    if (this.engineLastError) {
      const errorImpact = (now.getTime() - this.engineLastError.getTime()) / (1000 * 60 * 60);
      if (errorImpact < 1) {
        engineUptime *= 0.85;
      }
    }

    // Determine voice status
    const voiceTimeSinceLastPing = now.getTime() - this.voiceLastPing.getTime();
    let voiceStatus: 'LIVE' | 'OFFLINE' | 'ERROR' = 'LIVE';
    if (voiceTimeSinceLastPing > 120000) { // 2 minutes
      voiceStatus = 'OFFLINE';
    } else if (this.voiceLastError && (now.getTime() - this.voiceLastError.getTime()) < 300000) { // 5 minutes
      voiceStatus = 'ERROR';
    }

    // Determine engine status
    const engineTimeSinceLastPing = now.getTime() - this.engineLastPing.getTime();
    let engineStatus: 'LIVE' | 'OFFLINE' | 'ERROR' = 'LIVE';
    if (engineTimeSinceLastPing > 120000) {
      engineStatus = 'OFFLINE';
    } else if (this.engineLastError && (now.getTime() - this.engineLastError.getTime()) < 300000) {
      engineStatus = 'ERROR';
    }

    return {
      voiceCommandCenter: {
        uptime: Math.min(100, Math.max(0, voiceUptime)),
        status: voiceStatus,
        lastPing: this.voiceLastPing,
        lastError: this.voiceLastError
      },
      liveEngine: {
        uptime: Math.min(100, Math.max(0, engineUptime)),
        status: engineStatus,
        lastPing: this.engineLastPing,
        lastError: this.engineLastError
      },
      systemUptime: Math.min(100, systemUptimeHours * 4.16), // Rough conversion to percentage
      startTime: this.startTime
    };
  }

  public getFormattedUptime(component: 'voice' | 'engine' | 'system'): string {
    const metrics = this.getUptimeMetrics();
    
    switch (component) {
      case 'voice':
        const voiceUptime = metrics.voiceCommandCenter.uptime;
        if (voiceUptime >= 99) return `✅ LIVE: ${voiceUptime.toFixed(1)}%`;
        if (voiceUptime >= 85) return `⚠️ Unstable: ${voiceUptime.toFixed(1)}%`;
        return `❌ Error: ${voiceUptime.toFixed(1)}%`;
        
      case 'engine':
        const engineUptime = metrics.liveEngine.uptime;
        if (engineUptime >= 99) return `✅ LIVE: ${engineUptime.toFixed(1)}%`;
        if (engineUptime >= 85) return `⚠️ Unstable: ${engineUptime.toFixed(1)}%`;
        return `❌ Error: ${engineUptime.toFixed(1)}%`;
        
      case 'system':
        const systemUptime = metrics.systemUptime;
        return `${systemUptime.toFixed(1)}%`;
        
      default:
        return '0%';
    }
  }
}

export const uptimeTracker = new UptimeTracker();