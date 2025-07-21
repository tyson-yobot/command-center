#!/usr/bin/env python
"""
reorganize.py - Script to reorganize the YoBot Command Center file structure

This script implements the reorganization plan outlined in REORGANIZATION_PLAN.md.
It creates the new directory structure and moves files to their appropriate locations.

Usage:
    python reorganize.py

Note: This script should be run from the root of the command-center directory.
"""
import os
import shutil
import re
from pathlib import Path

# Define the root directory
ROOT_DIR = Path(os.path.dirname(os.path.abspath(__file__)))

# Define the new directory structure
NEW_STRUCTURE = {
    "assets": {
        "images": {},
        "docs": {},
    },
    "server": {
        "api": {
            "auth": {},
            "quotes": {},
            "crm": {},
            "lead_scraper": {},
            "webhooks": {},
        },
        "core": {},
        "integrations": {
            "airtable": {},
            "slack": {},
            "quickbooks": {},
            "docusign": {},
            "google_drive": {},
        },
        "modules": {
            "quotes": {},
            "sales": {},
            "voice": {},
            "rag": {},
        },
        "utils": {},
    },
    "scripts": {
        "migrations": {},
    },
    "tests": {
        "unit": {},
        "integration": {},
        "e2e": {},
    },
    "docs": {},
}

# Define file mappings (source -> destination)
FILE_MAPPINGS = {
    # Server Python files
    "server/function_library.py": "server/utils/function_library.py",
    "server/function_library_full_cleaned.py": "server/utils/function_library_full.py",
    "server/auth.py": "server/core/auth.py",
    "server/app.py": "server/app.py",
    "server/routes/generate_quote.py": "server/api/quotes/generate_quote.py",
    "server/modules/sales_order.py": "server/modules/sales/sales_order.py",
    
    # Duplicate files to consolidate
    "routers/rag_router.py": "server/api/rag/rag_router.py",
    "backend/routers/crm_sync.py": "server/api/crm/crm_sync.py",
    "backend/routers/lead_scraper.py": "server/api/lead_scraper/lead_scraper.py",
    "backend/routers/rag_router.py": "server/api/rag/rag_router.py",
    
    # Root Python files
    "main.py": "server/main.py",
    "sync.py": "scripts/sync.py",
    
    # Environment files
    ".env.example": ".env.example",
    "server/.env.example": "server/.env.example",
    
    # Documentation
    "README.md": "README.md",
    "DEPLOY.md": "docs/deployment.md",
    "YOBOT_BRAND_GUIDE.md": "docs/brand_guide.md",
    "command-center-final-spec-v1.md": "docs/specifications.md",
}

# Files to ignore during cleanup
IGNORE_FILES = [
    ".git",
    "node_modules",
    "venv",
    ".venv",
    "__pycache__",
    ".DS_Store",
    "reorganize.py",
    "REORGANIZATION_PLAN.md",
]

def create_directory_structure():
    """Create the new directory structure."""
    def create_dirs(base_path, structure):
        for dir_name, sub_dirs in structure.items():
            dir_path = base_path / dir_name
            dir_path.mkdir(exist_ok=True)
            if sub_dirs:
                create_dirs(dir_path, sub_dirs)
    
    create_dirs(ROOT_DIR, NEW_STRUCTURE)
    print("✅ Created new directory structure")

def move_files():
    """Move files to their new locations."""
    for src, dst in FILE_MAPPINGS.items():
        src_path = ROOT_DIR / src
        dst_path = ROOT_DIR / dst
        
        # Skip if source doesn't exist
        if not src_path.exists():
            print(f"⚠️ Source file not found: {src}")
            continue
        
        # Create parent directory if it doesn't exist
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy the file
        shutil.copy2(src_path, dst_path)
        print(f"📄 Copied {src} to {dst}")

def move_assets():
    """Move assets to the assets directory."""
    assets_dir = ROOT_DIR / "attached_assets"
    if assets_dir.exists():
        # Move image files to assets/images
        images_dir = ROOT_DIR / "assets" / "images"
        images_dir.mkdir(exist_ok=True, parents=True)
        
        for file in assets_dir.glob("*.png"):
            dst_path = images_dir / file.name
            shutil.copy2(file, dst_path)
            print(f"🖼️ Moved {file.name} to assets/images/")
        
        for file in assets_dir.glob("*.jpg"):
            dst_path = images_dir / file.name
            shutil.copy2(file, dst_path)
            print(f"🖼️ Moved {file.name} to assets/images/")
            
        for file in assets_dir.glob("*.jpeg"):
            dst_path = images_dir / file.name
            shutil.copy2(file, dst_path)
            print(f"🖼️ Moved {file.name} to assets/images/")
        
        # Move text files to assets/docs
        docs_dir = ROOT_DIR / "assets" / "docs"
        docs_dir.mkdir(exist_ok=True, parents=True)
        
        for file in assets_dir.glob("*.txt"):
            dst_path = docs_dir / file.name
            shutil.copy2(file, dst_path)
            print(f"📄 Moved {file.name} to assets/docs/")
            
        for file in assets_dir.glob("*.csv"):
            dst_path = docs_dir / file.name
            shutil.copy2(file, dst_path)
            print(f"📄 Moved {file.name} to assets/docs/")

def update_imports():
    """Update import statements in Python files."""
    # This is a simplified version - in a real scenario, you'd need a more sophisticated approach
    python_files = list(ROOT_DIR.glob("server/**/*.py"))
    
    for file_path in python_files:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Update relative imports
        content = re.sub(
            r"from server\.function_library",
            "from server.utils.function_library",
            content
        )
        content = re.sub(
            r"from server\.function_library_full_cleaned",
            "from server.utils.function_library_full",
            content
        )
        content = re.sub(
            r"from server\.auth",
            "from server.core.auth",
            content
        )
        content = re.sub(
            r"from modules\.sales_order",
            "from server.modules.sales.sales_order",
            content
        )
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
    
    print("🔄 Updated import statements")

def main():
    """Main function to run the reorganization."""
    print("🚀 Starting YoBot Command Center reorganization...")
    
    # Create the new directory structure
    create_directory_structure()
    
    # Move files to their new locations
    move_files()
    
    # Move assets
    move_assets()
    
    # Update import statements
    update_imports()
    
    print("\n✅ Reorganization complete!")
    print("\nNOTE: This script has copied files to their new locations but has not deleted any files.")
    print("Please review the changes and manually delete files once you've verified everything works.")

if __name__ == "__main__":
    main()