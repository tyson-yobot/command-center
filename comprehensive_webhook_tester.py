"""
Comprehensive Webhook Testing Tool
Tests all 12 webhook endpoints with real data validation
"""

import requests
import json
import time
from datetime import datetime

class WebhookTester:
    def __init__(self):
        self.base_url = "https://workspace--tyson44.replit.app/api"
        self.results = []
        
    def test_platinum_promo(self):
        """Test Platinum Promo webhook"""
        url = f"{self.base_url}/leads/promo"
        payload = {
            "first_name": "John",
            "last_name": "Doe", 
            "email": "john.doe@example.com",
            "phone": "(555) 123-4567",
            "company": "Test Corp",
            "industry": "Technology",
            "employees": "50-100",
            "current_leads": "500",
            "pain_points": "Lead qualification issues",
            "promo_code": "PLATINUM2024"
        }
        return self._test_endpoint("Platinum Promo", url, payload)
    
    def test_roi_snapshot(self):
        """Test ROI Snapshot webhook"""
        url = f"{self.base_url}/leads/roi-snapshot"
        payload = {
            "client_name": "Acme Corp",
            "email": "admin@acmecorp.com",
            "monthly_leads": 1200,
            "current_conversion": 3.5,
            "avg_deal_size": 5000,
            "cost_per_lead": 85,
            "monthly_revenue": 210000,
            "roi_improvement": 25.5,
            "projection_period": "12 months"
        }
        return self._test_endpoint("ROI Snapshot", url, payload)
    
    def test_booking_form(self):
        """Test Booking Form webhook"""
        url = f"{self.base_url}/leads/booking"
        payload = {
            "full_name": "Sarah Johnson",
            "email": "sarah.j@company.com",
            "phone": "(555) 987-6543",
            "company": "Johnson & Associates",
            "job_title": "VP Marketing",
            "preferred_date": "2024-06-15",
            "preferred_time": "2:00 PM",
            "timezone": "EST",
            "meeting_type": "Demo",
            "pain_points": "Lead scoring and nurturing",
            "budget_range": "$10k-25k"
        }
        return self._test_endpoint("Booking Form", url, payload)
    
    def test_demo_request(self):
        """Test Demo Request webhook"""
        url = f"{self.base_url}/leads/demo"
        payload = {
            "name": "Mike Chen",
            "email": "mike.chen@startup.io",
            "phone": "(415) 555-0123",
            "company": "StartupIO",
            "industry": "SaaS",
            "company_size": "25-50",
            "current_solution": "Manual processes",
            "demo_type": "Voice Bot Demo",
            "urgency": "High",
            "specific_needs": "Automated lead qualification"
        }
        return self._test_endpoint("Demo Request", url, payload)
    
    def test_lead_capture(self):
        """Test Lead Capture webhook"""
        url = f"{self.base_url}/leads/capture"
        payload = {
            "name": "Jennifer Liu",
            "email": "jliu@enterprise.com",
            "phone": "(650) 555-9876",
            "company": "Enterprise Solutions",
            "source": "LinkedIn",
            "campaign": "Q2 Outreach",
            "interest_level": "High",
            "lead_score": 85,
            "notes": "Interested in AI voice solutions"
        }
        return self._test_endpoint("Lead Capture", url, payload)
    
    def test_sales_order_live(self):
        """Test Sales Order Live webhook"""
        url = f"{self.base_url}/orders/live"
        payload = {
            "order_id": "ORD-2024-001",
            "client_name": "TechFlow Inc",
            "client_email": "orders@techflow.com",
            "product": "YoBot Pro",
            "quantity": 3,
            "unit_price": 2500,
            "total_amount": 7500,
            "payment_method": "Credit Card",
            "order_status": "Confirmed",
            "delivery_date": "2024-06-20"
        }
        return self._test_endpoint("Sales Order Live", url, payload)
    
    def test_sales_order_test(self):
        """Test Sales Order Test webhook"""
        url = f"{self.base_url}/orders/test"
        payload = {
            "order_id": "TEST-2024-001",
            "client_name": "Test Client",
            "client_email": "test@example.com",
            "product": "YoBot Demo",
            "quantity": 1,
            "unit_price": 0,
            "total_amount": 0,
            "payment_method": "Test",
            "order_status": "Test Order",
            "delivery_date": "2024-06-01"
        }
        return self._test_endpoint("Sales Order Test", url, payload)
    
    def test_awarded_project(self):
        """Test Awarded Project webhook"""
        url = f"{self.base_url}/projects/awarded"
        payload = {
            "project_name": "Enterprise Voice Automation",
            "client_name": "Global Corp",
            "client_email": "pm@globalcorp.com",
            "project_value": 50000,
            "start_date": "2024-07-01",
            "end_date": "2024-12-31",
            "team_lead": "Alex Rodriguez",
            "scope": "Voice bot implementation with CRM integration",
            "priority": "High"
        }
        return self._test_endpoint("Awarded Project", url, payload)
    
    def test_dashboard_intake(self):
        """Test Dashboard Intake webhook"""
        url = f"{self.base_url}/intake/dashboard"
        payload = {
            "client_name": "DataVision Corp",
            "dashboard_type": "Analytics Dashboard",
            "data_sources": ["CRM", "Voice Analytics", "Lead Scoring"],
            "requirements": "Real-time lead tracking with conversion metrics",
            "requested_by": "jane.smith@datavision.com",
            "priority": "Medium",
            "deadline": "2024-06-30"
        }
        return self._test_endpoint("Dashboard Intake", url, payload)
    
    def test_smartspend_charge(self):
        """Test SmartSpend Charge webhook"""
        url = f"{self.base_url}/charges/smartspend"
        payload = {
            "client_id": "CLI-2024-045",
            "charge_amount": 350.75,
            "charge_type": "Voice Minutes",
            "billing_period": "May 2024",
            "usage_details": "2,450 voice minutes @ $0.143/min",
            "auto_charge": True,
            "next_billing_date": "2024-06-01"
        }
        return self._test_endpoint("SmartSpend Charge", url, payload)
    
    def test_feature_request(self):
        """Test Feature Request webhook"""
        url = f"{self.base_url}/features/request"
        payload = {
            "feature_name": "Advanced Voice Analytics",
            "requester_name": "Tom Wilson",
            "requester_email": "tom.w@innovate.com",
            "description": "Add sentiment analysis to voice conversations",
            "priority": "High",
            "use_case": "Better lead qualification through emotion detection",
            "expected_impact": "25% improvement in conversion rates"
        }
        return self._test_endpoint("Feature Request", url, payload)
    
    def test_contact_us(self):
        """Test Contact Us webhook"""
        url = f"{self.base_url}/contact/submit"
        payload = {
            "name": "Lisa Park",
            "email": "lisa.park@consulting.com",
            "phone": "(212) 555-4567",
            "company": "Park Consulting",
            "subject": "Partnership Inquiry",
            "message": "Interested in becoming a YoBot integration partner",
            "contact_method": "Email",
            "urgency": "Medium"
        }
        return self._test_endpoint("Contact Us", url, payload)
    
    def _test_endpoint(self, name, url, payload):
        """Test individual endpoint"""
        try:
            print(f"\n🔄 Testing {name}...")
            print(f"URL: {url}")
            print(f"Payload: {json.dumps(payload, indent=2)}")
            
            response = requests.post(url, json=payload, timeout=10)
            
            result = {
                "endpoint": name,
                "url": url,
                "status_code": response.status_code,
                "success": response.status_code == 200,
                "response_time": response.elapsed.total_seconds(),
                "response_text": response.text[:200] if response.text else "",
                "timestamp": datetime.now().isoformat()
            }
            
            if result["success"]:
                print(f"✅ {name} - SUCCESS (200)")
                print(f"Response: {result['response_text']}")
            else:
                print(f"❌ {name} - FAILED ({response.status_code})")
                print(f"Error: {result['response_text']}")
            
            self.results.append(result)
            time.sleep(1)  # Rate limiting
            return result
            
        except Exception as e:
            print(f"❌ {name} - ERROR: {str(e)}")
            error_result = {
                "endpoint": name,
                "url": url,
                "status_code": 0,
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
            self.results.append(error_result)
            return error_result
    
    def test_webhook_status(self):
        """Test webhook status endpoint"""
        url = f"{self.base_url}/webhook/status"
        try:
            response = requests.get(url, timeout=10)
            print(f"\n📊 Webhook Status: {response.status_code}")
            if response.status_code == 200:
                status_data = response.json()
                print(f"Status: {status_data.get('status', 'Unknown')}")
                print(f"Webhook Base URL: {status_data.get('webhook_base_url', 'Unknown')}")
                print(f"Airtable Table: {status_data.get('airtable_table', 'Unknown')}")
        except Exception as e:
            print(f"❌ Status check failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all webhook tests"""
        print("🚀 Starting Comprehensive Webhook Testing...")
        print("=" * 60)
        
        # Test status endpoint first
        self.test_webhook_status()
        
        # Test all webhooks
        test_methods = [
            self.test_platinum_promo,
            self.test_roi_snapshot,
            self.test_booking_form,
            self.test_demo_request,
            self.test_lead_capture,
            self.test_sales_order_live,
            self.test_sales_order_test,
            self.test_awarded_project,
            self.test_dashboard_intake,
            self.test_smartspend_charge,
            self.test_feature_request,
            self.test_contact_us
        ]
        
        for test_method in test_methods:
            test_method()
        
        self.generate_report()
    
    def generate_report(self):
        """Generate test report"""
        print("\n" + "=" * 60)
        print("📊 WEBHOOK TESTING REPORT")
        print("=" * 60)
        
        total_tests = len(self.results)
        successful_tests = sum(1 for r in self.results if r["success"])
        failed_tests = total_tests - successful_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Successful: {successful_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(successful_tests/total_tests*100):.1f}%")
        
        print("\n📝 Detailed Results:")
        for result in self.results:
            status = "✅ PASS" if result["success"] else "❌ FAIL"
            print(f"{status} {result['endpoint']} - {result.get('status_code', 'ERROR')}")
        
        # Save report to file
        report_data = {
            "summary": {
                "total_tests": total_tests,
                "successful_tests": successful_tests,
                "failed_tests": failed_tests,
                "success_rate": successful_tests/total_tests*100,
                "test_timestamp": datetime.now().isoformat()
            },
            "results": self.results
        }
        
        with open("webhook_test_report.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n💾 Report saved to webhook_test_report.json")

if __name__ == "__main__":
    tester = WebhookTester()
    tester.run_all_tests()