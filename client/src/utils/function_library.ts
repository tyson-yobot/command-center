// Function Library - API calls to backend services
// This file contains all the functions used by the Command Center components

const API_BASE = '/api';

// Helper function to make API calls
async function apiCall(endpoint: string, data?: any) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API call to ${endpoint} failed:`, error);
    throw error;
  }
}

// Lead and Sales Functions
export async function fetchLeadsFromApollo(userEmail: string) {
  return apiCall('/leads/fetch-apollo', { userEmail });
}

export async function generateQuotePDF(leadId: string) {
  return apiCall('/quotes/generate-pdf', { leadId });
}

export async function submitSalesOrderToQBO(userEmail: string, mode: string) {
  return apiCall('/sales/submit-qbo', { userEmail, mode });
}

export async function syncQuickBooksInvoices(userEmail: string) {
  return apiCall('/sync/quickbooks-invoices', { userEmail });
}

// Voice and Communication Functions
export async function openVoiceStudio() {
  return apiCall('/voice/open-studio');
}

export async function createVoiceStudioRecord(userEmail: string, mode: string) {
  return apiCall('/voice/create-record', { userEmail, mode });
}

// Calendar Functions
export async function getUpcomingCalendarEvents(userEmail: string) {
  return apiCall('/calendar/upcoming-events', { userEmail });
}

export async function syncCalendarToAirtable(userEmail: string, mode: string) {
  return apiCall('/calendar/sync-airtable', { userEmail, mode });
}

// Content and Marketing Functions
export async function runContentCreation() {
  return apiCall('/content/create');
}

export async function submitContentPost(userEmail: string, mode: string) {
  return apiCall('/content/submit-post', { userEmail, mode });
}

export async function triggerSocialPoster(userEmail: string) {
  return apiCall('/social/trigger-poster', { userEmail });
}

// Support and Tickets Functions
export async function submitSupportTicket(ticketData: { email: string; message: string }) {
  return apiCall('/support/submit-ticket', ticketData);
}

export async function submitTicketToAirtable(userEmail: string, mode: string) {
  return apiCall('/support/submit-airtable', { userEmail, mode });
}

// CRM and Sync Functions
export async function syncHubSpotContacts() {
  return apiCall('/crm/sync-hubspot');
}

export async function syncContactsToCRM() {
  return apiCall('/crm/sync-contacts');
}

export async function openHubSpotPage() {
  return apiCall('/crm/open-hubspot');
}

// Export and Data Functions
export async function exportAllData() {
  return apiCall('/data/export-all');
}

export async function pushExportToDrive(mode: string) {
  return apiCall('/data/push-drive', { mode });
}

// System and Admin Functions
export async function logEvent(eventData: { module: string; trigger: string; mode: string }) {
  return apiCall('/system/log-event', eventData);
}

export async function toggleFeature(feature: string, enabled: boolean) {
  return apiCall('/system/toggle-feature', { feature, enabled });
}

export async function runSystemDiagnostics() {
  return apiCall('/system/diagnostics');
}

export async function triggerEmergencyProtocol() {
  return apiCall('/system/emergency-protocol');
}

// PDF and Document Functions
export async function submitPdfUploadToAirtable(userEmail: string, mode: string) {
  return apiCall('/pdf/upload-airtable', { userEmail, mode });
}

// RAG and Knowledge Functions
export async function submitRagQueryToAirtable() {
  return apiCall('/rag/query-airtable');
}

export async function syncRagArticles() {
  return apiCall('/rag/sync-articles');
}

// Marketing Integration Functions
export async function postToMailchimp(userEmail: string) {
  return apiCall('/marketing/mailchimp-post', { userEmail });
}

export async function openMailchimpPage() {
  return apiCall('/marketing/open-mailchimp');
}

// Analytics Functions
export async function fetchSmartSpendStats() {
  return apiCall('/analytics/smart-spend-stats');
}

export async function fetchBotalyticsStats() {
  return apiCall('/analytics/botalytics-stats');
}

// Airtable Functions
export async function submitQuoteToAirtable(leadId: string, mode: string) {
  return apiCall('/airtable/submit-quote', { leadId, mode });
}