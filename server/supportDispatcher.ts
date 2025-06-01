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
const SLACK_CHANNEL = "#support-queue";

let slackClient: WebClient | null = null;
if (SLACK_TOKEN) {
  slackClient = new WebClient(SLACK_TOKEN);
}

export async function dispatchSupportResponse(data: DispatchData): Promise<void> {
  const { ticketId, clientName, topic, aiReply, escalationFlag, sentiment, mp3Filename } = data;
  
  try {
    // 1. Send Slack Message
    if (slackClient) {
      await slackClient.chat.postMessage({
        channel: SLACK_CHANNEL,
        text: `*🎟 New AI Support Reply* for \`${ticketId}\`:\n> ${aiReply}`
      });

      // 2. Upload MP3 with error handling
      if (mp3Filename) {
        try {
          await slackClient.files.upload({
            channels: SLACK_CHANNEL,
            file: `./uploads/${mp3Filename}`,
            filename: mp3Filename,
            title: "🎧 Voice Reply",
            initial_comment: "Here's the MP3 reply from YoBot 🎙"
          });
        } catch (fileError: any) {
          if (fileError.code === 'ENOENT') {
            await slackClient.chat.postMessage({
              channel: SLACK_CHANNEL,
              text: `⚠️ MP3 file *${mp3Filename}* not found for ticket \`${ticketId}\`. Check ElevenLabs voice generation.`
            });
          } else if (fileError.data?.error) {
            await slackClient.chat.postMessage({
              channel: SLACK_CHANNEL,
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