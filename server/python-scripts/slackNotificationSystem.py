import requests
import os
import json
from datetime import datetime

# Slack configuration
SLACK_BOT_TOKEN = os.getenv('SLACK_BOT_TOKEN')
SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')

def send_rich_slack_notification(data, folder_url=None):
    """Send rich Slack notification for sales order completion"""
    
    if not SLACK_BOT_TOKEN and not SLACK_WEBHOOK_URL:
        return {"status": "error", "message": "Slack credentials not configured"}
    
    company_name = data.get('company', 'Unknown Company')
    quote_id = data.get('quote_id', 'N/A')
    contact_name = data.get('contact', 'Unknown Contact')
    package = data.get('package', 'Unknown Package')
    grand_total = data.get('grand_total', 'N/A')
    
    # Rich message format
    message = {
        "text": f"New YoBot Quote Generated: {company_name}",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": f"🚀 New YoBot Quote: {quote_id}"
                }
            },
            {
                "type": "section",
                "fields": [
                    {
                        "type": "mrkdwn",
                        "text": f"*Company:*\n{company_name}"
                    },
                    {
                        "type": "mrkdwn", 
                        "text": f"*Contact:*\n{contact_name}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Package:*\n{package}"
                    },
                    {
                        "type": "mrkdwn",
                        "text": f"*Total:*\n${grand_total}"
                    }
                ]
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": f"*Quote ID:* {quote_id}\n*Date:* {data.get('date', datetime.now().strftime('%Y-%m-%d'))}"
                }
            }
        ]
    }
    
    # Add Google Drive folder link if available
    if folder_url and folder_url != 'N/A':
        message["blocks"].append({
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": f"*Google Drive Folder:* <{folder_url}|View Client Folder>"
            }
        })
    
    # Add action buttons
    message["blocks"].append({
        "type": "actions",
        "elements": [
            {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "View Quote PDF"
                },
                "style": "primary",
                "url": f"https://yourdomain.com/quotes/{quote_id}.pdf"
            },
            {
                "type": "button", 
                "text": {
                    "type": "plain_text",
                    "text": "Start Bot Cloning"
                },
                "style": "danger",
                "url": f"https://yourdomain.com/bot-cloning/{quote_id}"
            }
        ]
    })
    
    try:
        if SLACK_WEBHOOK_URL:
            response = requests.post(SLACK_WEBHOOK_URL, json=message)
        else:
            # Use Bot Token API
            headers = {
                "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
                "Content-Type": "application/json"
            }
            response = requests.post(
                "https://slack.com/api/chat.postMessage",
                headers=headers,
                json={**message, "channel": "#sales-alerts"}
            )
        
        if response.status_code == 200:
            return {"status": "success", "message": "Slack notification sent"}
        else:
            return {"status": "error", "message": f"Slack API error: {response.text}"}
            
    except Exception as e:
        return {"status": "error", "message": f"Slack notification failed: {str(e)}"}

def send_bot_cloning_notification(bot_data):
    """Send notification when bot cloning workflow starts or completes"""
    
    if not SLACK_BOT_TOKEN and not SLACK_WEBHOOK_URL:
        return {"status": "error", "message": "Slack credentials not configured"}
    
    company_name = bot_data.get('company', 'Unknown Company')
    bot_id = bot_data.get('bot_id', 'Unknown Bot')
    status = bot_data.get('status', 'Unknown')
    
    if status == "LIVE":
        color = "good"
        emoji = "🟢"
        title = f"{emoji} Bot Successfully Deployed"
    elif status == "FAILED":
        color = "danger"
        emoji = "🔴"
        title = f"{emoji} Bot Deployment Failed"
    else:
        color = "warning"
        emoji = "🟡"
        title = f"{emoji} Bot Cloning In Progress"
    
    message = {
        "text": f"Bot Update: {company_name}",
        "attachments": [
            {
                "color": color,
                "title": title,
                "fields": [
                    {
                        "title": "Company",
                        "value": company_name,
                        "short": True
                    },
                    {
                        "title": "Bot ID", 
                        "value": bot_id,
                        "short": True
                    },
                    {
                        "title": "Status",
                        "value": status,
                        "short": True
                    },
                    {
                        "title": "Timestamp",
                        "value": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        "short": True
                    }
                ]
            }
        ]
    }
    
    try:
        if SLACK_WEBHOOK_URL:
            response = requests.post(SLACK_WEBHOOK_URL, json=message)
        else:
            headers = {
                "Authorization": f"Bearer {SLACK_BOT_TOKEN}",
                "Content-Type": "application/json"
            }
            response = requests.post(
                "https://slack.com/api/chat.postMessage",
                headers=headers,
                json={**message, "channel": "#bot-deployments"}
            )
        
        if response.status_code == 200:
            return {"status": "success", "message": "Bot cloning notification sent"}
        else:
            return {"status": "error", "message": f"Slack API error: {response.text}"}
            
    except Exception as e:
        return {"status": "error", "message": f"Slack notification failed: {str(e)}"}