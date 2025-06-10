import { storage } from "./storage";

export interface ClientToggleConfig {
  client_id: string;
  toggles: {
    voicebot_enabled: boolean;
    call_engine_enabled: boolean;
    sms_engine_enabled: boolean;
    email_engine_enabled: boolean;
    scraping_apollo_enabled: boolean;
    scraping_phantombuster_enabled: boolean;
    ai_followup_enabled: boolean;
    slack_alerts_enabled: boolean;
    webhook_receivers_active: boolean;
    quickbooks_sync_enabled: boolean;
    calendar_sync_enabled: boolean;
    show_scrape_button: boolean;
    show_call_panel: boolean;
    show_revenue_forecast: boolean;
    show_debug_logs: boolean;
  };
  metrics: {
    last_call: string;
    last_sms: string;
    last_webhook: string;
    error_count_24h: number;
    api_usage_pct: number;
    uptime_pct: number;
  };
}

export interface GlobalConfig {
  admin_overrides: {
    force_disable_all: boolean;
    maintenance_mode: boolean;
    emergency_shutdown: boolean;
  };
  system_limits: {
    max_calls_per_hour: number;
    max_sms_per_day: number;
    max_scrape_requests: number;
  };
}

class ControlCenterConfigManager {
  private configs: Map<string, ClientToggleConfig> = new Map();
  private globalConfig: GlobalConfig;

  constructor() {
    this.globalConfig = {
      admin_overrides: {
        force_disable_all: false,
        maintenance_mode: false,
        emergency_shutdown: false
      },
      system_limits: {
        max_calls_per_hour: 100,
        max_sms_per_day: 500,
        max_scrape_requests: 1000
      }
    };
  }

  getDefaultClientConfig(client_id: string): ClientToggleConfig {
    return {
      client_id,
      toggles: {
        voicebot_enabled: true,
        call_engine_enabled: true,
        sms_engine_enabled: true,
        email_engine_enabled: true,
        scraping_apollo_enabled: false,
        scraping_phantombuster_enabled: true,
        ai_followup_enabled: true,
        slack_alerts_enabled: true,
        webhook_receivers_active: true,
        quickbooks_sync_enabled: true,
        calendar_sync_enabled: true,
        show_scrape_button: true,
        show_call_panel: true,
        show_revenue_forecast: false,
        show_debug_logs: true
      },
      metrics: {
        last_call: new Date().toISOString(),
        last_sms: new Date().toISOString(),
        last_webhook: new Date().toISOString(),
        error_count_24h: 0,
        api_usage_pct: 0,
        uptime_pct: 100
      }
    };
  }

  async getClientConfig(client_id: string): Promise<ClientToggleConfig> {
    if (this.configs.has(client_id)) {
      return this.configs.get(client_id)!;
    }

    // Load from storage or create default
    const config = this.getDefaultClientConfig(client_id);
    this.configs.set(client_id, config);
    return config;
  }

  async updateClientToggle(client_id: string, toggleKey: keyof ClientToggleConfig['toggles'], value: boolean): Promise<void> {
    const config = await this.getClientConfig(client_id);
    config.toggles[toggleKey] = value;
    this.configs.set(client_id, config);
  }

  async updateClientMetrics(client_id: string, metrics: Partial<ClientToggleConfig['metrics']>): Promise<void> {
    const config = await this.getClientConfig(client_id);
    config.metrics = { ...config.metrics, ...metrics };
    this.configs.set(client_id, config);
  }

  async isFeatureEnabled(client_id: string, feature: keyof ClientToggleConfig['toggles']): Promise<boolean> {
    // Check global overrides first
    if (this.globalConfig.admin_overrides.force_disable_all || 
        this.globalConfig.admin_overrides.maintenance_mode ||
        this.globalConfig.admin_overrides.emergency_shutdown) {
      return false;
    }

    const config = await this.getClientConfig(client_id);
    return config.toggles[feature];
  }

  async getGlobalConfig(): Promise<GlobalConfig> {
    return this.globalConfig;
  }

  async updateGlobalConfig(updates: Partial<GlobalConfig>): Promise<void> {
    this.globalConfig = { ...this.globalConfig, ...updates };
  }

  async getAllClientConfigs(): Promise<ClientToggleConfig[]> {
    return Array.from(this.configs.values());
  }

  async exportConfigsAsJSON(): Promise<string> {
    return JSON.stringify({
      global_config: this.globalConfig,
      client_configs: Array.from(this.configs.values())
    }, null, 2);
  }

  async importConfigsFromJSON(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.global_config) {
        this.globalConfig = data.global_config;
      }
      
      if (data.client_configs) {
        this.configs.clear();
        for (const config of data.client_configs) {
          this.configs.set(config.client_id, config);
        }
      }
    } catch (error) {
      throw new Error('Invalid configuration JSON format');
    }
  }
}

export const configManager = new ControlCenterConfigManager();