#!/usr/bin/env python3
"""
Gmail OAuth Setup and Authentication Helper
Provides guided setup for Gmail API integration with YoBot automation system
"""

import os
import json
import sys
from oauth_gmail_send import authenticate_gmail, check_auth_status, send_followup_email

def setup_gmail_oauth():
    """Interactive Gmail OAuth setup"""
    print("🔐 Gmail OAuth Setup for YoBot Email Automation")
    print("=" * 50)
    
    # Check if client_secret.json exists
    if not os.path.exists('client_secret.json'):
        print("❌ client_secret.json not found!")
        print("This file contains your Google API credentials.")
        return False
    
    print("✅ Google API credentials found")
    
    # Check current auth status
    status = check_auth_status()
    if status['authenticated']:
        print("✅ Gmail OAuth already configured")
        return True
    
    print("🔑 Starting OAuth authentication flow...")
    print("A browser window will open for Google authentication.")
    print("Please authorize the YoBot application to send emails.")
    
    try:
        service = authenticate_gmail()
        print("✅ Gmail OAuth authentication successful!")
        
        # Test the authentication with a quick API call
        profile = service.users().getProfile(userId='me').execute()
        email_address = profile.get('emailAddress', 'Unknown')
        print(f"📧 Authenticated as: {email_address}")
        
        return True
        
    except Exception as e:
        print(f"❌ Authentication failed: {str(e)}")
        return False

def test_email_functionality():
    """Test email sending functionality"""
    print("\n📤 Testing Email Functionality")
    print("-" * 30)
    
    # Get test recipient
    recipient = input("Enter test email address (press Enter for default): ").strip()
    if not recipient:
        recipient = "test@example.com"
    
    result = send_followup_email(
        recipient_email=recipient,
        subject="YoBot Email Automation - Setup Complete",
        message_text="""Hello!

Your YoBot email automation system is now configured and ready.

✅ Gmail OAuth authentication successful
✅ Email automation endpoints active
✅ Follow-up sequences available

This system can now:
- Send automated follow-up emails
- Process lead notifications
- Handle customer communications
- Integrate with your existing workflows

Best regards,
YoBot Automation System

P.S. This is an automated test email from your newly configured system."""
    )
    
    if result.get('status') == 'sent':
        print(f"✅ Test email sent successfully to {recipient}")
        print(f"Message ID: {result.get('id', 'N/A')}")
        return True
    else:
        print(f"❌ Email send failed: {result.get('error', 'Unknown error')}")
        return False

def main():
    """Main setup function"""
    print("🚀 YoBot Gmail Integration Setup")
    print("This will configure Gmail OAuth for automated email sending.\n")
    
    # Step 1: OAuth Setup
    if not setup_gmail_oauth():
        print("\n❌ Gmail OAuth setup failed. Please check your configuration.")
        return False
    
    # Step 2: Test email functionality
    test_choice = input("\nWould you like to send a test email? (y/N): ").strip().lower()
    if test_choice in ['y', 'yes']:
        if test_email_functionality():
            print("\n🎉 Gmail email automation setup complete!")
            print("Your YoBot system can now send automated emails.")
        else:
            print("\n⚠️  OAuth setup successful, but test email failed.")
            print("Check your email settings and try again.")
    else:
        print("\n✅ Gmail OAuth setup complete!")
        print("Email automation is ready for use.")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)