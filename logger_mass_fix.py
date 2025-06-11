#!/usr/bin/env python3
"""
Logger Mass Fix - Fix All Compromised Logger Files
Owner: Tyson Lerfald
Purpose: Automatically fix all compromised logger files with locked configuration
Date: 2025-06-11
"""

import os
import re

def fix_logger_file(filepath: str) -> bool:
    """Fix a single logger file to use locked configuration"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # Replace hardcoded base IDs
        content = re.sub(
            r'base_id\s*=\s*["\'][^"\']+["\']',
            'base_id = AIRTABLE_BASE_ID',
            content
        )
        
        # Replace hardcoded table IDs
        content = re.sub(
            r'table_id\s*=\s*["\'][^"\']+["\']',
            'table_id = AIRTABLE_TABLE_ID',
            content
        )
        
        # Replace hardcoded API keys
        content = re.sub(
            r'airtable_api_key\s*=\s*["\'][^"\']+["\']',
            'airtable_api_key = AIRTABLE_API_KEY',
            content
        )
        
        # Add locked config import if logging function exists
        if 'log_integration_test_to_airtable' in content and 'from logger_config import' not in content:
            # Find the function definition
            func_match = re.search(r'def log_integration_test_to_airtable\([^)]*\):', content)
            if func_match:
                # Add import and safety check after function definition
                insert_pos = func_match.end()
                insert_text = '''
    # LOCKED AIRTABLE CONFIGURATION - ADMIN AUTHORIZED ONLY
    from logger_config import AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_ID
    
    # Safety check to prevent base mismatches
    if AIRTABLE_BASE_ID != "appbFDTqB2WtRNV1H":
        raise Exception("❌ Invalid Airtable Base ID in use – logger misconfigured.")
    
'''
                content = content[:insert_pos] + insert_text + content[insert_pos:]
        
        # Add Logger Watchdog field to payload
        if 'log_integration_test_to_airtable' in content and '🛡️ Logger Source' not in content:
            # Find payload fields
            payload_match = re.search(r'"fields":\s*{([^}]*)}', content, re.DOTALL)
            if payload_match:
                fields_content = payload_match.group(1)
                if '"🔧 Integration Name"' in fields_content:
                    # Add Logger Watchdog field
                    new_fields = fields_content.rstrip().rstrip(',') + ',\n            "🛡️ Logger Source": "🧠 AI Locked Logger v1.0"'
                    content = content.replace(payload_match.group(1), new_fields)
        
        # Remove hardcoded passed=True values
        content = re.sub(
            r'passed\s*=\s*True(?!\s*[,)])',
            'passed=test_result',
            content
        )
        
        # Only write if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {filepath}")
            return True
        else:
            print(f"⚪ No changes needed: {filepath}")
            return False
            
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {str(e)}")
        return False

def main():
    """Fix all compromised logger files"""
    compromised_files = [
        "./new_table_logger.py",
        "./batch_9_10_integration_logger.py", 
        "./batch_9_19_standardized_logger.py",
        "./integration_logger.py",
        "./current_integration_logger.py",
        "./INTEGRATION_LOGGER.py",
        "./current_airtable_logger.py",
        "./universal_airtable_logger.py",
        "./TYSON_INTEGRATION_LOGGER.py"
    ]
    
    fixed_count = 0
    for filepath in compromised_files:
        if os.path.exists(filepath):
            if fix_logger_file(filepath):
                fixed_count += 1
        else:
            print(f"⚠️ File not found: {filepath}")
    
    print(f"\n🔧 Fixed {fixed_count} logger files")
    print("🛡️ All logger files now use locked configuration")

if __name__ == "__main__":
    main()