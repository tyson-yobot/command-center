#!/usr/bin/env python3
"""
Gmail OAuth Email Automation Test Script
Tests the email functionality with proper authentication handling
"""

import json
import sys
from oauth_gmail_send import send_followup_email, check_auth_status

def test_gmail_oauth_status():
    """Test Gmail OAuth authentication status"""
    print("📧 Testing Gmail OAuth Status...")
    status = check_auth_status()
    print(f"Auth Status: {json.dumps(status, indent=2)}")
    return status['authenticated']

def test_send_email(recipient="testlead@example.com"):
    """Test sending email through Gmail OAuth"""
    print(f"📤 Testing email send to {recipient}...")
    
    result = send_followup_email(
        recipient_email=recipient,
        subject="YoBot® Email Automation Test",
        message_text="""Hello from YoBot!

This is a test email from the automated email system.

✅ Gmail OAuth integration working
✅ Email automation functional
✅ Follow-up sequences ready

Best regards,
YoBot Automation System"""
    )
    
    print(f"Send Result: {json.dumps(result, indent=2)}")
    return result

def main():
    """Main test function"""
    print("🚀 Starting Gmail OAuth Email Automation Tests")
    print("=" * 50)
    
    # Test 1: Check OAuth status
    is_authenticated = test_gmail_oauth_status()
    
    if not is_authenticated:
        print("❌ Gmail OAuth not configured. Need to authenticate first.")
        print("Run the authentication process to proceed.")
        return False
    
    # Test 2: Send test email
    if len(sys.argv) > 1:
        recipient = sys.argv[1]
    else:
        recipient = "testlead@example.com"
    
    result = test_send_email(recipient)
    
    if result.get('status') == 'sent':
        print("✅ Email automation test successful!")
        return True
    else:
        print(f"❌ Email send failed: {result.get('error', 'Unknown error')}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)