import requests
import datetime
import os

# Airtable Config - Using environment variables for security
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
BASE_ID = "appRt8V3tH4g5Z5if"
TASK_TEMPLATE_TABLE = "tblTaskTemplates"
PROJECT_ROADMAP_TABLE = "📌 Project Roadmap Tracker"
HEADERS = {
    "Authorization": f"Bearer {AIRTABLE_API_KEY}",
    "Content-Type": "application/json"
}

# Utility: Fetch tasks based on bot package and add-ons
def fetch_template_tasks(bot_package, add_ons):
    """Fetch task templates matching bot package and add-ons"""
    matched_tasks = []

    # Step 1: Fetch all templates
    url = f"https://api.airtable.com/v0/{BASE_ID}/{TASK_TEMPLATE_TABLE}"
    response = requests.get(url, headers=HEADERS)
    
    if response.status_code != 200:
        print(f"Error fetching templates: {response.status_code}")
        return []
    
    templates = response.json().get("records", [])

    for record in templates:
        fields = record.get("fields", {})
        core_match = fields.get("Bot Package") == bot_package
        add_on_match = fields.get("Add-On") in add_ons if fields.get("Add-On") else True

        if core_match and add_on_match:
            matched_tasks.append(fields)

    return matched_tasks

# Utility: Insert roadmap task
def insert_roadmap_task(task, company_id, sales_order_id):
    """Insert a new task into the project roadmap"""
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
        print(f"✅ Task created: {task.get('Task Description')}")
    else:
        print(f"❌ Failed to create task: {response.status_code}")

# Main Trigger Function
def process_sales_order(company_id, sales_order_id, bot_package, selected_addons):
    """Process a sales order by creating all required tasks"""
    if not AIRTABLE_API_KEY:
        print("❌ AIRTABLE_API_KEY not configured")
        return False
    
    print(f"🚀 Processing sales order for {bot_package} with add-ons: {selected_addons}")
    
    tasks = fetch_template_tasks(bot_package, selected_addons)
    
    if not tasks:
        print("❌ No matching tasks found")
        return False
    
    print(f"📋 Found {len(tasks)} tasks to create")
    
    for task in tasks:
        insert_roadmap_task(task, company_id, sales_order_id)
    
    print(f"✅ Sales order processing complete - {len(tasks)} tasks created")
    return True

# Enhanced automation with status tracking
def process_sales_order_with_tracking(order_data):
    """Enhanced sales order processing with full tracking"""
    try:
        company_id = order_data.get("company_id", "recABC123xyz")
        sales_order_id = order_data.get("sales_order_id", f"rec{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}")
        bot_package = order_data.get("bot_package", "Pro")
        selected_addons = order_data.get("selected_addons", [])
        
        # Log the automation start
        print(f"🎯 YoBot Sales Order Automation Started")
        print(f"📋 Order ID: {sales_order_id}")
        print(f"🏢 Company: {company_id}")
        print(f"📦 Package: {bot_package}")
        print(f"🧩 Add-ons: {selected_addons}")
        
        # Process the order
        success = process_sales_order(company_id, sales_order_id, bot_package, selected_addons)
        
        if success:
            print("🎉 Sales order automation completed successfully!")
            return {
                "success": True,
                "message": "Sales order processed and tasks created",
                "order_id": sales_order_id,
                "company_id": company_id
            }
        else:
            print("❌ Sales order automation failed")
            return {
                "success": False,
                "message": "Sales order processing failed",
                "order_id": sales_order_id
            }
    
    except Exception as e:
        print(f"❌ Error in sales order automation: {str(e)}")
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }

# Test function for validation
def test_sales_order_automation():
    """Test the sales order automation system"""
    test_order = {
        "company_id": "recTestCompany123",
        "sales_order_id": "recTestOrder456",
        "bot_package": "Pro",
        "selected_addons": ["📊 SmartSpend™ Dashboard", "🔔 Slack Notifications", "📞 Voice Bot Premium"]
    }
    
    result = process_sales_order_with_tracking(test_order)
    print(f"Test Result: {result}")
    return result

# Example usage for direct testing
if __name__ == "__main__":
    # Test with sample data
    test_sales_order_automation()