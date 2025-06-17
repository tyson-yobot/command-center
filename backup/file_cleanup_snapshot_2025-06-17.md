# File Cleanup Snapshot - June 17, 2025

## Current Directory Structure Analysis

### Identified App Roots (Keep These):
1. **command-center** (Primary root - located in `client/src/pages/Command-Center/`)
2. **control-center** (Not found - may need creation)
3. **lead-scraper** (Not found - may need creation) 
4. **mobile** (Not found - may need creation)

### Current Root Structure:
```
├── archive/ (backup directory - keep)
├── attached_assets/ (user assets - keep)
├── backup/ (backup directory - keep)
├── client/ (command-center app root)
├── docs/ (documentation - evaluate)
├── knowledge_data/ (data files - evaluate)
├── logs/ (system logs - evaluate for cleanup)
├── memory_data/ (data files - evaluate)
├── scripts/ (utility scripts - evaluate)
├── server/ (backend for command-center)
├── shared/ (shared code)
└── Various config files
```

### Files Marked for Evaluation:
- Root level Python files (cleanup_live_mode.py, honest_logger.py, main.py)
- JSON data files at root level
- Environment files (.env, live-environment.env, test-environment.env)
- Multiple package.json and config files

### Directories for Potential Cleanup:
- logs/ (many old log files)
- node_modules/ (auto-generated)
- Various JSON files at root level

## Next Steps:
1. Backup all files to backup directory
2. Identify which files belong to which app
3. Reorganize structure to maintain only 4 app roots
4. Remove unnecessary files with user verification