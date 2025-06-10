#!/usr/bin/env python3
"""
Master Test Runner Script
Purpose: Systematically test all 1040+ automation functions
Owner: Tyson Lerfald
Date: 2025-06-10

This script loops through all automation functions, tests them, and logs results
to Airtable with comprehensive validation tracking.
"""

import requests
import json
import time
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('test_runner.log'),
        logging.StreamHandler()
    ]
)

class AutomationTestRunner:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.session = requests.Session()
        self.test_results = []
        self.failed_functions = []
        self.passed_functions = []
        
        # Function categories and their ranges
        self.function_batches = {
            "Core Functions": range(1, 50),
            "Integration Functions": range(51, 100),
            "API Functions": range(101, 200),
            "Batch 22": range(211, 221),
            "Batch 23": range(221, 231),
            "Batch 24": range(241, 251),
            "Batch 25": range(251, 261),
            "Batch 26": range(261, 271),
            "Batch 27": range(271, 281),
            "Batch 28": range(281, 331),
            "Batch 29": range(331, 531),
            "Batch 30": range(531, 1041),
            "Central Automation": range(601, 1041)
        }
        
        # High priority functions to test first
        self.high_priority_functions = [
            "Intake Form Validator",
            "QA Failure Alert",
            "Live Error Push", 
            "Customer Reconciliation",
            "Full API Health Check",
            "Manual Override Logger",
            "VoiceBot Escalation Detection",
            "System Health Metric Update",
            "Google Drive Backup",
            "New Lead Notification",
            "Duplicate Record Detection",
            "Lead Score Calculator"
        ]

    def test_system_health(self) -> bool:
        """Test if the automation system is responsive"""
        try:
            response = self.session.get(f"{self.base_url}/api/system-mode", timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get('success', False) and data.get('systemMode') == 'live'
            return False
        except Exception as e:
            logging.error(f"System health check failed: {e}")
            return False

    def test_function(self, function_name: str, function_id: Optional[int] = None) -> Dict:
        """Test a single automation function"""
        test_start = time.time()
        
        try:
            # Try multiple endpoints for function testing
            endpoints_to_try = [
                f"/api/automation/function/{function_id}" if function_id else None,
                f"/api/automation/{function_name.lower().replace(' ', '-')}",
                f"/api/functions/{function_name.lower().replace(' ', '_')}",
                f"/api/test/validate/{function_name.lower().replace(' ', '-')}"
            ]
            
            # Filter out None values
            endpoints_to_try = [ep for ep in endpoints_to_try if ep]
            
            for endpoint in endpoints_to_try:
                try:
                    response = self.session.post(f"{self.base_url}{endpoint}", 
                                               json={"test": True, "validate": True}, 
                                               timeout=30)
                    
                    if response.status_code == 200:
                        execution_time = time.time() - test_start
                        return {
                            "functionName": function_name,
                            "passed": True,
                            "notes": f"Function executed successfully via {endpoint}",
                            "executionTime": round(execution_time, 3),
                            "endpoint": endpoint,
                            "response": response.json() if response.content else {}
                        }
                        
                except requests.exceptions.Timeout:
                    logging.warning(f"Timeout testing {function_name} at {endpoint}")
                    continue
                except requests.exceptions.RequestException as e:
                    logging.warning(f"Request failed for {function_name} at {endpoint}: {e}")
                    continue
            
            # If all endpoints failed, mark as failed
            execution_time = time.time() - test_start
            return {
                "functionName": function_name,
                "passed": False,
                "notes": f"All endpoints failed - function may not be implemented or accessible",
                "executionTime": round(execution_time, 3),
                "error": "No accessible endpoint found"
            }
            
        except Exception as e:
            execution_time = time.time() - test_start
            return {
                "functionName": function_name,
                "passed": False,
                "notes": f"Test execution failed: {str(e)}",
                "executionTime": round(execution_time, 3),
                "error": str(e)
            }

    def log_test_result(self, result: Dict) -> bool:
        """Log test result to the system"""
        try:
            response = self.session.post(f"{self.base_url}/api/test/test-function", 
                                       json=result, 
                                       timeout=10)
            return response.status_code == 200
        except Exception as e:
            logging.error(f"Failed to log result for {result.get('functionName')}: {e}")
            return False

    def test_high_priority_functions(self):
        """Test high priority functions first"""
        logging.info("🚀 Testing high priority functions...")
        
        for function_name in self.high_priority_functions:
            logging.info(f"Testing high priority function: {function_name}")
            result = self.test_function(function_name)
            
            if self.log_test_result(result):
                if result['passed']:
                    self.passed_functions.append(function_name)
                    logging.info(f"✅ {function_name} - PASSED")
                else:
                    self.failed_functions.append(function_name)
                    logging.error(f"❌ {function_name} - FAILED: {result.get('error', 'Unknown error')}")
            
            self.test_results.append(result)
            time.sleep(0.5)  # Small delay between tests

    def test_function_batches(self):
        """Test all function batches systematically"""
        logging.info("🔄 Testing function batches...")
        
        for batch_name, function_range in self.function_batches.items():
            logging.info(f"Testing {batch_name} (Functions {min(function_range)}-{max(function_range)})")
            
            for function_id in function_range:
                function_name = f"Function {function_id}"
                
                # Skip if already tested in high priority
                if function_name in [f"Function {i}" for i in range(1, 13)]:
                    continue
                
                result = self.test_function(function_name, function_id)
                
                if self.log_test_result(result):
                    if result['passed']:
                        self.passed_functions.append(function_name)
                    else:
                        self.failed_functions.append(function_name)
                
                self.test_results.append(result)
                
                # Progress logging every 10 functions
                if function_id % 10 == 0:
                    logging.info(f"Progress: Tested {len(self.test_results)} functions")
                
                time.sleep(0.2)  # Small delay between tests

    def test_specific_integrations(self):
        """Test specific integration functions"""
        integration_functions = [
            "Stripe Webhook Handler",
            "Slack Integration",
            "Airtable Sync",
            "Mailchimp Integration", 
            "Google Drive Integration",
            "SendGrid Email",
            "Twilio SMS",
            "OpenAI Integration",
            "ElevenLabs Voice",
            "Notion Integration"
        ]
        
        logging.info("🔌 Testing specific integrations...")
        
        for function_name in integration_functions:
            result = self.test_function(function_name)
            
            if self.log_test_result(result):
                if result['passed']:
                    self.passed_functions.append(function_name)
                else:
                    self.failed_functions.append(function_name)
            
            self.test_results.append(result)
            time.sleep(0.5)

    def generate_test_summary(self):
        """Generate comprehensive test summary"""
        total_tests = len(self.test_results)
        passed_count = len(self.passed_functions)
        failed_count = len(self.failed_functions)
        
        summary = {
            "timestamp": datetime.now().isoformat(),
            "total_functions_tested": total_tests,
            "passed": passed_count,
            "failed": failed_count,
            "success_rate": round((passed_count / total_tests * 100), 2) if total_tests > 0 else 0,
            "failed_functions": self.failed_functions[:10],  # Top 10 failures
            "test_duration": time.time() - self.start_time
        }
        
        # Log summary to test endpoint
        try:
            self.session.post(f"{self.base_url}/api/test/test-summary", 
                            json=summary, 
                            timeout=10)
        except Exception as e:
            logging.error(f"Failed to log test summary: {e}")
        
        return summary

    def run_complete_test_suite(self):
        """Execute the complete test suite"""
        self.start_time = time.time()
        
        logging.info("🤖 Starting Complete Automation Test Suite")
        logging.info("=" * 60)
        
        # Check system health first
        if not self.test_system_health():
            logging.error("❌ System health check failed - aborting test suite")
            return False
        
        logging.info("✅ System health check passed")
        
        try:
            # Test high priority functions first
            self.test_high_priority_functions()
            
            # Test all function batches
            self.test_function_batches()
            
            # Test specific integrations
            self.test_specific_integrations()
            
            # Generate final summary
            summary = self.generate_test_summary()
            
            logging.info("=" * 60)
            logging.info("📊 TEST SUITE COMPLETED")
            logging.info(f"Total Functions Tested: {summary['total_functions_tested']}")
            logging.info(f"Passed: {summary['passed']}")
            logging.info(f"Failed: {summary['failed']}")
            logging.info(f"Success Rate: {summary['success_rate']}%")
            logging.info(f"Duration: {summary['test_duration']:.2f} seconds")
            
            if summary['failed'] > 0:
                logging.warning("❌ Some functions failed:")
                for failed_func in summary['failed_functions']:
                    logging.warning(f"  - {failed_func}")
            
            return True
            
        except Exception as e:
            logging.error(f"Test suite failed with error: {e}")
            return False

if __name__ == "__main__":
    runner = AutomationTestRunner()
    success = runner.run_complete_test_suite()
    
    if success:
        print("✅ Test suite completed successfully")
    else:
        print("❌ Test suite failed")
        exit(1)