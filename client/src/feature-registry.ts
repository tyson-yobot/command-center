export interface Feature {
  id: string;
  label: string;
  emoji: string;
  componentPath: string; // relative to /modules
}

export const FEATURES: Feature[] = [
  { id: "pipeline", label: "Start Pipeline Calls", emoji: "📞", componentPath: "@/modules/pipeline/PipelineModal" },
  { id: "manual", label: "Manual Call", emoji: "📞", componentPath: "@/modules/voice/ManualCallModal" },
  { id: "lead-scraper", label: "Lead Scraper", emoji: "🔍", componentPath: "@/modules/lead-scraper/LeadScraperModal" },
  { id: "content", label: "Content Creator", emoji: "📝", componentPath: "@/modules/automation/ContentCreatorModal" },
  { id: "submit-ticket", label: "Submit Ticket", emoji: "🧾", componentPath: "@/modules/qa/SubmitTicketModal" },
  { id: "mailchimp", label: "MailChimp", emoji: "📷", componentPath: "@/modules/sales/MailchimpModal" },
  { id: "generate-report", label: "Generate Report", emoji: "📊", componentPath: "@/modules/pdf/GenerateReportModal" },
  { id: "hubspot", label: "HubSpot CRM", emoji: "🏢", componentPath: "@/modules/sales/HubSpotModal" },
  // Add more features here as needed
];
