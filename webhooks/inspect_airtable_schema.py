import requests
import json

# Airtable credentials for Integration Test Log 2
API_KEY = "paty41tSgNrAPUQZV.7c0df078d76ad5bb4ad1f6be2adbf7e0dec16fd9073fbd51f7b64745953bddfa"
BASE_ID = "appCoAtCZdARb4AM2"
TABLE_ID = "tblRNjNnaGL5ICIf9"
AIRTABLE_URL = f"https://api.airtable.com/v0/{BASE_ID}/{TABLE_ID}"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def inspect_table_schema():
    """Inspect the actual field names and structure of Integration Test Log 2"""
    try:
        # Get existing records to see field structure
        response = requests.get(AIRTABLE_URL + "?maxRecords=3", headers=HEADERS)
        response.raise_for_status()
        
        data = response.json()
        
        print("📊 INTEGRATION TEST LOG 2 - TABLE SCHEMA INSPECTION")
        print("=" * 60)
        
        if data.get('records'):
            print(f"✅ Found {len(data['records'])} existing records")
            
            # Extract field names from first record
            first_record = data['records'][0]
            fields = first_record.get('fields', {})
            
            print("\n🔍 ACTUAL FIELD NAMES:")
            for field_name, field_value in fields.items():
                field_type = type(field_value).__name__
                print(f"  • '{field_name}' (type: {field_type})")
                if isinstance(field_value, str) and len(field_value) > 50:
                    print(f"    Sample: {field_value[:50]}...")
                else:
                    print(f"    Sample: {field_value}")
            
            print(f"\n📝 TOTAL FIELDS: {len(fields)}")
            
            # Save schema for reference
            schema_data = {
                "table_info": {
                    "base_id": BASE_ID,
                    "table_id": TABLE_ID,
                    "record_count": len(data['records'])
                },
                "field_schema": fields
            }
            
            with open('integration_test_log2_schema.json', 'w') as f:
                json.dump(schema_data, f, indent=2)
            
            print("💾 Schema saved to: integration_test_log2_schema.json")
            
        else:
            print("⚠️ No existing records found - table might be empty")
            
        return data
        
    except Exception as e:
        print(f"❌ Schema inspection failed: {e}")
        return None

def test_simple_record():
    """Test creating a simple record with minimal fields"""
    try:
        payload = {
            "fields": {
                "Integration Name": "Test Function 131: CRM Script Generator",
                "Pass/Fail": "✅",
                "Notes": "Test record for schema validation"
            }
        }
        
        response = requests.post(AIRTABLE_URL, json=payload, headers=HEADERS)
        
        if response.status_code == 422:
            print("❌ 422 Error - Field names don't match")
            print(f"Response: {response.text}")
        elif response.status_code == 200:
            print("✅ Simple record created successfully")
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Test record failed: {e}")

if __name__ == "__main__":
    print("🔍 Inspecting Integration Test Log 2 schema...")
    schema = inspect_table_schema()
    
    if schema:
        print("\n🧪 Testing simple record creation...")
        test_simple_record()
    else:
        print("Cannot proceed without schema information")