#!/usr/bin/env python3
"""
Comprehensive Automation Test Runner
Owner: Tyson Lerfald
Purpose: Test all 40 automation functions systematically and log to Airtable
Date: 2025-06-10

This script tests each automation function, validates responses, and logs results
to Airtable with patch updates (no duplicates) using the field "🔧 Integration Name"
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional
import os
import sys

class ComprehensiveTestRunner:
    def __init__(self):
        # Airtable configuration
        self.airtable_base_id = "appJF9a12yNO0fQcz"
        self.airtable_table_id = "tblgJDzPc3Al1MVyb"
        self.airtable_token = os.getenv('AIRTABLE_TOKEN', 'paty41tSgNrAPUQZVLo1sHRVdqJF6T7qwVHZD0eMg8I83f1vSJ')
        
        # Base API URL
        self.base_url = "http://localhost:5000"
        
        # Test results storage
        self.test_results = []
        self.function_definitions = []
        
        # Load existing Airtable records to prevent duplicates
        self.existing_records = {}
        self.load_existing_records()
        
        print(f"🚀 Comprehensive Test Runner initialized")
        print(f"📊 Found {len(self.existing_records)} existing test records")

    def load_existing_records(self):
        """Load existing test records from Airtable to prevent duplicates"""
        try:
            url = f"https://api.airtable.com/v0/{self.airtable_base_id}/{self.airtable_table_id}"
            headers = {
                "Authorization": f"Bearer {self.airtable_token}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                for record in data.get('records', []):
                    integration_name = record['fields'].get('🔧 Integration Name', '')
                    if integration_name:
                        # Extract function name from integration name field
                        function_name = integration_name.split(' | ')[0] if ' | ' in integration_name else integration_name
                        self.existing_records[function_name] = record['id']
                        
                print(f"📋 Loaded {len(self.existing_records)} existing records")
            else:
                print(f"⚠️  Could not load existing records: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error loading existing records: {e}")

    def get_automation_status(self) -> Dict:
        """Get current automation system status"""
        try:
            response = requests.get(f"{self.base_url}/api/automation/status")
            if response.status_code == 200:
                return response.json()
            else:
                print(f"❌ Failed to get automation status: {response.status_code}")
                return {}
        except Exception as e:
            print(f"❌ Error getting automation status: {e}")
            return {}

    def test_function(self, function_id: int, function_name: str, endpoint: str, batch: int, category: str) -> Dict:
        """Test a single automation function"""
        test_start = time.time()
        
        try:
            # Make POST request to function endpoint
            test_data = {
                "test_mode": True,
                "validate_only": True,
                "function_id": function_id
            }
            
            response = requests.post(f"{self.base_url}{endpoint}", json=test_data, timeout=30)
            
            test_duration = int((time.time() - test_start) * 1000)  # Convert to milliseconds
            
            # Determine test result
            if response.status_code == 200:
                response_data = response.json()
                success = response_data.get('success', False)
                status = "PASS" if success else "FAIL"
                error_message = response_data.get('error', '') if not success else ""
            else:
                status = "FAIL"
                error_message = f"HTTP {response.status_code}: {response.text[:100]}"
            
            result = {
                "function_id": function_id,
                "function_name": function_name,
                "endpoint": endpoint,
                "batch": batch,
                "category": category,
                "status": status,
                "duration_ms": test_duration,
                "error_message": error_message,
                "timestamp": datetime.now().isoformat(),
                "response_code": response.status_code
            }
            
            print(f"{'✅' if status == 'PASS' else '❌'} Function {function_id} - {function_name}: {status} ({test_duration}ms)")
            
            return result
            
        except Exception as e:
            test_duration = int((time.time() - test_start) * 1000)
            result = {
                "function_id": function_id,
                "function_name": function_name,
                "endpoint": endpoint,
                "batch": batch,
                "category": category,
                "status": "ERROR",
                "duration_ms": test_duration,
                "error_message": str(e),
                "timestamp": datetime.now().isoformat(),
                "response_code": 0
            }
            
            print(f"💥 Function {function_id} - {function_name}: ERROR ({str(e)[:50]})")
            return result

    def log_to_airtable(self, test_result: Dict) -> bool:
        """Log test result to Airtable using patch system to prevent duplicates"""
        try:
            function_name = test_result['function_name']
            
            # Create integration name field content
            integration_data = (
                f"{function_name} | "
                f"Batch {test_result['batch']} | "
                f"{test_result['category']} | "
                f"Status: {test_result['status']} | "
                f"Duration: {test_result['duration_ms']}ms | "
                f"Tested: {test_result['timestamp'][:19]} | "
                f"Response: {test_result['response_code']}"
            )
            
            if test_result['error_message']:
                integration_data += f" | Error: {test_result['error_message'][:100]}"
            
            headers = {
                "Authorization": f"Bearer {self.airtable_token}",
                "Content-Type": "application/json"
            }
            
            # Check if record exists (patch) or create new
            if function_name in self.existing_records:
                # PATCH existing record
                record_id = self.existing_records[function_name]
                url = f"https://api.airtable.com/v0/{self.airtable_base_id}/{self.airtable_table_id}/{record_id}"
                
                data = {
                    "fields": {
                        "🔧 Integration Name": integration_data
                    }
                }
                
                response = requests.patch(url, headers=headers, json=data)
                action = "UPDATED"
            else:
                # POST new record
                url = f"https://api.airtable.com/v0/{self.airtable_base_id}/{self.airtable_table_id}"
                
                data = {
                    "fields": {
                        "🔧 Integration Name": integration_data
                    }
                }
                
                response = requests.post(url, headers=headers, json=data)
                action = "CREATED"
                
                # Store new record ID for future patches
                if response.status_code == 200:
                    record_data = response.json()
                    self.existing_records[function_name] = record_data['id']
            
            if response.status_code == 200:
                print(f"📝 {action} Airtable record for {function_name}")
                return True
            else:
                print(f"❌ Failed to log to Airtable: {response.status_code} - {response.text[:100]}")
                return False
                
        except Exception as e:
            print(f"❌ Error logging to Airtable: {e}")
            return False

    def send_slack_notification(self, summary: Dict) -> bool:
        """Send test summary to Slack"""
        try:
            # Use existing Slack integration
            slack_data = {
                "text": f"🤖 Automation Test Summary - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                "attachments": [
                    {
                        "color": "good" if summary['pass_rate'] > 80 else "warning" if summary['pass_rate'] > 60 else "danger",
                        "fields": [
                            {"title": "Total Functions Tested", "value": str(summary['total_tested']), "short": True},
                            {"title": "Passed", "value": str(summary['passed']), "short": True},
                            {"title": "Failed", "value": str(summary['failed']), "short": True},
                            {"title": "Pass Rate", "value": f"{summary['pass_rate']:.1f}%", "short": True},
                            {"title": "Average Duration", "value": f"{summary['avg_duration']}ms", "short": True},
                            {"title": "Test Duration", "value": f"{summary['total_duration']:.1f}s", "short": True}
                        ]
                    }
                ]
            }
            
            # Send via webhook or Slack API
            webhook_url = os.getenv('SLACK_WEBHOOK_URL', 'https://hooks.slack.com/services/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')
            response = requests.post(webhook_url, json=slack_data)
            
            if response.status_code == 200:
                print("📢 Slack notification sent successfully")
                return True
            else:
                print(f"❌ Failed to send Slack notification: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error sending Slack notification: {e}")
            return False

    def run_comprehensive_test(self):
        """Run comprehensive test of all automation functions"""
        print("\n🚀 Starting Comprehensive Automation Test Suite")
        print("=" * 60)
        
        # Get current automation status
        automation_status = self.get_automation_status()
        if not automation_status:
            print("❌ Could not connect to automation system")
            return
        
        functions = automation_status.get('functions', [])
        if not functions:
            print("❌ No automation functions found")
            return
        
        print(f"📊 Found {len(functions)} automation functions to test")
        test_start_time = time.time()
        
        # Test each function
        for function in functions:
            test_result = self.test_function(
                function['id'],
                function['name'],
                function['endpoint'],
                function['batch'],
                function['category']
            )
            
            self.test_results.append(test_result)
            
            # Log to Airtable immediately
            self.log_to_airtable(test_result)
            
            # Small delay to prevent overwhelming the system
            time.sleep(0.5)
        
        # Calculate summary
        total_duration = time.time() - test_start_time
        passed = len([r for r in self.test_results if r['status'] == 'PASS'])
        failed = len([r for r in self.test_results if r['status'] in ['FAIL', 'ERROR']])
        total_tested = len(self.test_results)
        pass_rate = (passed / total_tested * 100) if total_tested > 0 else 0
        avg_duration = sum(r['duration_ms'] for r in self.test_results) / total_tested if total_tested > 0 else 0
        
        summary = {
            'total_tested': total_tested,
            'passed': passed,
            'failed': failed,
            'pass_rate': pass_rate,
            'avg_duration': int(avg_duration),
            'total_duration': total_duration
        }
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)
        print(f"Total Functions Tested: {total_tested}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Pass Rate: {pass_rate:.1f}%")
        print(f"⏱️  Average Duration: {avg_duration:.0f}ms")
        print(f"🕐 Total Test Duration: {total_duration:.1f}s")
        print("=" * 60)
        
        # Send Slack notification
        self.send_slack_notification(summary)
        
        # Save detailed results
        self.save_test_results(summary)
        
        return summary

    def save_test_results(self, summary: Dict):
        """Save detailed test results to local file"""
        results_data = {
            'test_run_id': datetime.now().strftime('%Y%m%d_%H%M%S'),
            'timestamp': datetime.now().isoformat(),
            'summary': summary,
            'detailed_results': self.test_results
        }
        
        filename = f"test_results_{results_data['test_run_id']}.json"
        with open(filename, 'w') as f:
            json.dump(results_data, f, indent=2)
        
        print(f"💾 Detailed results saved to: {filename}")

def main():
    """Main execution function"""
    print("🤖 YoBot Comprehensive Automation Test Runner")
    print("Owner: Tyson Lerfald")
    print("=" * 60)
    
    runner = ComprehensiveTestRunner()
    summary = runner.run_comprehensive_test()
    
    if summary:
        exit_code = 0 if summary['pass_rate'] > 80 else 1
        print(f"\n🏁 Test run completed with exit code: {exit_code}")
        sys.exit(exit_code)
    else:
        print("\n💥 Test run failed to complete")
        sys.exit(1)

if __name__ == "__main__":
    main()