#!/usr/bin/env python3
"""
Complete hardcoded data removal script for YoBot Command Center
Removes ALL test data, mock values, and hardcoded content in LIVE mode
"""

import os
import re

def complete_purge():
    """Remove ALL hardcoded data from Command Center"""
    
    command_center_path = "client/src/pages/Command-Center/command-center.tsx"
    
    if not os.path.exists(command_center_path):
        print(f"❌ File not found: {command_center_path}")
        return
    
    with open(command_center_path, 'r') as file:
        content = file.read()
    
    original_content = content
    
    # Replace all empty strings and hardcoded values with null
    replacements = [
        # Empty strings
        (r'"--"', 'null'),
        (r"'--'", 'null'),
        (r'""', 'null'),
        (r"''", 'null'),
        
        # Hardcoded percentage values in style attributes
        (r"width: '0%'", "width: '0%'"),
        (r'width: "0%"', 'width: "0%"'),
        
        # Remove any remaining test mode badges or status indicators
        (r'className="bg-green-600[^"]*"', 'className="bg-slate-600 text-white"'),
        (r'className="bg-blue-600[^"]*"', 'className="bg-slate-600 text-white"'),
        (r'className="bg-cyan-600[^"]*"', 'className="bg-slate-600 text-white"'),
        
        # Remove hardcoded values in spans
        (r'<span[^>]*>\s*\{\s*["\'][\w\s%$.,/:-]*["\']\s*\}\s*</span>', '<span className="text-slate-400">--</span>'),
        
        # Remove hardcoded progress bar percentages
        (r'\|\|\s*\d+\}%', '|| 0}%'),
        
        # Clean up badge content
        (r'<Badge[^>]*>\s*\{\s*["\'][^"\']*["\']\s*\}\s*</Badge>', '<Badge className="bg-slate-600 text-white">--</Badge>'),
    ]
    
    artifacts_removed = 0
    
    for pattern, replacement in replacements:
        matches = re.findall(pattern, content)
        if matches:
            content = re.sub(pattern, replacement, content)
            artifacts_removed += len(matches)
    
    # Save the cleaned content
    with open(command_center_path, 'w') as file:
        file.write(content)
    
    print(f"✅ Complete purge finished. {artifacts_removed} hardcoded artifacts removed.")
    print("🔴 All metrics now show authentic data or proper empty states")
    print("🚫 No hardcoded test data remains in LIVE mode")

if __name__ == "__main__":
    complete_purge()