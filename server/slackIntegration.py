"""
Enhanced Slack Integration for YoBot Sales Order Automation
Sends comprehensive notifications with actionable buttons and links
"""

import os
import requests
import json
from datetime import datetime

def send_enhanced_slack_notification(company_name, quote_id, pdf_url=None, folder_url=None, hubspot_contact_id=None):
    """
    Send enhanced Slack notification with comprehensive order details
    """
    SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
    
    if not SLACK_WEBHOOK_URL:
        return {
            'success': False,
            'error': 'Slack webhook URL not configured',
            'message': 'Please provide SLACK_WEBHOOK_URL environment variable'
        }
    
    try:
        # Create rich Slack message with blocks
        message = {
            "text": f"New YoBot Sales Order: {company_name}",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": f"🚀 New YoBot Order Complete"
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
                            "text": f"*Quote ID:*\n{quote_id}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Status:*\nAutomation Complete ✅"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Generated:*\n{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
                        }
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Completed Automations:*\n✅ Professional Quote PDF\n✅ Google Drive Client Folder\n✅ HubSpot Contact Created\n✅ Airtable Roadmap Tasks\n✅ Work Order CSV Generated\n✅ Email Notifications Sent"
                    }
                }
            ]
        }
        
        # Add action buttons if URLs are available
        actions = []
        
        if pdf_url:
            actions.append({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "📄 View Quote PDF"
                },
                "url": pdf_url,
                "style": "primary"
            })
        
        if folder_url:
            actions.append({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "📁 Open Client Folder"
                },
                "url": folder_url
            })
        
        if hubspot_contact_id:
            hubspot_url = f"https://app.hubspot.com/contacts/your-hub-id/contact/{hubspot_contact_id}"
            actions.append({
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "👤 View HubSpot Contact"
                },
                "url": hubspot_url
            })
        
        if actions:
            message["blocks"].append({
                "type": "actions",
                "elements": actions[:3]  # Slack limits to 3 buttons per action block
            })
        
        # Add divider and next steps
        message["blocks"].extend([
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Next Steps:*\n1. Review client requirements\n2. Schedule kickoff call within 24 hours\n3. Begin implementation tasks\n4. Monitor progress via Command Center"
                }
            }
        ])
        
        response = requests.post(SLACK_WEBHOOK_URL, json=message)
        
        if response.status_code == 200:
            print(f"✅ Enhanced Slack notification sent for {company_name}")
            return {
                'success': True,
                'company_name': company_name,
                'quote_id': quote_id,
                'message': 'Enhanced Slack notification sent successfully'
            }
        else:
            error_message = f"Slack API error: {response.status_code} - {response.text}"
            print(f"❌ Slack notification failed: {error_message}")
            return {
                'success': False,
                'error': error_message,
                'status_code': response.status_code,
                'message': 'Failed to send Slack notification'
            }
            
    except Exception as e:
        error_message = f"Slack integration error: {str(e)}"
        print(f"❌ {error_message}")
        return {
            'success': False,
            'error': str(e),
            'message': error_message
        }

def send_signature_completion_notification(company_name, envelope_id):
    """
    Send Slack notification when DocuSign is completed
    """
    SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
    
    if not SLACK_WEBHOOK_URL:
        return {
            'success': False,
            'error': 'Slack webhook URL not configured'
        }
    
    try:
        message = {
            "text": f"Document Signed: {company_name}",
            "blocks": [
                {
                    "type": "header",
                    "text": {
                        "type": "plain_text",
                        "text": "🎉 Document Signed!"
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
                            "text": f"*Envelope ID:*\n{envelope_id}"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Status:*\nSigned ✅"
                        },
                        {
                            "type": "mrkdwn",
                            "text": f"*Next Step:*\nBegin Implementation"
                        }
                    ]
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Client has signed the YoBot quote. Ready to begin implementation!"
                    }
                }
            ]
        }
        
        response = requests.post(SLACK_WEBHOOK_URL, json=message)
        
        if response.status_code == 200:
            print(f"✅ Signature completion notification sent for {company_name}")
            return {
                'success': True,
                'message': 'Signature completion notification sent'
            }
        else:
            return {
                'success': False,
                'error': f'Slack API error: {response.status_code}',
                'message': 'Failed to send signature completion notification'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Error sending signature completion notification'
        }

def send_simple_slack_notification(message_text):
    """
    Send simple Slack notification
    """
    SLACK_WEBHOOK_URL = os.getenv('SLACK_WEBHOOK_URL')
    
    if not SLACK_WEBHOOK_URL:
        return {
            'success': False,
            'error': 'Slack webhook URL not configured'
        }
    
    try:
        message = {
            "text": message_text
        }
        
        response = requests.post(SLACK_WEBHOOK_URL, json=message)
        
        if response.status_code == 200:
            print(f"✅ Simple Slack notification sent")
            return {
                'success': True,
                'message': 'Simple notification sent successfully'
            }
        else:
            return {
                'success': False,
                'error': f'Slack API error: {response.status_code}',
                'message': 'Failed to send simple notification'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'message': 'Error sending simple notification'
        }

def test_slack_integration():
    """Test Slack integration"""
    test_message = "🚀 YoBot Slack Integration Test - All systems operational!"
    
    result = send_simple_slack_notification(test_message)
    
    return result

if __name__ == "__main__":
    # Run integration test
    result = test_slack_integration()
    print(json.dumps(result, indent=2))