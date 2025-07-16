<<<<<<< HEAD
# YoBotAssistant Command Center


YoBotAssistant is the backend command center that powers YoBot's automation and metrics tracking. It is built with Node.js and Express and exposes a small API along with a collection of modules for scraping, voice generation, sales automation and more. Optional Python scripts handle iCloud calendar syncing.

## Running the Express Server

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in the required variables. At minimum provide:
   ```bash
   AIRTABLE_API_KEY=your-airtable-api-key
   AIRTABLE_BASE_ID=your-airtable-base-id
   AIRTABLE_TABLE_NAME=Command Center · Metrics Tracker
   ICLOUD_USERNAME=your-icloud-username
   ICLOUD_PASSWORD=your-icloud-password
   DATABASE_URL=postgres-connection-string
   # optional: change the port
   PORT=3000
   ```
   Additional variables such as `SLACK_WEBHOOK_URL`, `TWILIO_*`, `GOOGLE_*` and others enable integrations. See `.env.example` for the full list.
3. Start the server:
   ```bash
   npm run dev
   ```
   The API listens on `http://localhost:3000` by default or the value of `PORT`.

## Modules

Server modules live under [`server/modules`](server/modules) and include:

- **airtable** – Airtable integrations and lead management
- **automation** – automation batch scripts
- **auth** – authentication helpers
- **command-center** – metrics and live data providers
- **control-center** – configuration helpers
- **lead-scraper** – scraping pipelines for lead generation
- **pdf** – PDF generation utilities
- **qa** – QA tracking and validation
- **rag** – RAG engine helpers
- **sales** – sales order processing
- **scraper** – generic scraping routes
- **voice** – voice generation and callbacks
- **webhooks** – centralized webhook processing

Refer to the code in each module for detailed usage. UI styling guidelines are documented in [`YOBOT_BRAND_GUIDE.md`](YOBOT_BRAND_GUIDE.md).


YoBotAssistant is the backend command center that powers YoBot's automation and metrics tracking. It exposes a small Express API and a collection of modules for scraping, voice generation, automation runs and more.

## Prerequisites

- Node.js v20 or higher
- PNPM package manager (`npm install -g pnpm`)
- Python 3.11 (only required for the optional calendar sync scripts)

## Setup

1. Install Node dependencies:

## Prerequisites

- **Node.js** 18 or higher
- **PNPM** 8+ (optional, can use `npm` instead)
- **Python** 3.10+ for the optional iCloud sync scripts

## Environment Variables

The application relies on several environment variables. Create a `.env` file or
configure these variables in your deployment environment:

- `ICLOUD_USERNAME` – iCloud account username
- `ICLOUD_PASSWORD` – iCloud app-specific password
- `AIRTABLE_API_KEY` – API key for Airtable access
- `AIRTABLE_BASE_ID` – Airtable base identifier
- `AIRTABLE_TABLE_NAME` – default table used for metrics


## Setup

1. Install Node dependencies in the project root:
   ```bash
   npm install
   # or
   pnpm install
   ```
2. Install dependencies for the React client:

   ```bash
   cd client
   npm install

   cd client && npm install
   ```

2. Copy `.env.example` to `.env` and fill in your environment variables.
3. Start the Express development server:

   ```bash
   npm run dev
   ```

   The server listens on `PORT` (defaults to `3000`).

4. Launch the React client:

   ```bash
   cd client
   npm run dev
   ```

   The client starts on `http://localhost:5173` by default.

5. (Optional) Install Python requirements and run the calendar sync:

   ```bash
   pip install -r requirements.txt
   python app.py
   ```

   # or
   pnpm install
   cd ..
   ```
3. (Optional) install the Python requirements if you plan to run the iCloud sync service:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy `.env.example` to `.env` and fill in the environment variables.
5. Start the Express server:
   ```bash
   npm run dev
   ```
   The server listens on `PORT` (defaults to `3000`).
6. In another terminal start the React client:
   ```bash
   cd client
   npm run dev
   ```
   The client runs on `http://localhost:5173` by default.
7. To manually run the iCloud calendar sync:
   ```bash
   python app.py
   ```
6. Run the test suite to ensure everything works:
   ```bash
   npm test
   ```

## Environment Variables

The application relies on a number of environment variables for external services. Below is a consolidated list of all variables referenced in the codebase:

```
ADMIN_PASSWORD
AIRTABLE_API_KEY
AIRTABLE_BASE_ID
AIRTABLE_COMMAND_CENTER_BASE_TOKEN
AIRTABLE_PERSONAL_ACCESS_TOKEN
AIRTABLE_TABLE_ID
AIRTABLE_TABLE_NAME
AIRTABLE_VALID_TOKEN
APIFY_API_KEY
APOLLO_API_KEY
BOOKING_LINK
COMMAND_CENTER_URL
DASHBOARD_ID
DATABASE_URL
ELEVENLABS_API_KEY
ELEVENLABS_VOICE_ID
EMAIL_APP_PASSWORD
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REFRESH_TOKEN
HUBSPOT_API_KEY
HUBSPOT_WEBHOOK_URL
ICLOUD_PASSWORD
ICLOUD_USERNAME
KILL_SWITCH
LINKEDIN_SESSION_COOKIE
MAKE_WEBHOOK_URL
NODE_ENV
OPENAI_API_KEY
PHANTOMBUSTER_AGENT_ID
PHANTOMBUSTER_API_KEY
PORT
QUICKBOOKS_ACCESS_TOKEN
QUICKBOOKS_REALM_ID
REPL_ID
SLACK_BOT_TOKEN
SLACK_CHANNEL_ID
SLACK_WEBHOOK_URL
STRIPE_SECRET_KEY
SYSTEM_MODE
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
TWILIO_SMS_URL
VOICEBOT_API_KEY
VOICEBOT_TRIGGER_URL
ZENDESK_API_TOKEN
ZENDESK_DOMAIN
ZENDESK_EMAIL

YoBotAssistant is the backend command center that powers YoBot’s automation and metrics tracking. It exposes a small Express API and a collection of modules for scraping, voice generation, automation runs and more.


## Environment Variables

At minimum provide the following variables in your `.env` file:

```bash
AIRTABLE_API_KEY=your-airtable-api-key
AIRTABLE_BASE_ID=your-airtable-base-id
AIRTABLE_TABLE_NAME=Command Center - Metrics Tracker Table
ICLOUD_USERNAME=your-icloud-username
ICLOUD_PASSWORD=your-icloud-password
DATABASE_URL=postgres-connection-string
# PORT=3000
```

Additional variables such as `SLACK_WEBHOOK_URL`, `ELEVENLABS_API_KEY`,
`TWILIO_*` and many others enable optional integrations. See
`.env.example` for the full list used across the project.

## Available Modules

Server modules under [`server/modules`](server/modules) handle Airtable
integrations, lead scraping, PDF generation, voice automation and more.
Refer to the source for details.

## Optional Python Scripts

Two helper scripts provide iCloud calendar syncing:


- `app.py` – small Flask server scheduling `sync_calendar_to_airtable`
- `sync.py` – manual one‑off sync

They require the same environment variables and packages from
`requirements.txt`.

* `app.py` – a small Flask server that schedules `sync_calendar_to_airtable` every 15 minutes.
* `sync.py` – a standalone script for manual one‑off syncs.
* `server/yobot_command_center/sales_order.py` – processes sales order data when triggered from the Express API.

They require the same environment variables as above and the packages listed in `requirements.txt`.

These variables are used throughout the server modules for Airtable and iCloud
integrations.


**Security Notice:** The repository previously contained example credentials in
`client/src/.env`. Those values have been removed from version control. If you
used them, rotate your iCloud and Airtable credentials immediately and update
your personal `.env` file with fresh keys.


## Setup

Install the Python dependencies:

```bash
pip install -r requirements.txt
```




## Running Tests

```bash
npm test
```

## License


This project is licensed under the [MIT License](LICENSE).


This project is licensed under the [MIT License](LICENSE).

This project is licensed under the [MIT License](LICENSE)


=======
# YoBotAssistant
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
>>>>>>> dev

