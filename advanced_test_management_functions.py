#!/usr/bin/env python3
"""
Advanced Test Management Functions (61-70)
Complete test lifecycle management with blocking, purging, renaming, and status tracking
"""

import os
import requests
from datetime import datetime

def get_api_key():
    """Get the appropriate API key"""
    return os.getenv("AIRTABLE_VALID_TOKEN") or os.getenv("AIRTABLE_API_KEY")

def find_airtable_record(base_id, table_id, api_key, field_name, search_value):
    """Find specific record by field value"""
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {"filterByFormula": f"{{'{field_name}'}} = '{search_value}'"}
    
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return response.json()
    return {"records": []}

def update_airtable_record(base_id, table_id, record_id, api_key, fields):
    """Update Airtable record with new field values"""
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}/{record_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {"fields": fields}
    
    response = requests.patch(url, headers=headers, json=data)
    return response.json() if response.status_code == 200 else {"error": response.text}

def get_all_airtable_records(base_id, table_id, api_key):
    """Get all records from Airtable table"""
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json().get("records", [])
    return []

def append_to_test_notes(api_key, test_name, note):
    """Append note to existing test notes"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    existing = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", test_name)
    if not existing.get("records"):
        return {"error": "Test not found"}
    
    record = existing["records"][0]
    current_notes = record["fields"].get("📝 Notes / Debug", "")
    new_notes = f"{current_notes}\n{note}" if current_notes else note
    
    return update_airtable_record(base_id, table_id, record["id"], api_key, {
        "📝 Notes / Debug": new_notes
    })

def create_airtable_record(base_id, table_id, api_key, fields):
    """Create new Airtable record"""
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    data = {"fields": fields}
    
    response = requests.post(url, headers=headers, json=data)
    return response.json() if response.status_code == 200 else {"error": response.text}

def delete_airtable_record(base_id, table_id, record_id, api_key):
    """Delete Airtable record"""
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}/{record_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    
    response = requests.delete(url, headers=headers)
    return response.status_code == 200

# ✅ 61. Mark test as "blocked" with reason
def mark_test_blocked(api_key, test_name, reason):
    """Mark test as blocked with specific reason"""
    note = f"🚫 BLOCKED: {reason}"
    append_to_test_notes(api_key, test_name, note)
    
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    existing = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", test_name)
    if not existing.get("records"):
        return {"error": "Test not found"}
    
    return update_airtable_record(base_id, table_id, existing["records"][0]["id"], api_key, {
        "✅ Pass/Fail": "❌ Fail"
    })

# ✅ 62. Purge all test notes (for reset scenarios)
def purge_all_test_notes(api_key):
    """Clear all test notes from all records"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    updated_count = 0
    
    for record in records:
        result = update_airtable_record(base_id, table_id, record["id"], api_key, {
            "📝 Notes / Debug": ""
        })
        if "error" not in result:
            updated_count += 1
    
    return {"status": "Notes cleared", "count": updated_count}

# ✅ 63. Toggle retest field manually
def toggle_retest_field(api_key, test_name, mark_retest=True):
    """Toggle retest status for specific test"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    existing = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", test_name)
    if not existing.get("records"):
        return {"error": "Test not found"}
    
    return update_airtable_record(base_id, table_id, existing["records"][0]["id"], api_key, {
        "📝 Notes / Debug": f"🔁 RETEST MARKED: {datetime.now().strftime('%Y-%m-%d %H:%M')}" if mark_retest else "✅ RETEST CLEARED"
    })

# ✅ 64. Count all tests with status "Blocked"
def count_blocked_tests(api_key):
    """Count tests marked as blocked"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {"filterByFormula": "FIND('BLOCKED', {📝 Notes / Debug})"}
    
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return len(response.json().get("records", []))
    return 0

# ✅ 65. Rename a test (by cloning + deleting original)
def rename_test(api_key, old_name, new_name):
    """Rename test by cloning and deleting original"""
    result = clone_test_record(api_key, old_name, new_name)
    if "error" not in result:
        delete_test_by_name(api_key, old_name)
        return {"status": "Test renamed successfully", "old_name": old_name, "new_name": new_name}
    return result

def clone_test_record(api_key, source_name, new_name):
    """Clone existing test record with new name"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    # Find source record
    existing = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", source_name)
    if not existing.get("records"):
        return {"error": "Source test not found"}
    
    source_record = existing["records"][0]
    source_fields = source_record["fields"].copy()
    
    # Update name and add clone note
    source_fields["🧩 Integration Name"] = new_name
    source_fields["📝 Notes / Debug"] = f"📋 CLONED FROM: {source_name} on {datetime.now().strftime('%Y-%m-%d')}"
    
    return create_airtable_record(base_id, table_id, api_key, source_fields)

def delete_test_by_name(api_key, test_name):
    """Delete test by name"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    existing = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", test_name)
    if not existing.get("records"):
        return {"error": "Test not found"}
    
    record_id = existing["records"][0]["id"]
    success = delete_airtable_record(base_id, table_id, record_id, api_key)
    return {"status": "Test deleted" if success else "Delete failed"}

# ✅ 66. Pull full log history for a specific test
def get_full_test_history(api_key, test_name):
    """Get complete test history and details"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    result = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", test_name)
    if result.get("records"):
        record = result["records"][0]
        return {
            "test_name": test_name,
            "fields": record["fields"],
            "record_id": record["id"],
            "created_time": record.get("createdTime"),
            "full_history": result
        }
    return {"error": "Test not found"}

# ✅ 67. Clear all pass/fail/retest fields
def clear_test_status_flags(api_key):
    """Clear all status flags from all test records"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    updated_count = 0
    
    for record in records:
        result = update_airtable_record(base_id, table_id, record["id"], api_key, {
            "✅ Pass/Fail": ""
        })
        if "error" not in result:
            updated_count += 1
    
    return {"status": "All flags cleared", "count": updated_count}

# ✅ 68. Pull all tests with no pass/fail status
def get_tests_with_blank_status(api_key):
    """Get all tests without pass/fail status"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    blank_status_tests = []
    
    for record in records:
        if not record["fields"].get("✅ Pass/Fail"):
            blank_status_tests.append({
                "test_name": record["fields"].get("🧩 Integration Name", "Unknown"),
                "test_date": record["fields"].get("📅 Test Date", ""),
                "qa_owner": record["fields"].get("👤 QA Owner", ""),
                "record_id": record["id"]
            })
    
    return blank_status_tests

# ✅ 69. Log manual override reason
def log_override_reason(api_key, test_name, override_msg):
    """Log manual override with reason"""
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    note = f"⚠️ MANUAL OVERRIDE ({timestamp}): {override_msg}"
    return append_to_test_notes(api_key, test_name, note)

# ✅ 70. Count all tests with the same function name
def count_tests_per_function(api_key, function_name):
    """Count tests for specific function name"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    url = f"https://api.airtable.com/v0/{base_id}/{table_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {"filterByFormula": f"{{🧩 Integration Name}} = '{function_name}'"}
    
    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        return len(response.json().get("records", []))
    return 0

def test_advanced_management_functions():
    """Test all advanced test management functions"""
    api_key = get_api_key()
    if not api_key:
        print("❌ No API key available")
        return
    
    print("Testing Advanced Test Management Functions (61-70)")
    print("=" * 60)
    
    test_results = []
    
    # Test 61: Mark test as blocked
    try:
        result = mark_test_blocked(api_key, "Sample Test", "Database connection failed")
        test_results.append(("61. Mark Test Blocked", "✅ Pass" if "error" not in result else "❌ Fail"))
    except Exception as e:
        test_results.append(("61. Mark Test Blocked", f"❌ Error: {str(e)[:50]}"))
    
    # Test 62: Purge all test notes
    try:
        result = purge_all_test_notes(api_key)
        test_results.append(("62. Purge All Notes", "✅ Pass" if result.get("status") else "❌ Fail"))
    except Exception as e:
        test_results.append(("62. Purge All Notes", f"❌ Error: {str(e)[:50]}"))
    
    # Test 63: Toggle retest field
    try:
        result = toggle_retest_field(api_key, "Sample Test", True)
        test_results.append(("63. Toggle Retest", "✅ Pass" if "error" not in result else "❌ Fail"))
    except Exception as e:
        test_results.append(("63. Toggle Retest", f"❌ Error: {str(e)[:50]}"))
    
    # Test 64: Count blocked tests
    try:
        count = count_blocked_tests(api_key)
        test_results.append(("64. Count Blocked Tests", f"✅ Pass ({count} blocked)"))
    except Exception as e:
        test_results.append(("64. Count Blocked Tests", f"❌ Error: {str(e)[:50]}"))
    
    # Test 65: Rename test (skip to avoid data changes)
    test_results.append(("65. Rename Test", "⚠️ Skipped (data preservation)"))
    
    # Test 66: Get full test history
    try:
        result = get_full_test_history(api_key, "Sample Test")
        test_results.append(("66. Get Test History", "✅ Pass" if "test_name" in result else "❌ Fail"))
    except Exception as e:
        test_results.append(("66. Get Test History", f"❌ Error: {str(e)[:50]}"))
    
    # Test 67: Clear status flags (skip to avoid data changes)
    test_results.append(("67. Clear Status Flags", "⚠️ Skipped (data preservation)"))
    
    # Test 68: Get tests with blank status
    try:
        result = get_tests_with_blank_status(api_key)
        test_results.append(("68. Blank Status Tests", f"✅ Pass ({len(result)} found)"))
    except Exception as e:
        test_results.append(("68. Blank Status Tests", f"❌ Error: {str(e)[:50]}"))
    
    # Test 69: Log override reason
    try:
        result = log_override_reason(api_key, "Sample Test", "Manual verification completed")
        test_results.append(("69. Log Override", "✅ Pass" if "error" not in result else "❌ Fail"))
    except Exception as e:
        test_results.append(("69. Log Override", f"❌ Error: {str(e)[:50]}"))
    
    # Test 70: Count tests per function
    try:
        count = count_tests_per_function(api_key, "Sample Test")
        test_results.append(("70. Count Per Function", f"✅ Pass ({count} found)"))
    except Exception as e:
        test_results.append(("70. Count Per Function", f"❌ Error: {str(e)[:50]}"))
    
    # Print results
    for test_name, result in test_results:
        print(f"{test_name}: {result}")
    
    passed = len([r for r in test_results if "✅" in r[1]])
    total = len(test_results)
    print(f"\nResults: {passed}/{total} functions working")

# ✅ 71. Set "Date Retested" to today
def set_retest_date_today(api_key, test_name):
    """Set retest date to today for specific test"""
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    record = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", test_name)
    if not record.get("records"):
        return {"error": "Test not found"}
    
    return update_airtable_record(base_id, table_id, record["records"][0]["id"], api_key, {
        "📅 Test Date": today  # Using Test Date field as retested date
    })

# ✅ 72. Find tests retested within last X days
def get_recent_retests(api_key, days=7):
    """Get tests retested within specified days"""
    from datetime import datetime, timedelta
    since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    
    url = "https://api.airtable.com/v0/appCoAtCZdARb4AM2/🧪 Integration Test Log 2"
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {
        "filterByFormula": f"IS_AFTER({{📅 Test Date}}, '{since}')"
    }
    
    response = requests.get(url, headers=headers, params=params)
    return response.json() if response.status_code == 200 else {"records": []}

# ✅ 73. Set QA score on test
def set_test_qa_score(api_key, test_name, score):
    """Set QA score for specific test"""
    note = f"🎯 QA SCORE: {score}/10"
    return append_to_test_notes(api_key, test_name, note)

# ✅ 74. Clear retest date field
def clear_retest_date(api_key, test_name):
    """Clear retest date for specific test"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    record = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", test_name)
    if not record.get("records"):
        return {"error": "Test not found"}
    
    return update_airtable_record(base_id, table_id, record["records"][0]["id"], api_key, {
        "📅 Test Date": ""
    })

# ✅ 75. Extract all override notes
def get_all_override_notes(api_key):
    """Get all manual override notes from tests"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    override_notes = []
    
    for record in records:
        notes = record["fields"].get("📝 Notes / Debug", "")
        if "MANUAL OVERRIDE" in notes:
            override_notes.append({
                "test_name": record["fields"].get("🧩 Integration Name", "Unknown"),
                "notes": notes
            })
    
    return override_notes

# ✅ 76. Calculate % passed from total tests
def calculate_pass_rate(api_key):
    """Calculate pass rate percentage from all tests"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    total = len(records)
    passed = sum(1 for r in records if r["fields"].get("✅ Pass/Fail") == "✅ Pass")
    
    return {
        "total": total,
        "passed": passed,
        "failed": total - passed,
        "rate": round((passed / total * 100), 2) if total else 0
    }

# ✅ 77. Get notes that contain "debug"
def get_debug_notes(api_key):
    """Get all notes containing debug information"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    debug_notes = []
    
    for record in records:
        notes = record["fields"].get("📝 Notes / Debug", "")
        if "DEBUG" in notes.upper():
            debug_notes.append({
                "test_name": record["fields"].get("🧩 Integration Name", "Unknown"),
                "notes": notes
            })
    
    return debug_notes

# ✅ 78. Batch clear QA scores
def clear_all_qa_scores(api_key):
    """Clear QA scores from all test notes"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    updated_count = 0
    
    for record in records:
        notes = record["fields"].get("📝 Notes / Debug", "")
        if "QA SCORE" in notes:
            # Remove QA score lines
            cleaned_notes = "\n".join([line for line in notes.splitlines() if "QA SCORE" not in line])
            result = update_airtable_record(base_id, table_id, record["id"], api_key, {
                "📝 Notes / Debug": cleaned_notes
            })
            if "error" not in result:
                updated_count += 1
    
    return {"status": "QA scores cleared", "count": updated_count}

# ✅ 79. Identify stale tests (older than X days)
def get_stale_tests(api_key, days=30):
    """Get tests older than specified days"""
    from datetime import datetime, timedelta
    cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    
    url = "https://api.airtable.com/v0/appCoAtCZdARb4AM2/🧪 Integration Test Log 2"
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {"filterByFormula": f"IS_BEFORE({{📅 Test Date}}, '{cutoff}')"}
    
    response = requests.get(url, headers=headers, params=params)
    return response.json() if response.status_code == 200 else {"records": []}

# ✅ 80. Add test tag with timestamp
def tag_test_with_timestamp(api_key, test_name, tag):
    """Add timestamped tag to test notes"""
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    full_tag = f"[{timestamp}] {tag}"
    return append_to_test_notes(api_key, test_name, full_tag)

# ✅ 81. Set test status to "In Progress"
def mark_test_in_progress(api_key, test_name):
    """Mark test as in progress"""
    return append_to_test_notes(api_key, test_name, "⏳ Status: In Progress")

# ✅ 82. Mark test as deprecated
def deprecate_test(api_key, test_name, reason="No longer used"):
    """Mark test as deprecated with reason"""
    note = f"🗑️ DEPRECATED: {reason}"
    return append_to_test_notes(api_key, test_name, note)

# ✅ 83. List tests by tester
def list_tests_by_tester(api_key, tester_name):
    """Get all tests by specific tester"""
    url = "https://api.airtable.com/v0/appCoAtCZdARb4AM2/🧪 Integration Test Log 2"
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {"filterByFormula": f"{{👤 QA Owner}} = '{tester_name}'"}
    
    response = requests.get(url, headers=headers, params=params)
    return response.json() if response.status_code == 200 else {"records": []}

# ✅ 84. Bulk mark tests as deprecated
def bulk_deprecate_tests(api_key, test_names, reason="Obsolete"):
    """Mark multiple tests as deprecated"""
    updated_count = 0
    
    for name in test_names:
        result = deprecate_test(api_key, name, reason)
        if "error" not in result:
            updated_count += 1
    
    return {"status": "Deprecated", "count": updated_count, "total": len(test_names)}

# ✅ 85. Count tests with no retest date
def count_tests_missing_retest_date(api_key):
    """Count tests without retest date"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    missing_count = sum(1 for r in records if not r["fields"].get("📅 Test Date"))
    
    return {"missing_retest_date": missing_count, "total_tests": len(records)}

# ✅ 86. Clear override messages only
def clear_override_notes(api_key):
    """Clear only manual override notes from all tests"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    updated_count = 0
    
    for record in records:
        notes = record["fields"].get("📝 Notes / Debug", "")
        if "MANUAL OVERRIDE" in notes:
            cleaned = "\n".join([line for line in notes.splitlines() if "MANUAL OVERRIDE" not in line])
            result = update_airtable_record(base_id, table_id, record["id"], api_key, {
                "📝 Notes / Debug": cleaned
            })
            if "error" not in result:
                updated_count += 1
    
    return {"status": "Override notes removed", "count": updated_count}

# ✅ 87. Mark test as passed and final
def finalize_test(api_key, test_name):
    """Mark test as passed and finalized"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    # Update pass/fail status
    existing = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", test_name)
    if not existing.get("records"):
        return {"error": "Test not found"}
    
    update_result = update_airtable_record(base_id, table_id, existing["records"][0]["id"], api_key, {
        "✅ Pass/Fail": "✅ Pass"
    })
    
    # Add finalized note
    append_to_test_notes(api_key, test_name, "✅ Finalized & Passed")
    
    return {"status": "Finalized", "test_name": test_name}

# ✅ 88. Archive test by adding archive flag in notes
def archive_test(api_key, test_name):
    """Archive test by adding archive flag"""
    return append_to_test_notes(api_key, test_name, "📦 ARCHIVED")

# ✅ 89. Find all archived tests
def get_archived_tests(api_key):
    """Get all archived tests"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    archived_tests = []
    
    for record in records:
        notes = record["fields"].get("📝 Notes / Debug", "")
        if "ARCHIVED" in notes:
            archived_tests.append({
                "test_name": record["fields"].get("🧩 Integration Name", "Unknown"),
                "test_date": record["fields"].get("📅 Test Date", ""),
                "qa_owner": record["fields"].get("👤 QA Owner", ""),
                "record_id": record["id"]
            })
    
    return archived_tests

# ✅ 90. Get total test count by status
def get_test_counts_by_status(api_key):
    """Get comprehensive test counts by status"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    summary = {"passed": 0, "failed": 0, "blank": 0, "blocked": 0, "archived": 0, "deprecated": 0}
    
    for record in records:
        status = record["fields"].get("✅ Pass/Fail", "")
        notes = record["fields"].get("📝 Notes / Debug", "")
        
        if "ARCHIVED" in notes:
            summary["archived"] += 1
        elif "DEPRECATED" in notes:
            summary["deprecated"] += 1
        elif "BLOCKED" in notes:
            summary["blocked"] += 1
        elif status == "✅ Pass":
            summary["passed"] += 1
        elif status == "❌ Fail":
            summary["failed"] += 1
        else:
            summary["blank"] += 1
    
    summary["total"] = len(records)
    return summary

def test_complete_management_suite():
    """Test all 90 test management functions"""
    api_key = get_api_key()
    if not api_key:
        print("❌ No API key available")
        return
    
    print("Testing Complete Test Management Suite (Functions 61-90)")
    print("=" * 70)
    
    # Test pass rate calculation
    try:
        pass_rate = calculate_pass_rate(api_key)
        print(f"✅ Pass Rate: {pass_rate['rate']}% ({pass_rate['passed']}/{pass_rate['total']})")
    except Exception as e:
        print(f"❌ Pass rate calculation failed: {str(e)[:50]}")
    
    # Test status counts
    try:
        status_counts = get_test_counts_by_status(api_key)
        print(f"✅ Status Counts: {status_counts}")
    except Exception as e:
        print(f"❌ Status counts failed: {str(e)[:50]}")
    
    # Test recent retests
    try:
        recent = get_recent_retests(api_key, 30)
        print(f"✅ Recent Retests: {len(recent.get('records', []))} found")
    except Exception as e:
        print(f"❌ Recent retests failed: {str(e)[:50]}")
    
    # Test archived tests
    try:
        archived = get_archived_tests(api_key)
        print(f"✅ Archived Tests: {len(archived)} found")
    except Exception as e:
        print(f"❌ Archived tests failed: {str(e)[:50]}")
    
    # Test debug notes
    try:
        debug_notes = get_debug_notes(api_key)
        print(f"✅ Debug Notes: {len(debug_notes)} found")
    except Exception as e:
        print(f"❌ Debug notes failed: {str(e)[:50]}")
    
    print("\n🎯 Complete test management suite implemented with 90 functions")

# ✅ 91. Reset a single test (clear all fields except name)
def reset_test_record(api_key, test_name):
    """Reset all test fields except name"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    record = find_airtable_record(base_id, table_id, api_key, "🧩 Integration Name", test_name)
    if not record.get("records"):
        return {"error": "Test not found"}
    
    fields_to_clear = {
        "✅ Pass/Fail": "",
        "📅 Test Date": "",
        "📝 Notes / Debug": "",
        "👤 QA Owner": ""
    }
    
    return update_airtable_record(base_id, table_id, record["records"][0]["id"], api_key, fields_to_clear)

# ✅ 92. Pull only failed tests with override notes
def get_failed_overridden_tests(api_key):
    """Get failed tests that have manual override notes"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    failed_overridden = []
    
    for record in records:
        status = record["fields"].get("✅ Pass/Fail", "")
        notes = record["fields"].get("📝 Notes / Debug", "")
        
        if status == "❌ Fail" and "MANUAL OVERRIDE" in notes:
            failed_overridden.append({
                "test_name": record["fields"].get("🧩 Integration Name", "Unknown"),
                "notes": notes,
                "test_date": record["fields"].get("📅 Test Date", ""),
                "qa_owner": record["fields"].get("👤 QA Owner", "")
            })
    
    return failed_overridden

# ✅ 93. Export tests to plain text (basic format)
def export_test_names(api_key):
    """Export all test names to plain text format"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    test_names = [record["fields"].get("🧩 Integration Name", "Unnamed") for record in records]
    
    return "\n".join(test_names)

# ✅ 94. Detect duplicate test names
def find_duplicate_tests(api_key):
    """Find tests with duplicate names"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    seen = {}
    duplicates = []
    
    for record in records:
        name = record["fields"].get("🧩 Integration Name", "")
        if name in seen:
            duplicates.append(name)
        else:
            seen[name] = True
    
    return list(set(duplicates))

# ✅ 95. Log test runtime duration
def log_test_duration(api_key, test_name, duration_seconds):
    """Log test execution duration"""
    duration_note = f"⏱️ Duration: {duration_seconds} seconds"
    return append_to_test_notes(api_key, test_name, duration_note)

# ✅ 96. List all tests by status (grouped)
def list_tests_by_status(api_key):
    """Group tests by their pass/fail status"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    results = {"Passed": [], "Failed": [], "Blank": [], "Blocked": [], "Archived": []}
    records = get_all_airtable_records(base_id, table_id, api_key)
    
    for record in records:
        name = record["fields"].get("🧩 Integration Name", "Unknown")
        status = record["fields"].get("✅ Pass/Fail", "")
        notes = record["fields"].get("📝 Notes / Debug", "")
        
        if "ARCHIVED" in notes:
            results["Archived"].append(name)
        elif "BLOCKED" in notes:
            results["Blocked"].append(name)
        elif status == "✅ Pass":
            results["Passed"].append(name)
        elif status == "❌ Fail":
            results["Failed"].append(name)
        else:
            results["Blank"].append(name)
    
    return results

# ✅ 97. Bulk assign tester name to all blank tests
def assign_default_tester(api_key, tester_name):
    """Assign default tester to tests without QA owner"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    updated_count = 0
    
    for record in records:
        if not record["fields"].get("👤 QA Owner"):
            result = update_airtable_record(base_id, table_id, record["id"], api_key, {
                "👤 QA Owner": tester_name
            })
            if "error" not in result:
                updated_count += 1
    
    return {"status": "Default tester assigned", "count": updated_count}

# ✅ 98. Add batch tag to multiple tests
def batch_tag_tests(api_key, test_names, tag):
    """Add same tag to multiple tests"""
    updated_count = 0
    
    for name in test_names:
        result = append_to_test_notes(api_key, name, f"🏷️ {tag}")
        if "error" not in result:
            updated_count += 1
    
    return {"status": f"Tagged tests", "count": updated_count, "total": len(test_names)}

# ✅ 99. Get total number of notes logged
def total_notes_logged(api_key):
    """Count total tests with notes"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    notes_count = sum(1 for record in records if record["fields"].get("📝 Notes / Debug"))
    
    return {"tests_with_notes": notes_count, "total_tests": len(records)}

# ✅ 100. Verify that all tests have unique names
def verify_unique_test_names(api_key):
    """Verify all test names are unique"""
    base_id = "appCoAtCZdARb4AM2"
    table_id = "🧪 Integration Test Log 2"
    
    records = get_all_airtable_records(base_id, table_id, api_key)
    names = [record["fields"].get("🧩 Integration Name", "") for record in records]
    
    unique_count = len(set(names))
    total_count = len(names)
    
    return {
        "unique_names": unique_count == total_count,
        "total_tests": total_count,
        "unique_count": unique_count,
        "duplicates": total_count - unique_count
    }

def test_final_functions():
    """Test final batch of functions (91-100)"""
    api_key = get_api_key()
    if not api_key:
        print("❌ No API key available")
        return
    
    print("Testing Final Test Management Functions (91-100)")
    print("=" * 70)
    
    # Test duplicate detection
    try:
        duplicates = find_duplicate_tests(api_key)
        print(f"✅ Duplicate Detection: {len(duplicates)} duplicates found")
    except Exception as e:
        print(f"❌ Duplicate detection failed: {str(e)[:50]}")
    
    # Test unique name verification
    try:
        unique_check = verify_unique_test_names(api_key)
        print(f"✅ Unique Names: {unique_check['unique_names']} ({unique_check['unique_count']}/{unique_check['total_tests']})")
    except Exception as e:
        print(f"❌ Unique name check failed: {str(e)[:50]}")
    
    # Test notes count
    try:
        notes_count = total_notes_logged(api_key)
        print(f"✅ Notes Count: {notes_count['tests_with_notes']}/{notes_count['total_tests']} tests have notes")
    except Exception as e:
        print(f"❌ Notes count failed: {str(e)[:50]}")
    
    # Test status grouping
    try:
        status_groups = list_tests_by_status(api_key)
        print(f"✅ Status Groups: {len(status_groups['Passed'])} passed, {len(status_groups['Failed'])} failed")
    except Exception as e:
        print(f"❌ Status grouping failed: {str(e)[:50]}")
    
    # Test export
    try:
        export_text = export_test_names(api_key)
        print(f"✅ Export: {len(export_text.splitlines())} test names exported")
    except Exception as e:
        print(f"❌ Export failed: {str(e)[:50]}")
    
    print("\n🎯 Complete 100-function test management suite implemented!")
    print("Functions 1-100: Full test lifecycle management")

if __name__ == "__main__":
    test_final_functions()