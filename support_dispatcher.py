import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
from pyairtable import Table
from datetime import datetime

# === CONFIGURATION ===
SLACK_TOKEN = os.getenv("SLACK_BOT_TOKEN", "xRYo7LD89mNz2EvZy3kOrFiv")
SLACK_CHANNEL = "#support-queue"

AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY", "patQdihpuEhLfx2vP")
BASE_ID = os.getenv("AIRTABLE_BASE_ID", "appCoAtCZdARb4AM2")

TICKET_LOG_TABLE = "tblQPr9cHyNZDpipS"
ERROR_LOG_TABLE = "tblo1ESkt9ybkvaJH"

VOICE_FILE_PATH = "./uploads/test_yobot_voice.mp3"

# === INITIALIZE CLIENTS ===
try:
    slack_client = WebClient(token=SLACK_TOKEN)
    ticket_log = Table(AIRTABLE_API_KEY, BASE_ID, TICKET_LOG_TABLE)
    error_log = Table(AIRTABLE_API_KEY, BASE_ID, ERROR_LOG_TABLE)
except Exception as e:
    print(f"Initialization error: {e}")
    slack_client = None
    ticket_log = None
    error_log = None

# === ERROR LOGGING FUNCTION ===
def log_error(module, error_type, message, ticket_id=None, file_name=None):
    try:
        if error_log:
            error_log.create({
                "🧩 Source Module": module,
                "🚨 Error Type": error_type,
                "📝 Error Message": message,
                "📁 Fallback File Name": file_name or VOICE_FILE_PATH,
                "🔁 Retry Attempted": True,
                "📊 Retry Result": "Failed",
                "🧠 Context Ticket ID": ticket_id or "N/A",
                "📆 Date": datetime.now().strftime("%Y-%m-%d"),
                "⏰ Time": datetime.now().strftime("%H:%M:%S")
            })
    except Exception as e:
        print(f"[FATAL] Failed to log error to Airtable: {e}")

# === MAIN FUNCTION ===
def dispatch_support_response(ticket):
    try:
        ticket_id = ticket["ticketId"]
        client_name = ticket["clientName"]
        topic = ticket["topic"]
        ai_reply = ticket["aiReply"]
        escalation_flag = ticket["escalationFlag"]
        sentiment = ticket["sentiment"]

        # 1. Post Slack text
        if slack_client:
            slack_client.chat_postMessage(
                channel=SLACK_CHANNEL,
                text=f"*🎟 AI Reply for Ticket `{ticket_id}`*\n*Client:* {client_name}\n*Topic:* {topic}\n> {ai_reply}"
            )

        # 2. Upload MP3
        mp3_url = "No voice file"
        if slack_client and os.path.exists(VOICE_FILE_PATH):
            upload = slack_client.files_upload(
                channels=SLACK_CHANNEL,
                file=VOICE_FILE_PATH,
                filename=f"{ticket_id}_reply.mp3",
                title="🎧 Voice Reply",
                initial_comment="Here's the MP3 reply from YoBot 🎙"
            )
            mp3_url = upload["file"]["permalink"]

        # 3. Log ticket to Airtable
        if ticket_log:
            ticket_log.create({
                "🆔 Ticket ID": ticket_id,
                "🧑 Client Name": client_name,
                "📌 Topic": topic,
                "🤖 AI Reply": ai_reply,
                "🚩 Escalation Flag": escalation_flag,
                "📉 Sentiment": sentiment,
                "🎧 Voice File": mp3_url
            })

        print(f"[{datetime.now()}] ✅ Support ticket dispatched: {ticket_id}")
        return True

    except SlackApiError as e:
        print(f"[Slack Error] {e.response['error']}")
        return False
    except Exception as e:
        print(f"[Dispatch Error] {e}")
        return False

def test_support_dispatcher():
    """Test support dispatcher functionality"""
    ticket = {
        "ticketId": "TCK-1234",
        "clientName": "Test Client",
        "topic": "Bot Not Responding",
        "aiReply": "We've reconnected your bot and it's back online.",
        "escalationFlag": True,
        "sentiment": "Negative"
    }
    
    return dispatch_support_response(ticket)

if __name__ == "__main__":
    test_support_dispatcher()