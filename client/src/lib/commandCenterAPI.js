/**
 * Command Center API Integration
 * Handles all UI control API calls with proper error handling
 */

// VoiceBot Control Functions
export async function toggleVoiceBot(enabled) {
  try {
    const response = await fetch('/api/voicebot/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'VoiceBot toggle failed');
    }
    
    return result;
  } catch (error) {
    console.error('VoiceBot toggle error:', error);
    throw error;
  }
}

// Force Webhook Trigger
export async function forceWebhookTrigger(webhook = 'test', payload = {}) {
  try {
    const response = await fetch('/api/dev/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhook, payload })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Webhook trigger failed');
    }
    
    return result;
  } catch (error) {
    console.error('Webhook trigger error:', error);
    throw error;
  }
}

// Reload Bot Memory
export async function reloadBotMemory() {
  try {
    const response = await fetch('/api/bot/memory/reload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Memory reload failed');
    }
    
    return result;
  } catch (error) {
    console.error('Memory reload error:', error);
    throw error;
  }
}

// Refresh Metrics Data
export async function refreshMetrics() {
  try {
    const response = await fetch('/api/metrics/pull', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Metrics refresh failed');
    }
    
    return result;
  } catch (error) {
    console.error('Metrics refresh error:', error);
    throw error;
  }
}

// Update DOM with Metrics Data
export function updateMetricsDisplay(data) {
  try {
    const leadsElement = document.getElementById("leadsMTD");
    if (leadsElement) {
      leadsElement.innerText = data.leadsMTD || 0;
    }
    
    const salesElement = document.getElementById("salesMTD");
    if (salesElement) {
      salesElement.innerText = data.salesMTD || 0;
    }
    
    const avgCallElement = document.getElementById("avgCallTime");
    if (avgCallElement) {
      avgCallElement.innerText = `${data.avgCallTime || 0}s`;
    }
    
    const errorRateElement = document.getElementById("errorRate");
    if (errorRateElement) {
      const errorRate = data.errorRate || 0;
      errorRateElement.innerText = `${(errorRate * 100).toFixed(2)}%`;
      
      if (errorRate < 0.01) {
        errorRateElement.className = 'text-green-600';
      } else if (errorRate < 0.05) {
        errorRateElement.className = 'text-yellow-600';
      } else {
        errorRateElement.className = 'text-red-600';
      }
    }
    
    const healthElement = document.getElementById("systemHealth");
    if (healthElement) {
      healthElement.innerText = `${data.systemHealth || 0}%`;
    }
  } catch (error) {
    console.error('Error updating metrics display:', error);
  }
}

// PDF Quote Builder
export async function buildQuote(quoteData) {
  try {
    const response = await fetch('/api/quotes/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quoteData)
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Quote generation failed');
    }
    
    return result;
  } catch (error) {
    console.error('Quote generation error:', error);
    throw error;
  }
}

// Test All API Endpoints
export async function testAllEndpoints() {
  console.log('Testing all Command Center API endpoints...');
  
  const results = {};
  
  try {
    results.voicebot = await toggleVoiceBot(true);
    console.log('VoiceBot toggle working');
  } catch (error) {
    console.error('VoiceBot toggle failed:', error.message);
    results.voicebot = { error: error.message };
  }
  
  try {
    results.webhook = await forceWebhookTrigger();
    console.log('Webhook trigger working');
  } catch (error) {
    console.error('Webhook trigger failed:', error.message);
    results.webhook = { error: error.message };
  }
  
  try {
    results.memory = await reloadBotMemory();
    console.log('Memory reload working');
  } catch (error) {
    console.error('Memory reload failed:', error.message);
    results.memory = { error: error.message };
  }
  
  try {
    results.metrics = await refreshMetrics();
    console.log('Metrics refresh working');
  } catch (error) {
    console.error('Metrics refresh failed:', error.message);
    results.metrics = { error: error.message };
  }
  
  try {
    results.quote = await buildQuote({
      package: 'Standard',
      addOns: ['SmartSpend'],
      email: 'test@example.com',
      clientName: 'Test Client'
    });
    console.log('Quote builder working');
  } catch (error) {
    console.error('Quote builder failed:', error.message);
    results.quote = { error: error.message };
  }
  
  console.log('API endpoint testing complete');
  return results;
}