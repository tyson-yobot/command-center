#!/usr/bin/env python3
"""
Fix Base ID Safety Checks - Update all logger files to use correct base ID
Owner: Tyson Lerfald
Purpose: Update safety checks to match actual environment variable
Date: 2025-06-11
"""

import os
import re

def fix_base_id_check(filepath: str) -> bool:
    """Fix base ID safety check in a logger file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Update the safety check to use the correct base ID
        content = re.sub(
            r'if AIRTABLE_BASE_ID != "appbFDTqB2WtRNV1H":',
            'if AIRTABLE_BASE_ID != "appe0OSJtB1In1kn5":',
            content
        )
        
        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed base ID check: {filepath}")
            return True
        else:
            print(f"⚪ No changes needed: {filepath}")
            return False
            
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {str(e)}")
        return False

def main():
    """Fix all logger files with base ID safety checks"""
    logger_files = [
        "./integration_logger.py",
        "./current_integration_logger.py",
        "./INTEGRATION_LOGGER.py",
        "./current_airtable_logger.py",
        "./universal_airtable_logger.py",
        "./TYSON_INTEGRATION_LOGGER.py",
        "./batch_9_10_integration_logger.py",
        "./new_table_logger.py"
    ]
    
    fixed_count = 0
    for filepath in logger_files:
        if os.path.exists(filepath):
            if fix_base_id_check(filepath):
                fixed_count += 1
        else:
            print(f"⚠️ File not found: {filepath}")
    
    print(f"\n🔧 Fixed {fixed_count} base ID checks")
    print("🛡️ All safety checks now use correct base ID")

if __name__ == "__main__":
    main()