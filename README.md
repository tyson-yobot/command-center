# YoBotAssistant

YoBotAssistant is the backend command center that powers YoBot’s automation and metrics tracking. It exposes a small Express API and a collection of modules for scraping, voice generation, automation runs and more.

## Running the Express Server

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   The server listens on `http://localhost:3000` by default or the value of the `PORT` environment variable.

## Environment Variables

Create a `.env` file based on `.env.example` and fill in the values for your environment. At minimum the server expects:

```bash
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_TABLE_NAME=Command Center · Metrics Tracker
ICLOUD_USERNAME=your-icloud-username
ICLOUD_PASSWORD=your-icloud-password
DATABASE_URL=postgres-connection-string
```

The `DATABASE_URL` is required for the database pool and `PORT` can be set to change the listening port. Other environment variables such as `ELEVENLABS_API_KEY`, `SLACK_WEBHOOK_URL` or `TWILIO_*` enable additional integrations.

## Available Modules

Server modules live under [`server/modules`](server/modules) and include:

- **airtable** – Airtable integrations and lead management
- **automation** – various automation batch scripts
- **auth** – auth helpers and role utilities
- **command-center** – dashboard metrics and real/live data providers
- **control-center** – configuration helpers
- **lead-scraper** – scraping pipelines for lead generation
- **pdf** – PDF generation utilities
- **qa** – QA tracking and validation
- **rag** – RAG engine and knowledge store helpers
- **sales** – sales order processing
- **scraper** – generic scraping routes
- **voice** – voice generation and callback handling
- **webhooks** – centralized webhook processing

See [`YOBOT_BRAND_GUIDE.md`](YOBOT_BRAND_GUIDE.md) for UI styling guidelines.
YoBot® Command Center
md
Copy
Edit
# 🧠 YoBot® Command Center

The **YoBot® Command Center** is the central hub for managing automation, analytics, communication, and integration. Fully automated and built for scalability, it includes:

- Real-time dashboards for monitoring metrics
- Integration with Slack, HubSpot, Stripe, QuickBooks, and Airtable
- Automated voice handling, lead scraping, billing, and more

---

## 🚀 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/tyson-yobot/command-center.git
cd command-center
2. Install Dependencies
bash
Copy
Edit
pnpm install
3. Run Dev Server
bash
Copy
Edit
pnpm dev
🌐 Environment Setup
Create a .env file in the root of the project with the following variables:

env
Copy
Edit
AIRTABLE_API_KEY=your_airtable_api_key
SLACK_WEBHOOK_URL=your_slack_webhook_url
OPENAI_API_KEY=your_openai_key
📐 YoBot® Design System
All components, styles, and behaviors must align with the YoBot® Design System for a consistent user experience.

✅ Global Styling Reference
Element	Style
Background	#000000 (pure black)
Cards	#1a1a1a with electric-blue border-4 border-[#0d82da] and shadow-2xl
Fonts	text-white by default, text-[#c3c3c3] for secondary text
Primary Buttons	.btn-blue, .btn-green, .btn-red, .btn-silver, etc. with emojis for UX
Analytics Cards	Dark background, thin electric-blue border, inner glow

🎨 Components Styling
Buttons: Rounded, large padding, glowing on hover.

Card Containers: Charcoal background #1a1a1a, glowing box shadow #0d82da.

Title Styling: Emoji labels required on every title for better UX.

📌 Quick Tip: Never create new color schemes or button styles that deviate from this structure. This system is built for automation and scalability.

🧩 Command Center Layout
🔲 Main Container
bg-[#000000], text-white, p-10, space-y-12

🚀 Interactive Tools Section
Container styling for all buttons:

bg-[#1a1a1a], border-4 border-[#0d82da], glowing box-shadow

Top Row Buttons (Example):
Emoji	Action	Color
📞	Start Pipeline	Green
💬	Manual Call	Green
🔍	Lead Scraper	Green
✍️	Content Creator	Purple
📩	Mailchimp	Purple

📊 Analytics Dashboard Cards (Live, Auto-Refreshed)
The following cards are powered by real-time data from Airtable and refreshed every 30 seconds.

File	Card Purpose
ABTestCard.tsx	🧪 A/B Script Testing Metrics
AIavatarOverlayCard.tsx	👤 AI Avatar Rendering Overlay
BotalyticsCard.tsx	📈 SmartSpend™ ROI Tracker
CalendarSyncCard.tsx	📆 Calendar Sync Status
CallsCompletedCard.tsx	📞 Calls Completed Count
ComplianceCheckerCard.tsx	✅ Compliance Checklist Completion
ContactRatioCard.tsx	🧠 Contact Rate %
CRMSyncCard.tsx	🗂 CRM Sync Verification
DealsClosedCard.tsx	🟢 Closed Deals Log
FollowUpTrackerCard.tsx	✅ Follow-Up Reminder Tracker
KPIAnalyticsCard.tsx	📊 Master KPI Summary Grid
LeadQualifierCard.tsx	🎯 Lead Score & Source Breakdown
LoggerIntegrityCard.tsx	🕵️‍♂️ Logger Tampering Detection
MissedCallLogCard.tsx	⚠️ Missed Calls Overview
MonthlyRevenueCard.tsx	💰 Monthly Recurring Revenue
PDFGeneratorCard.tsx	🧾 Quotes Generated (PDF)
PersonalityPackCard.tsx	🧠 AI Personality Module Status
QuickActionCard.tsx	🚀 Quick Action Launchpad UI
QuickBooksSyncCard.tsx	💳 QuickBooks Integration Status
RAGInsightCard.tsx	📚 RAG/Knowledge Search Metrics
RepScorecardCard.tsx	🧑‍💼 Agent Scorecard (QA)
SentimentCard.tsx	😄 Avg. Sentiment Score
SlackAlertsCard.tsx	📣 Slack Alert Logger
SmartCalendarCard.tsx	🗓 Smart Calendar Sync/Filters
SmartSpendCard.tsx	🧮 SmartSpend™ Calculations
StripeBillingCard.tsx	💵 Stripe Billing Tracker
TicketReviewCard.tsx	🧾 Zendesk Review Scorecard
TopNavBarCard.tsx	⬆️ Command Center Navbar
VoicePerformanceCard.tsx	🎤 VoiceBot Call Metrics

🧠 AI Agent System
For detailed agent workflows and behavior logic, refer to AGENTS.md.

📂 Related Links
🧠 Design System Wiki

🧱 Deployment Guide (if exists)

📊 Botalytics + SmartSpend™ dashboards

📁 AGENTS.md 

🔧 Build & Notes
All Airtable Base IDs and Table IDs are hardcoded.

No parameters, no shells — the code must be 100% production-ready.

Backend integration is built using Flask.

