import { WebClient } from '@slack/web-api';
import axios from 'axios';

interface DispatchData {
  ticketId: string;
  clientName: string;
  topic?: string;
  aiReply: string;
  escalationFlag: boolean;
  sentiment: string;
  mp3Filename?: string;
}

const SLACK_TOKEN = process.env.SLACK_BOT_TOKEN;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = "📄 Manual Review Queue";
const METRICS_TABLE_NAME = "📊 Command Center · Metrics Tracker";
const SLACK_CHANNEL = "#support-queue";

let slackClient: WebClient | null = null;
if (SLACK_TOKEN) {
  slackClient = new WebClient(SLACK_TOKEN);
}

export async function dispatchSupportResponse(data: DispatchData): Promise<void> {
  const { ticketId, clientName, topic, aiReply, escalationFlag, sentiment, mp3Filename } = data;
  
  try {
    // 1. Send Slack Message and get thread timestamp
    let threadTs = null;
    if (slackClient) {
      const messageResponse = await slackClient.chat.postMessage({
        channel: SLACK_CHANNEL,
        text: `*🎟 New AI Support Reply* for \`${ticketId}\`:\n> ${aiReply}`
      });
      threadTs = messageResponse.ts;

      // 2. Upload MP3 with error handling in thread
      if (mp3Filename && threadTs) {
        try {
          await slackClient.files.upload({
            channels: SLACK_CHANNEL,
            file: `./uploads/${mp3Filename}`,
            filename: mp3Filename,
            title: "🎧 Voice Reply",
            initial_comment: "Here's the MP3 reply from YoBot 🎙",
            thread_ts: threadTs // Reply in thread
          });
        } catch (fileError: any) {
          if (fileError.code === 'ENOENT') {
            await slackClient.chat.postMessage({
              channel: SLACK_CHANNEL,
              thread_ts: threadTs,
              text: `⚠️ MP3 file *${mp3Filename}* not found for ticket \`${ticketId}\`. Check ElevenLabs voice generation.`
            });
          } else if (fileError.data?.error) {
            await slackClient.chat.postMessage({
              channel: SLACK_CHANNEL,
              thread_ts: threadTs,
              text: `⚠️ Failed to upload MP3 for \`${ticketId}\`: ${fileError.data.error}`
            });
          }
        }
      }
    }

    // 3. Log to Airtable
    if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
      await axios.post(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
        fields: {
          "🆔 Ticket ID": ticketId,
          "🧑 Client Name": clientName,
          "📌 Topic": topic || "General Support",
          "🤖 AI Reply": aiReply,
          "🚩 Escalation Flag": escalationFlag,
          "📉 Sentiment": sentiment,
          "🎧 Voice File": mp3Filename ? "Uploaded to Slack" : "No voice file"
        }
      }, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    }

    // 4. Log to Command Center Metrics Tracker
    if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
      try {
        await axios.post(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${METRICS_TABLE_NAME}`, {
          fields: {
            "📁 Source": "Support Ticket AI",
            "📄 Ticket ID": ticketId,
            "🕒 Timestamp": new Date().toISOString(),
            "📣 Action": "Reply posted + MP3 uploaded",
            "⚠️ Result": escalationFlag ? "Escalated" : "Success"
          }
        }, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (metricsError) {
        console.error('Failed to log to metrics tracker:', metricsError);
      }
    }

    console.log('✅ Support response dispatched successfully.');

  } catch (error: any) {
    if (error.data?.error) {
      console.error('Slack error:', error.data.error);
    } else {
      console.error('Dispatch error:', error.message);
    }
    throw error;
  }
}