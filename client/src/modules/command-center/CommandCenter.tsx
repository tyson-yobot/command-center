// CommandCenter.tsx — YoBot® Command Center (v8.0.0)
// Top-to-bottom production layout per 7-10-25 spec

import React from "react";
import axios from "axios";
import { SmartCalendar } from "@/components/modules/SmartCalendar";
import { RAGKnowledgeCenter } from "@/components/modules/RAGKnowledgeCenter";
import { VoiceStudio } from "@/components/modules/VoiceStudio";
import {
  SmartSpendKPI,
  BotalyticsKPI,
  ConversionPerformanceKPI,
  MarketingConversionKPI,
  ClientEngagementKPI,
  BotPerformanceKPI,
  ResponseTimeKPI,
  SupportTicketsKPI,
  RevenueForecastKPI,
  ComplianceTrackingKPI,
  LiveAgentCoverageKPI,
  SystemDiagnosticsKPI,
} from "@/components/kpi";

const slackWebhookUrl = "https://hooks.slack.com/services/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";

const handleApiCall = async (endpoint: string, label: string) => {
  try {
    await axios.post(`/api/${endpoint}`);
    await axios.post(slackWebhookUrl, { text: `✅ ${label} triggered from Command Center` });
  } catch (error) {
    console.error(`❌ ${label} failed`, error);
    await axios.post(slackWebhookUrl, { text: `❌ ${label} failed: ${error}` });
  }
};

const openExternal = (url: string) => {
  window.open(url, '_blank');
};

const QuickActionLaunchpad = () => {
  return (
    <section className="bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-blue-500 rounded-2xl p-4">
      <h2 className="text-2xl font-bold text-white mb-4">🚀 Quick Action Launchpad</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <button onClick={() => handleApiCall("pipeline/start", "Start Pipeline Calls" )} className="btn-glow">📞 Start Pipeline Calls</button>
        <button onClick={() => handleApiCall("call/manual", "Manual Call" )} className="btn-glow">📲 Manual Call</button>
        <button onClick={() => handleApiCall("lead/scrape", "Lead Scraper" )} className="btn-glow">🔍 Lead Scraper</button>
        <button onClick={() => handleApiCall("content/generate", "Content Creator" )} className="btn-glow">📝 Content Creator</button>
        <button onClick={() => handleApiCall("kpi/generate", "KPI Reports" )} className="btn-glow">📊 KPI Reports</button>
        <button onClick={() => handleApiCall("pdf/upload", "PDF Upload" )} className="btn-glow">📤 PDF Upload</button>
        <button onClick={() => handleApiCall("ticket/submit", "Submit Ticket" )} className="btn-glow">🎫 Submit Ticket</button>
        <button onClick={() => openExternal("https://mailchimp.com")} className="btn-glow">📧 Mailchimp</button>
        <button onClick={() => openExternal("https://app.hubspot.com")} className="btn-glow">🔗 HubSpot CRM</button>
        <button onClick={() => handleApiCall("admin/login", "Admin Login" )} className="btn-glow">🔐 Admin</button>
        <button onClick={() => handleApiCall("diagnostics/run", "Diagnostics" )} className="btn-glow">🧪 Diagnostics</button>
        <button onClick={() => handleApiCall("settings/open", "Settings" )} className="btn-glow">⚙️ Settings</button>
      </div>
      {/* 🔸 Advanced Tools (Collapsible) */}
      <div className="mt-6">
        <details className="bg-gray-800 rounded-xl p-4 border border-gray-600">
          <summary className="cursor-pointer text-lg font-semibold">Advanced Tools</summary>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            <button onClick={() => handleApiCall("pdf/quote", "Generate PDF Quote" )} className="btn-glow">📎 Generate PDF</button>
            <button onClick={() => handleApiCall("hubspot/sync", "Sync HubSpot" )} className="btn-glow">🔄 Sync HubSpot</button>
            <button onClick={() => handleApiCall("payment/log", "Log Payment" )} className="btn-glow">💸 Log Payment</button>
            <button onClick={() => handleApiCall("docs/upload", "Upload Docs" )} className="btn-glow">📂 Upload Docs</button>
            <button onClick={() => handleApiCall("sync/force", "Force Sync" )} className="btn-glow">🔧 Force Sync</button>
          </div>
        </details>
      </div>
    </section>
  );
};

const CommandCenter = () => {
  return (
    <div className="bg-black text-white min-h-screen p-4 space-y-8">
      <QuickActionLaunchpad />

      {/* 🗓️ Smart Calendar */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-blue-500 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-2">🗓️ Smart Calendar</h2>
        <SmartCalendar />
      </section>

      {/* 🧠 RAG Knowledge Base */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-blue-500 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-2">🧠 Knowledge Center</h2>
        <RAGKnowledgeCenter />
      </section>

      {/* 🎙️ Voice Studio */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 border-4 border-blue-500 rounded-2xl p-4">
        <h2 className="text-xl font-bold mb-2">🎙️ Voice Studio</h2>
        <VoiceStudio />
      </section>

      {/* 📈 Analytics Dashboard */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <SmartSpendKPI />
        <BotalyticsKPI />
        <ConversionPerformanceKPI />
        <MarketingConversionKPI />
        <ClientEngagementKPI />
        <BotPerformanceKPI />
        <ResponseTimeKPI />
        <SupportTicketsKPI />
        <RevenueForecastKPI />
        <ComplianceTrackingKPI />
        <LiveAgentCoverageKPI />
        <SystemDiagnosticsKPI />
      </section>

      {/* 🧾 Footer */}
      <footer className="text-center text-gray-400 border-t border-gray-600 pt-4 mt-8">
        © {new Date().getFullYear()} YoBot® Command Center – Advanced AI Business Automation
      </footer>
    </div>
  );
};

export default CommandCenter;


// ✅ calendar_router.py — merged into backend
from flask import Blueprint, request, jsonify
import requests
import os

calendar_router = Blueprint('calendar_router', __name__)

AIRTABLE_BASE_ID = "appRt8V3tH4g5Z5if"
AIRTABLE_TABLE_ID = "tblhxA9YOTf4ynJi2"
AIRTABLE_TOKEN = os.environ.get("AIRTABLE_TOKEN")
SLACK_WEBHOOK_URL = os.environ.get("SLACK_CALENDAR_LOG_URL")

@calendar_router.route("/api/calendar/events", methods=["GET"])
def get_calendar_events():
    airtable_url = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"
    headers = {
        "Authorization": f"Bearer {AIRTABLE_TOKEN}",
        "Content-Type": "application/json"
    }

    try:
        res = requests.get(airtable_url, headers=headers)
        data = res.json()
        records = data.get("records", [])

        events = []
        for r in records:
            fields = r.get("fields", {})
            events.append({
                "id": r["id"],
                "title": fields.get("📅 Event Title", "No title"),
                "start_time": fields.get("🕒 Start Time"),
                "end_time": fields.get("⏰ End Time"),
                "source": fields.get("👤 Owner", "Unknown")
            })

        return jsonify(events)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
