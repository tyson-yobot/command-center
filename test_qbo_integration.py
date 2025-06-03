#!/usr/bin/env python3
"""
QuickBooks Integration Test Suite
Tests complete financial automation workflow including OAuth, customer creation, and invoice generation
"""

import os
import requests
import json
from datetime import datetime

BASE_URL = "https://72ddfeee-d145-4891-a820-14d5b3e09c66-00-c9rkbm78q1s2.worf.replit.dev"

def test_qbo_oauth_redirect():
    """Test QuickBooks OAuth redirect functionality"""
    print("🔐 Testing QuickBooks OAuth redirect...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/qbo/auth", allow_redirects=False)
        
        if response.status_code == 302:
            redirect_url = response.headers.get('Location', '')
            if 'appcenter.intuit.com' in redirect_url:
                print("✅ OAuth redirect working correctly")
                print(f"Redirect URL: {redirect_url}")
                return True
            else:
                print(f"❌ Invalid redirect URL: {redirect_url}")
                return False
        else:
            print(f"❌ Expected 302 redirect, got {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ OAuth test failed: {e}")
        return False

def test_qbo_connection():
    """Test QuickBooks API connection with stored credentials"""
    print("\n📊 Testing QuickBooks API connection...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/qbo/test-connection")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ QuickBooks API connection successful")
                print(f"Company: {data.get('company', {}).get('Name', 'Unknown')}")
                return True
            else:
                print(f"❌ Connection failed: {data.get('message', 'Unknown error')}")
                return False
        else:
            print(f"❌ API test failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        return False

def test_qbo_customer_creation():
    """Test QuickBooks customer creation"""
    print("\n👤 Testing QuickBooks customer creation...")
    
    test_customer = {
        "name": f"YoBot Test Customer {datetime.now().strftime('%Y%m%d_%H%M%S')}",
        "email": "test@yobot.dev",
        "phone": "555-123-4567",
        "companyName": "YoBot Test Company"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/qbo/create-customer", json=test_customer)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Customer created successfully")
                print(f"Customer ID: {data.get('customerId')}")
                return data.get('customerId')
            else:
                print(f"❌ Customer creation failed: {data.get('error', 'Unknown error')}")
                return None
        else:
            print(f"❌ Customer creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Customer creation test failed: {e}")
        return None

def test_qbo_invoice_creation(customer_id):
    """Test QuickBooks invoice creation"""
    if not customer_id:
        print("\n❌ Skipping invoice test - no customer ID")
        return False
        
    print("\n🧾 Testing QuickBooks invoice creation...")
    
    test_invoice = {
        "customerId": customer_id,
        "amount": 100.00,
        "description": "YoBot Automation Services - Test Invoice",
        "dueDate": "2025-07-01"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/qbo/create-invoice", json=test_invoice)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print("✅ Invoice created successfully")
                print(f"Invoice ID: {data.get('invoiceId')}")
                return True
            else:
                print(f"❌ Invoice creation failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Invoice creation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Invoice creation test failed: {e}")
        return False

def test_qbo_data_sync():
    """Test QuickBooks data synchronization"""
    print("\n🔄 Testing QuickBooks data sync...")
    
    try:
        # Test customer list retrieval
        response = requests.get(f"{BASE_URL}/api/qbo/customers")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                customers = data.get('customers', [])
                print(f"✅ Retrieved {len(customers)} customers from QuickBooks")
                return True
            else:
                print(f"❌ Data sync failed: {data.get('error', 'Unknown error')}")
                return False
        else:
            print(f"❌ Data sync failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Data sync test failed: {e}")
        return False

def run_complete_qbo_test_suite():
    """Run complete QuickBooks integration test suite"""
    print("🚀 Starting QuickBooks Integration Test Suite")
    print("=" * 60)
    
    results = {
        'oauth_redirect': False,
        'api_connection': False,
        'customer_creation': False,
        'invoice_creation': False,
        'data_sync': False
    }
    
    # Test OAuth redirect
    results['oauth_redirect'] = test_qbo_oauth_redirect()
    
    # Test API connection
    results['api_connection'] = test_qbo_connection()
    
    # Test customer creation
    customer_id = test_qbo_customer_creation()
    results['customer_creation'] = customer_id is not None
    
    # Test invoice creation
    results['invoice_creation'] = test_qbo_invoice_creation(customer_id)
    
    # Test data sync
    results['data_sync'] = test_qbo_data_sync()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📋 QuickBooks Integration Test Results:")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title():<25} {status}")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All QuickBooks integration tests passed!")
        return True
    else:
        print("⚠️  Some QuickBooks integration tests failed")
        return False

if __name__ == "__main__":
    run_complete_qbo_test_suite()