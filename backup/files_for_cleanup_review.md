# Files Marked for Cleanup Review

## Temporary/Log Files (26 files identified)
- daily_report_2025-06-16.json
- daily_report_2025-06-17.json  
- post_capture_1750008699736.json (and 23 similar files)

## Utility Scripts at Root Level
- cleanup_live_mode.py (utility for live mode cleanup)
- honest_logger.py (logging utility)
- main.py (unclear purpose - needs review)

## Environment Files
- .env (main config)
- live-environment.env 
- test-environment.env

## System/Log Files
- system_automation_log.json

## Directories to Review
- logs/ (contains many old automation logs)
- memory_data/ (small data files)
- knowledge_data/ (knowledge base data)

## Files to KEEP (Critical)
- All files in client/, server/, shared/ 
- package.json, vite.config.ts, drizzle.config.ts
- backup/, archive/, attached_assets/
- docs/

Ready to proceed with cleanup after user confirmation.