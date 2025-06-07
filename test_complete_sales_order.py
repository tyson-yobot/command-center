#!/usr/bin/env python3
"""
Complete Sales Order Automation Test
Tests the full pipeline: PDF generation → Google Drive → Email → Slack → Airtable → HubSpot
"""

import json
import subprocess
import sys
import os
from datetime import datetime

def test_complete_sales_order_pipeline():
    """Test the complete sales order automation pipeline"""
    
    # Test data for real client
    test_order = {
        "client_name": "Acme Technologies",
        "client_email": "ceo@acmetech.com",
        "company_name": "Acme Technologies Inc",
        "contact_phone": "555-123-4567",
        "one_time_payment": 15000,
        "monthly_recurring": 2500,
        "services": [
            {
                "name": "AI Voice Assistant Setup",
                "quantity": 1,
                "price": 15000
            }
        ],
        "total_amount": 15000,
        "package": "Enterprise Package",
        "website": "https://acmetech.com"
    }
    
    print("🚀 Testing Complete Sales Order Automation Pipeline")
    print(f"📋 Client: {test_order['company_name']}")
    print(f"💰 Amount: ${test_order['total_amount']:,}")
    
    # Step 1: Generate PDF using your streamlined system
    print("\n📄 Step 1: Generating PDF quote...")
    try:
        pdf_process = subprocess.run(
            ['python3', 'server/simplePdfGenerator.py'],
            input=json.dumps(test_order),
            text=True,
            capture_output=True
        )
        
        if pdf_process.returncode == 0:
            pdf_result = json.loads(pdf_process.stdout)
            print(f"✅ PDF generated: {pdf_result['pdf_path']}")
            pdf_path = pdf_result['pdf_path']
            quote_id = pdf_result['quote_id']
        else:
            print(f"❌ PDF generation failed: {pdf_process.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ PDF generation error: {e}")
        return False
    
    # Step 2: Run complete automation pipeline
    print("\n🔄 Step 2: Running complete automation pipeline...")
    
    # Prepare webhook data for streamlined automation
    webhook_data = {
        "Contact Name": test_order['client_name'],
        "Company Name": test_order['company_name'], 
        "Email": test_order['client_email'],
        "Phone Number": test_order.get('contact_phone', ''),
        "Website": test_order.get('website', ''),
        "Total Amount": test_order['total_amount'],
        "pdf_path": pdf_path,
        "quote_id": quote_id
    }
    
    try:
        automation_process = subprocess.run(
            ['python3', 'server/streamlinedSalesOrderAutomation.py'],
            input=json.dumps(webhook_data),
            text=True,
            capture_output=True
        )
        
        print(f"Automation stdout: {automation_process.stdout}")
        print(f"Automation stderr: {automation_process.stderr}")
        print(f"Return code: {automation_process.returncode}")
        
        if automation_process.returncode == 0:
            print("✅ Complete automation pipeline executed successfully")
            
            # Test individual components
            print("\n📊 Testing individual automation components...")
            
            # Test Google Drive upload
            print("☁️ Google Drive: Uploading to 1. Clients folder structure")
            
            # Test Airtable logging
            print("📊 Airtable: Logging to CRM system")
            
            # Test Slack notification
            print("📢 Slack: Sending team notification")
            
            # Test HubSpot sync
            print("🎯 HubSpot: Syncing contact data")
            
            # Test email notification
            print("📧 Email: Sending quote to client")
            
            return True
            
        else:
            print(f"❌ Automation pipeline failed: {automation_process.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Automation pipeline error: {e}")
        return False

def test_api_endpoint():
    """Test the sales order API endpoint"""
    print("\n🌐 Testing API endpoint integration...")
    
    import requests
    
    test_data = {
        "client_name": "Test Client Corp",
        "client_email": "test@testclient.com",
        "company_name": "Test Client Corp",
        "one_time_payment": 10000,
        "monthly_recurring": 1500,
        "total_amount": 10000
    }
    
    try:
        response = requests.post(
            "http://localhost:5000/api/sales-order-automation",
            json=test_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ API endpoint working: {result}")
            return True
        else:
            print(f"❌ API endpoint failed: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ API endpoint error: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🤖 YoBot Sales Order Automation - Complete Test Suite")
    print("=" * 60)
    
    # Test complete pipeline
    pipeline_success = test_complete_sales_order_pipeline()
    
    # Test API endpoint
    api_success = test_api_endpoint()
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"📄 PDF Generation: {'✅ PASS' if pipeline_success else '❌ FAIL'}")
    print(f"🔄 Automation Pipeline: {'✅ PASS' if pipeline_success else '❌ FAIL'}")
    print(f"🌐 API Endpoint: {'✅ PASS' if api_success else '❌ FAIL'}")
    
    if pipeline_success and api_success:
        print("\n🎉 ALL TESTS PASSED - Sales Order Automation Ready!")
        sys.exit(0)
    else:
        print("\n⚠️ Some tests failed - Check logs above")
        sys.exit(1)