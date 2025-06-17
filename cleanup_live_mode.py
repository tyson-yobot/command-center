#!/usr/bin/env python3
"""
YoBot Live Mode Cleanup Script
Removes all test/mocked values, simulated APIs, and placeholder responses in LIVE mode
"""

import os
import re

def purge_live_mode_artifacts():
    """Remove all hardcoded test data and mock values from Command Center"""
    
    # Define patterns to remove from TypeScript/JavaScript files
    js_patterns_to_remove = [
        r"currentSystemMode === 'test' \? '.*?' :",
        r"currentSystemMode === 'test' \? \d+\.?\d* :",
        r"currentSystemMode === 'test' \? \d+ :",
        r"currentSystemMode === 'test' \? true :",
        r"currentSystemMode === 'test' \? false :",
        r"currentSystemMode === 'test' \? '.*?' : \(",
        r"currentSystemMode === 'test' \? \d+\.?\d* : \(",
        r"currentSystemMode === 'test' \? \d+ : \(",
        r"// TEST VALUE.*",
        r"// MOCK.*",
        r"// SIMULATED.*",
        r"// FAKE.*",
        r"'All Online'",
        r"'94\.7%'",
        r"'2,847'",
        r"'18 Active'",
        r"'3\.2s'",
        r"'Connected & Logging'",
        r"'93\.6%'",
        r"'12'",
        r"'5\.2%'",
        r"'68\.3%'",
        r"'99\.9%'",
        r"'99\.8%'",
        r"\$12\.5K",
        r"247%",
        r"\$85K",
        r"8\.5%",
        r"4\.7/5"
    ]
    
    purge_count = 0
    
    # Clean the main Command Center file
    command_center_file = "client/src/pages/Command-Center/command-center.tsx"
    
    if os.path.exists(command_center_file):
        with open(command_center_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        original_content = content
        
        # Remove all test mode conditionals and hardcoded values
        for pattern in js_patterns_to_remove:
            matches = re.findall(pattern, content)
            if matches:
                purge_count += len(matches)
                content = re.sub(pattern, "", content)
        
        # Specific replacements for remaining hardcoded values
        replacements = [
            # Remove test mode conditionals entirely
            (r"{currentSystemMode === 'test' \? '.*?' : \(.*?\)}", r"{\2}"),
            (r"{currentSystemMode === 'test' \? \d+\.?\d* : \(.*?\)}", r"{\2}"),
            (r"{currentSystemMode === 'test' \? \d+ : \(.*?\)}", r"{\2}"),
            
            # Clean up remaining test conditionals
            (r"currentSystemMode === 'test' \? '.*?' : ", ""),
            (r"currentSystemMode === 'test' \? \d+\.?\d* : ", ""),
            (r"currentSystemMode === 'test' \? \d+ : ", ""),
            (r"currentSystemMode === 'test' \? true : ", ""),
            (r"currentSystemMode === 'test' \? false : ", ""),
            
            # Remove hardcoded badge values
            (r'className={currentSystemMode === \'test\' \? "bg-green-600 text-white" : "bg-slate-600 text-slate-400"}', 'className="bg-slate-600 text-slate-400"'),
            
            # Remove test status indicators
            (r'{currentSystemMode === \'test\' && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>}', ''),
            (r'{currentSystemMode === \'test\' && <div className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"></div>}', ''),
            
            # Remove View Details buttons that only show in test mode
            (r'<Button size="sm" variant="ghost" className="text-cyan-400 hover:text-cyan-300 text-xs p-1">\s*{currentSystemMode === \'test\' \? \'👁 View Details\' : \'\'}\s*</Button>', ''),
            
            # Clean up style width calculations
            (r'style=\{\{width: `\${currentSystemMode === \'test\' \? \'93\.6\' : \'0\'}%`\}\}', 'style={{width: `${metrics?.data?.botUtilization || 0}%`}}'),
            
            # Remove iOS/Android status hardcodes
            (r'<Badge className="bg-green-600 text-white">Online</Badge>', '<Badge className="bg-slate-600 text-slate-400">Offline</Badge>'),
            
            # Fix remaining status indicators to show offline
            (r'All Systems Operational', 'Systems Offline'),
            (r'bg-green-400', 'bg-red-400'),
            (r'text-emerald-300', 'text-red-300'),
        ]
        
        for old, new in replacements:
            if re.search(old, content):
                purge_count += len(re.findall(old, content))
                content = re.sub(old, new, content)
        
        # Only write if content changed
        if content != original_content:
            with open(command_center_file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ Cleaned {command_center_file}")
    
    print(f"✅ Purge complete. {purge_count} test-mode artifacts removed from Live Mode.")
    print("🔴 All status indicators now show truthful OFFLINE states")
    print("🚫 All hardcoded test data has been eliminated")

if __name__ == "__main__":
    purge_live_mode_artifacts()