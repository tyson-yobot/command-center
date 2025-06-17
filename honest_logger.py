import os
import traceback
import uuid
import requests
from datetime import datetime

# 🔐 Hardcoded Airtable API Key (as requested)
AIRTABLE_API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
AIRTABLE_BASE_ID = "appbFDTqB2WtRNV1H"
AIRTABLE_TABLE_ID = "tbl7K5RthCtD69BE1"
AIRTABLE_URL = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_ID}"

HEADERS = {
    "Authorization": f"Bearer {AIRTABLE_API_KEY}",
    "Content-Type": "application/json"
}

PASS_VALUE = "Pass"
FAIL_VALUE = "Fail"
SUCCESS_OUTCOME = "Success"
FAILURE_OUTCOME = "Failure"

def get_existing_record_id(function_name):
    try:
        response = requests.get(
            AIRTABLE_URL,
            headers=HEADERS,
            params={"filterByFormula": f"{{Integration Name}} = '{function_name}'"}
        )
        response.raise_for_status()
        records = response.json().get("records", [])
        return records[0]["id"] if records else None
    except Exception as e:
        print(f"⚠️ Failed to query existing record for '{function_name}': {e}")
        return None

def log_to_airtable(function_name, passed, result_message, module_name):
    now = datetime.utcnow().replace(microsecond=0).isoformat()
    logger_source = "HonestLogger"
    executed = passed is True
    tamper_flag = not executed or passed not in [True, False]
    execution_uuid = str(uuid.uuid4())

    pass_fail_value = PASS_VALUE if passed is True else FAIL_VALUE
    outcome_value = SUCCESS_OUTCOME if passed else FAILURE_OUTCOME

    fields = {
        "Integration Name": function_name,
        "QA Owner": module_name or "Unassigned",
        "Output Data Populated?": passed is True,
        "Record Created?": executed,
        "Red Flag Reason": result_message if not passed else "N/A",
        "Tampering Flag": tamper_flag,
        "Logger Source": logger_source,
        "Execution UUID": execution_uuid,
        "Test Date": now,
        "Pass/Fail": pass_fail_value,
        "Validation Outcome": outcome_value
    }

    record_id = get_existing_record_id(function_name)
    payload = {"fields": fields}

    try:
        if record_id:
            response = requests.patch(f"{AIRTABLE_URL}/{record_id}", headers=HEADERS, json=payload)
        else:
            response = requests.post(AIRTABLE_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        print(f"✅ Logged: {function_name} → {fields['Pass/Fail']}")
    except requests.exceptions.HTTPError as e:
        print(f"❌ Logging failed for {function_name}: {e.response.status_code} - {e.response.text}")
        print(traceback.format_exc())
    except Exception as e:
        print(f"❌ Logging failed for {function_name}: {e}")
        print(traceback.format_exc())
