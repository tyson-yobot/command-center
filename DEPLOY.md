# YoBot Command Center Deployment Guide
This guide provides instructions for deploying the **YoBot® Command Center** to different environments, including local, staging, and production.

## 🚀 Requirements

### Prerequisites:
- **Node.js**: v18 or above
- **pnpm**: v6.0 or above (use `npm install -g pnpm`)
- **Flask**: For backend API routing
- **Airtable API Key**: For data syncing
- **Slack Webhook URL**: For alerts

### Environment Variables
Make sure to configure your `.env` file with the following keys:
```env
AIRTABLE_API_KEY=your_airtable_key_here
SLACK_WEBHOOK_URL=your_slack_webhook_url_here
OPENAI_API_KEY=your_openai_key_here
🌐 Setting Up Locally (Development)
Clone the Repository:

bash
Copy
Edit
git clone https://github.com/tyson-yobot/command-center.git
cd command-center
Install Dependencies:

bash
Copy
Edit
pnpm install
Run the Development Server:

bash
Copy
Edit
pnpm dev
The application will be accessible at http://localhost:3000.

🔄 Deploying to Production
1. Set up environment variables:
Make sure your .env file has all the production values set.

2. Prepare Build:
Run the build command to create a production build.

bash
Copy
Edit
pnpm build
3. Deploy to Hosting (e.g., Render, AWS, Heroku):
Follow the deployment instructions specific to your platform.

Example for Render:

Connect your GitHub repository to Render.

Set up environment variables in Render.

Deploy with the pnpm build and start commands.

⚙️ Backend (Flask) Setup
Install Flask:

bash
Copy
Edit
pip install flask
Run the Flask Server:

bash
Copy
Edit
flask run
The Flask API will be available at http://localhost:5000.

🔒 Security & Authentication
API Keys: Make sure API keys (e.g., Airtable, OpenAI, Slack) are properly set up in .env files.

HTTPS: Always ensure HTTPS is enabled when deploying to production for secure communication.

🧰 Testing
1. Run Unit Tests:
Make sure all unit tests pass before deploying to production:

bash
Copy
Edit
pnpm test
2. Integration Testing:
Ensure all integrations (Airtable, Slack, Stripe) are working correctly in staging.

📚 Troubleshooting
Common Issues:
Missing environment variables: Make sure .env contains all necessary keys.

API errors: Check backend logs for detailed error messages.

📝 Notes
For full design and component layout references, see the YoBot Design System Wiki.

If deploying to Render, make sure to follow Render’s Deployment Documentation.

yaml
Copy
Edit

---

### ✅ **What to Put in `AGENTS.md`**

The **`AGENTS.md`** file will document all the **agents** you’re running in YoBot®. It will include the **logic**, **workflows**, **metrics**, and **functionality** for each AI agent like VoiceBot, Lead Scraper, etc.

---

### **Example `AGENTS.md` Content:**

```md
# YoBot® Agent Functions & Behavior Map

This document outlines the workflows, logic, and behavior of all **AI agents** inside YoBot®.

---

## 🤖 1. VoiceBot Agent

### Purpose:
Automates the phone call responses using AI-powered NLP (Natural Language Processing).

### Workflow:
1. **Trigger**: A user initiates a phone call or makes a request.
2. **Action**: VoiceBot receives the request and processes it using **AWS Polly** or **ElevenLabs TTS**.
3. **Data Fetching**: Pulls relevant information from **Airtable** and external systems like CRM or Calendar.
4. **Response**: Provides a voice-based reply to the user. (Custom responses based on user queries).

### Metrics:
- **Calls Completed**: Number of successful calls made by VoiceBot.
- **Sentiment**: Sentiment score (positive/negative) of each conversation.
- **AI Match Rate**: Accuracy of VoiceBot responses based on training data.

---

## 💬 2. Lead Scraper Agent

### Purpose:
Scrapes lead data from external platforms like Apollo, Apify, PhantomBuster, and integrates it with **HubSpot CRM**.

### Workflow:
1. **Trigger**: Initiated via command or automatically on a schedule.
2. **Action**: Pulls lead data from external sources.
3. **Data Sync**: Sends the data into **Airtable** and **HubSpot** CRM.
4. **Response**: Alerts the admin with the number of leads processed and saved.

### Metrics:
- **Leads Processed**: Total leads successfully scraped and processed.
- **Leads Added**: Leads that were successfully synced to the CRM.
  
---

## 📅 3. Smart Calendar Agent

### Purpose:
Syncs appointments between **Google Calendar**, **HubSpot**, and internal systems.

### Workflow:
1. **Trigger**: When a user books an appointment or event in Google Calendar.
2. **Action**: Sync the event across **Google Calendar**, **HubSpot**, and the **Command Center**.
3. **Response**: Notify users about successful sync or event conflicts.

### Metrics:
- **Sync Success Rate**: The success rate of calendar event syncs.
- **Missed Events**: Events that failed to sync properly.

---

### 🔄 More Agents