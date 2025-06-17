#!/usr/bin/env python3
"""
Conditional hardcoded data removal for YoBot Command Center
Only removes test data when system is in LIVE mode, preserves test mode functionality
"""

import os
import re

def conditional_purge():
    """Remove hardcoded data only for LIVE mode, preserve test mode"""
    
    command_center_path = "client/src/pages/Command-Center/command-center.tsx"
    
    if not os.path.exists(command_center_path):
        print(f"❌ File not found: {command_center_path}")
        return
    
    with open(command_center_path, 'r') as file:
        content = file.read()
    
    original_content = content
    
    # Replace hardcoded values with conditional logic based on system mode
    replacements = [
        # Replace hardcoded values with conditional rendering based on currentSystemMode
        (r'null(?=\s*</span>)', '{currentSystemMode === "test" ? "Sample Data" : null}'),
        (r'null(?=\s*</Badge>)', '{currentSystemMode === "test" ? "Active" : null}'),
        (r'null(?=\s*</div>)', '{currentSystemMode === "test" ? "85%" : null}'),
        
        # Fix any broken syntax from previous cleanup
        (r'className="bg-slate-600 text-white">\s*null\s*</Badge>', 'className={currentSystemMode === "test" ? "bg-green-600 text-white" : "bg-slate-600 text-white"}>{currentSystemMode === "test" ? "Active" : "--"}</Badge>'),
        
        # Restore conditional progress bars
        (r'width: "0%"', 'width: currentSystemMode === "test" ? "75%" : "0%"'),
        (r"width: '0%'", 'width: currentSystemMode === "test" ? "75%" : "0%"'),
    ]
    
    artifacts_fixed = 0
    
    for pattern, replacement in replacements:
        matches = re.findall(pattern, content)
        if matches:
            content = re.sub(pattern, replacement, content)
            artifacts_fixed += len(matches)
    
    # Save the cleaned content
    with open(command_center_path, 'w') as file:
        file.write(content)
    
    print(f"✅ Conditional cleanup complete. {artifacts_fixed} items made conditional.")
    print("🟢 Test mode will show sample data")
    print("🔴 Live mode will show authentic data only")

if __name__ == "__main__":
    conditional_purge()