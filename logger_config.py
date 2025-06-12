"""
PRODUCTION LOGGER CONFIGURATION - HARDENED VERSION
Security Level: MAXIMUM
Authorized by: Tyson Lerfald, CEO YoBot®
Environment: PRODUCTION ONLY

⚠️  WARNING: This configuration is locked and monitored.
Any unauthorized modifications will trigger security alerts.
"""

import os

# Production Airtable Configuration - LOCKED
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY", "")
AIRTABLE_BASE_ID = "appbFDTqB2WtRNV1H"  # PRODUCTION BASE - DO NOT MODIFY
AIRTABLE_TABLE_ID = "tblQAIntegrationTests"  # PRODUCTION TABLE - DO NOT MODIFY

# Environment validation
YOLOGGER_ENV = os.getenv("YOLOGGER_ENV", "")

# Security validation flags
PRODUCTION_MODE_REQUIRED = True
AUTHENTIC_DATA_ONLY = True
SHADOW_VALIDATION_ENABLED = True

# Audit monitoring
AUDIT_WEBHOOK = "https://hooks.slack.com/services/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"
SECURITY_ALERTS_ENABLED = True

# Blocked patterns for notes validation
BLOCKED_PATTERNS = [
    "manual",
    "forced", 
    "assumed",
    "test data",
    "demo",
    "fake",
    "placeholder",
    "mock",
    "simulated"
]

# Required fields for production logging
REQUIRED_FIELDS = [
    "integration_name",
    "notes", 
    "module_type",
    "related_scenario_link"
]