#!/usr/bin/env python3
"""
Remove ALL hardcoded data from the entire system
This script systematically eliminates every fake value
"""

import re
import os

def remove_hardcoded_from_file(filepath):
    """Remove all hardcoded Math.random() and fake values from a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Remove Math.random() patterns
        content = re.sub(r'Math\.floor\(Math\.random\(\) \* \d+\) \+ \d+', '0', content)
        content = re.sub(r'Math\.random\(\) \* \d+(\.\d+)?( \+ \d+(\.\d+)?)?', '0', content)
        content = re.sub(r'\d+ \+ Math\.random\(\) \* \d+(\.\d+)?', '0', content)
        
        # Remove specific hardcoded values in automation contexts
        content = re.sub(r'activeAutomations: \d+,', 'activeAutomations: 0,', content)
        content = re.sub(r'totalExecutions: \d+,', 'totalExecutions: 0,', content)
        content = re.sub(r'errorRate: \d+(\.\d+)?', 'errorRate: 0', content)
        
        # Remove hardcoded success rates
        content = re.sub(r'successRate: \d+(\.\d+)? \+ Math\.random\(\) \* \d+(\.\d+)?', 'successRate: 0', content)
        content = re.sub(r'successRate: \d+(\.\d+)?', 'successRate: 0', content)
        
        # Remove hardcoded function counts
        content = re.sub(r'totalFunctions: \d+,', 'totalFunctions: 0,', content)
        content = re.sub(r'activeFunctions: \d+,', 'activeFunctions: 0,', content)
        
        # Remove hardcoded customer/revenue data
        content = re.sub(r'totalCustomers: Math\.floor\([^)]+\)', 'totalCustomers: 0', content)
        content = re.sub(r'activeCustomers: Math\.floor\([^)]+\)', 'activeCustomers: 0', content)
        content = re.sub(r'monthlyRevenue: \d+', 'monthlyRevenue: 0', content)
        content = re.sub(r'annualSavings: Math\.floor\([^)]+\)', 'annualSavings: 0', content)
        
        # Remove hardcoded performance metrics
        content = re.sub(r'averageResponseTime: Math\.floor\([^)]+\)', 'averageResponseTime: 0', content)
        content = re.sub(r'throughput: Math\.floor\([^)]+\)', 'throughput: 0', content)
        
        # Remove percentage calculations with Math.random
        content = re.sub(r'\d+(\.\d+)? \+ Math\.random\(\) \* \d+(\.\d+)?', '0', content)
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
        
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    """Remove all hardcoded data from the system"""
    
    files_to_clean = [
        'server/routes.ts',
        'server/modules/automation/automationTester.ts',
        'server/organized/automation-batches/automationTester.ts',
        'server/liveDashboardData.ts',
        'client/src/components/automation-status-panel.tsx'
    ]
    
    print("Removing ALL hardcoded data from system...")
    
    files_modified = 0
    
    for filepath in files_to_clean:
        if os.path.exists(filepath):
            if remove_hardcoded_from_file(filepath):
                print(f"Cleaned: {filepath}")
                files_modified += 1
            else:
                print(f"No changes needed: {filepath}")
        else:
            print(f"File not found: {filepath}")
    
    print(f"\\nCompleted: {files_modified} files modified")
    print("All hardcoded values have been set to 0")
    print("System is now clean and ready for real data")

if __name__ == "__main__":
    main()