# File Cleanup and Directory Reorganization Plan

## Current Assessment
✓ Command Center app is fully operational
✓ Backend services running successfully  
✓ Live production system active

## Target Structure (4 App Roots Only)
1. **command-center** (Primary - already exists in client/)
2. **control-center** (To be created)
3. **lead-scraper** (To be created) 
4. **mobile** (To be created)

## Files to Evaluate for Cleanup

### Root Level Files (Candidates for removal/organization):
- cleanup_live_mode.py (utility script)
- honest_logger.py (utility script)
- main.py (unclear purpose)
- daily_report_*.json (old reports)
- post_capture_*.json (temporary files)
- various .env files (consolidate)

### Directories for Review:
- logs/ (contains many old log files)
- memory_data/ (small data files)
- knowledge_data/ (data files)
- scripts/ (if exists, utility scripts)

### Keep These (Critical):
- client/ (command-center app)
- server/ (backend)
- shared/ (shared code)
- backup/ (backups)
- archive/ (archives)
- attached_assets/ (user assets)
- docs/ (documentation)
- node_modules/ (dependencies)
- Config files (package.json, vite.config.ts, etc.)

## Execution Strategy
1. Create comprehensive backup
2. Identify and categorize all files
3. Create missing app directories
4. Move/organize files appropriately
5. Remove confirmed unnecessary files
6. Test application integrity