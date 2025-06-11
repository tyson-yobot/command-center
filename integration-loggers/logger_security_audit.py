#!/usr/bin/env python3
"""
Logger Security Audit - Detect Unauthorized Logger Modifications
Owner: Tyson Lerfald
Purpose: Verify all logger files use authorized locked configuration
Date: 2025-06-11

This script scans all Python files for unauthorized logger modifications and tampering.
"""

import os
import re
from typing import List, Dict

class LoggerSecurityAudit:
    def __init__(self):
        self.authorized_base_id = "appbFDTqB2WtRNV1H"
        self.authorized_table_id = "tbl7K5RthCtD69BE1"
        self.violations = []
        
    def scan_file(self, filepath: str) -> Dict:
        """Scan a single file for logger violations"""
        violations = []
        
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Check for hardcoded base IDs
            unauthorized_bases = re.findall(r'base_id\s*=\s*["\']([^"\']+)["\']', content)
            for base in unauthorized_bases:
                if base != self.authorized_base_id:
                    violations.append(f"❌ UNAUTHORIZED BASE ID: {base}")
                    
            # Check for hardcoded table IDs  
            unauthorized_tables = re.findall(r'table_id\s*=\s*["\']([^"\']+)["\']', content)
            for table in unauthorized_tables:
                if table != self.authorized_table_id:
                    violations.append(f"❌ UNAUTHORIZED TABLE ID: {table}")
                    
            # Check for hardcoded passed=True
            fake_passes = re.findall(r'passed\s*=\s*True', content)
            if fake_passes:
                violations.append(f"🚨 HARDCODED PASS VALUES: {len(fake_passes)} instances")
                
            # Check for missing logger_config import
            if 'log_integration_test_to_airtable' in content:
                if 'from logger_config import' not in content:
                    violations.append(f"❌ MISSING LOCKED CONFIG IMPORT")
                    
            # Check for missing Logger Source field
            if 'log_integration_test_to_airtable' in content:
                if '🛡️ Logger Source' not in content:
                    violations.append(f"❌ MISSING LOGGER WATCHDOG FIELD")
                    
            return {
                'file': filepath,
                'violations': violations,
                'status': 'SECURE' if not violations else 'COMPROMISED'
            }
            
        except Exception as e:
            return {
                'file': filepath,
                'violations': [f"ERROR: Could not scan file - {str(e)}"],
                'status': 'ERROR'
            }
    
    def audit_all_loggers(self) -> Dict:
        """Audit all Python files in the workspace"""
        results = {
            'secure_files': [],
            'compromised_files': [],
            'error_files': [],
            'summary': {}
        }
        
        # Get all Python files
        python_files = []
        for root, dirs, files in os.walk('.'):
            for file in files:
                if file.endswith('.py') and 'logger' in file.lower():
                    python_files.append(os.path.join(root, file))
                    
        print(f"🔍 Scanning {len(python_files)} logger files...")
        
        for filepath in python_files:
            result = self.scan_file(filepath)
            
            if result['status'] == 'SECURE':
                results['secure_files'].append(result)
            elif result['status'] == 'COMPROMISED':
                results['compromised_files'].append(result)
            else:
                results['error_files'].append(result)
                
        # Generate summary
        total_files = len(python_files)
        secure_count = len(results['secure_files'])
        compromised_count = len(results['compromised_files'])
        error_count = len(results['error_files'])
        
        results['summary'] = {
            'total_files': total_files,
            'secure_files': secure_count,
            'compromised_files': compromised_count,
            'error_files': error_count,
            'security_score': (secure_count / total_files * 100) if total_files > 0 else 0
        }
        
        return results
    
    def generate_report(self, results: Dict) -> str:
        """Generate a security audit report"""
        report = []
        report.append("=" * 60)
        report.append("🛡️ LOGGER SECURITY AUDIT REPORT")
        report.append("=" * 60)
        report.append(f"📊 SUMMARY:")
        report.append(f"   Total Files Scanned: {results['summary']['total_files']}")
        report.append(f"   ✅ Secure Files: {results['summary']['secure_files']}")
        report.append(f"   ❌ Compromised Files: {results['summary']['compromised_files']}")
        report.append(f"   ⚠️ Error Files: {results['summary']['error_files']}")
        report.append(f"   🔒 Security Score: {results['summary']['security_score']:.1f}%")
        report.append("")
        
        if results['compromised_files']:
            report.append("🚨 COMPROMISED FILES:")
            for file_result in results['compromised_files']:
                report.append(f"   📁 {file_result['file']}")
                for violation in file_result['violations']:
                    report.append(f"      {violation}")
                report.append("")
                
        if results['secure_files']:
            report.append("✅ SECURE FILES:")
            for file_result in results['secure_files']:
                report.append(f"   📁 {file_result['file']}")
                
        report.append("=" * 60)
        return "\n".join(report)

def main():
    """Run the logger security audit"""
    auditor = LoggerSecurityAudit()
    results = auditor.audit_all_loggers()
    report = auditor.generate_report(results)
    
    print(report)
    
    # Save report to file
    with open('logger_security_audit_report.txt', 'w') as f:
        f.write(report)
        
    print(f"\n📄 Report saved to: logger_security_audit_report.txt")
    
    # Return exit code based on security status
    if results['summary']['compromised_files'] > 0:
        print("\n🚨 SECURITY VIOLATIONS DETECTED - IMMEDIATE ACTION REQUIRED")
        return 1
    else:
        print("\n✅ ALL LOGGER FILES SECURE")
        return 0

if __name__ == "__main__":
    exit(main())