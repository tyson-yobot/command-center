import requests
import datetime
import os
from typing import List, Dict

# Airtable Config
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
BASE_ID = os.getenv("AIRTABLE_BASE_ID", "appRt8V3tH4g5Z5if")
TASK_TEMPLATE_TABLE = "tblTaskTemplates"
PROJECT_ROADMAP_TABLE = "📌 Project Roadmap Tracker"
HEADERS = {
    "Authorization": f"Bearer {AIRTABLE_API_KEY}",
    "Content-Type": "application/json"
}

def fetch_template_tasks(bot_package: str, add_ons: List[str]) -> List[Dict]:
    """Fetch tasks based on bot package and add-ons"""
    matched_tasks = []

    if not AIRTABLE_API_KEY:
        print("❌ AIRTABLE_API_KEY not configured")
        return []

    try:
        # Fetch all templates
        url = f"https://api.airtable.com/v0/{BASE_ID}/{TASK_TEMPLATE_TABLE}"
        response = requests.get(url, headers=HEADERS)
        
        if response.status_code != 200:
            print(f"❌ Airtable API error: {response.status_code}")
            return []
            
        templates = response.json().get("records", [])

        for record in templates:
            fields = record.get("fields", {})
            core_match = fields.get("Bot Package") == bot_package
            add_on_match = fields.get("Add-On") in add_ons if fields.get("Add-On") else True

            if core_match and add_on_match:
                matched_tasks.append(fields)

        print(f"✅ Found {len(matched_tasks)} matching tasks for {bot_package}")
        return matched_tasks
        
    except Exception as e:
        print(f"❌ Error fetching templates: {e}")
        return []

def insert_roadmap_task(task: Dict, company_id: str, sales_order_id: str) -> bool:
    """Insert roadmap task into Project Roadmap Tracker"""
    try:
        data = {
            "fields": {
                "📦 Bot Package": task.get("Bot Package"),
                "🧩 Add-On": task.get("Add-On", ""),
                "✅ Task Description": task.get("Task Description"),
                "👤 Assigned To": task.get("Assigned To", "Unassigned"),
                "📅 Due Date": datetime.datetime.now().strftime("%Y-%m-%d"),
                "🔗 Related Sales Order": [sales_order_id],
                "🏢 Company": [company_id],
                "🚦 Status": "Not Started"
            }
        }
        
        url = f"https://api.airtable.com/v0/{BASE_ID}/{PROJECT_ROADMAP_TABLE}"
        response = requests.post(url, headers=HEADERS, json=data)
        
        if response.status_code == 200:
            print(f"✅ Created roadmap task: {task.get('Task Description', 'Unknown')}")
            return True
        else:
            print(f"❌ Failed to create task: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error creating roadmap task: {e}")
        return False

def process_sales_order(company_id: str, sales_order_id: str, bot_package: str, selected_addons: List[str]) -> Dict:
    """Main automation function to process sales orders"""
    print(f"🚀 Processing sales order: {sales_order_id}")
    print(f"📦 Bot Package: {bot_package}")
    print(f"🧩 Add-ons: {', '.join(selected_addons)}")
    
    # Fetch matching tasks
    tasks = fetch_template_tasks(bot_package, selected_addons)
    
    if not tasks:
        return {
            "success": False,
            "message": "No matching tasks found",
            "tasks_created": 0
        }
    
    # Create roadmap tasks
    created_count = 0
    for task in tasks:
        if insert_roadmap_task(task, company_id, sales_order_id):
            created_count += 1
    
    return {
        "success": True,
        "message": f"Successfully created {created_count} roadmap tasks",
        "tasks_created": created_count,
        "total_tasks": len(tasks)
    }

def test_sales_order_automation():
    """Test function with sample data"""
    result = process_sales_order(
        company_id="recABC123xyz",  # Sample Company record ID
        sales_order_id="recXYZ789abc",  # Sample Sales Order record ID
        bot_package="Pro",
        selected_addons=["📊 SmartSpend™ Dashboard", "🔔 Slack Notifications"]
    )
    
    print(f"🧪 Test Result: {result}")
    return result

if __name__ == "__main__":
    test_sales_order_automation()