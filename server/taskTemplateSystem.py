import os
import json
import requests
import datetime

def load_task_templates(base_id, table_name, api_key):
    """Load task templates from Airtable"""
    url = f"https://api.airtable.com/v0/{base_id}/{table_name}"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}"
    }

    all_records = []
    offset = None

    while True:
        params = {"offset": offset} if offset else {}
        response = requests.get(url, headers=headers, params=params)
        
        if not response.ok:
            print(f"Error loading task templates: {response.text}")
            return []
            
        data = response.json()

        for record in data["records"]:
            fields = record.get("fields", {})
            all_records.append({
                "Task Name": fields.get("Task Name", ""),
                "Applies To": fields.get("Applies To", []),
                "Phase": fields.get("Phase", ""),
                "Owner Type": fields.get("Owner Type", ""),
                "Automation Notes": fields.get("Automation Notes", "")
            })

        offset = data.get("offset")
        if not offset:
            break

    return all_records

def filter_tasks(template_tasks, selected_package, selected_addons, industry):
    """Filter tasks based on package, addons, and industry"""
    filtered_tasks = []
    
    for task in template_tasks:
        applies_to = task.get("Applies To", [])
        
        # Check if task applies to selected package
        package_match = selected_package in applies_to
        
        # Check if task applies to any selected addon
        addon_match = any(addon in applies_to for addon in selected_addons)
        
        # Check if task applies to industry
        industry_match = industry in applies_to
        
        # Include task if it matches package, addon, or industry
        if package_match or addon_match or industry_match:
            filtered_tasks.append(task)
    
    return filtered_tasks

def post_tasks_to_airtable(base_id, roadmap_table_name, api_key, filtered_tasks, client_name, quote_number):
    """Clone filtered tasks into Project Roadmap Tracker"""
    url = f"https://api.airtable.com/v0/{base_id}/{roadmap_table_name}"
    headers = {
        "Authorization": f"Bearer {api_key.strip()}",
        "Content-Type": "application/json"
    }

    successful_tasks = 0
    
    for task in filtered_tasks:
        payload = {
            "fields": {
                "Task Name": task["Task Name"],
                "Client": client_name,
                "Quote #": quote_number,
                "Phase": task.get("Phase", ""),
                "Status": "To Do",
                "Owner Type": task.get("Owner Type", ""),
                "Created Date": datetime.datetime.now().isoformat(),
                "Automation Notes": task.get("Automation Notes", "")
            }
        }

        response = requests.post(url, json=payload, headers=headers)
        if response.ok:
            successful_tasks += 1
        else:
            print(f"Error posting task: {task['Task Name']}, {response.text}")
    
    return successful_tasks

def generate_quote_number(company_name):
    """Generate unique quote number"""
    today = datetime.datetime.now().strftime("%Y%m%d")
    company_code = ''.join([c.upper() for c in company_name.split() if c])[:3]
    return f"Q-{company_code}-{today}-001"

def process_complete_sales_order_with_tasks(order_data):
    """Complete sales order processing with task template system"""
    try:
        # Extract order data
        company_name = order_data.get('customer_name', 'Client Company')
        contact_email = order_data.get('email', 'client@example.com')
        selected_package = order_data.get('package', 'YoBot Package')
        total_paid = order_data.get('total', '$0')
        industry = order_data.get('industry', 'General')
        selected_addons = order_data.get('addons', [])

        print(f"Processing complete sales order with tasks for {company_name}")

        # Step 1: Create local client folder (using existing system)
        from localFolderSystem import process_complete_local_sales_order
        folder_result = process_complete_local_sales_order(order_data)
        
        if not folder_result["success"]:
            return {"success": False, "error": f"Folder creation failed: {folder_result['error']}"}

        # Step 2: Generate quote number
        quote_number = generate_quote_number(company_name)

        # Step 3: Load task templates from Airtable
        api_key = os.getenv("AIRTABLE_API_KEY")
        base_id = "appRt8V3tH4g5Z5if"
        
        if not api_key:
            print("Airtable API key not found, skipping task template processing")
            template_tasks = []
        else:
            template_tasks = load_task_templates(base_id, "📑 Task Template Table", api_key)

        # Step 4: Filter tasks based on package, addons, and industry
        filtered_tasks = filter_tasks(template_tasks, selected_package, selected_addons, industry)

        # Step 5: Post filtered tasks to Project Roadmap Tracker
        tasks_created = 0
        if api_key and filtered_tasks:
            tasks_created = post_tasks_to_airtable(
                base_id, 
                "📌 Project Roadmap Tracker", 
                api_key, 
                filtered_tasks, 
                company_name, 
                quote_number
            )

        # Step 6: Create comprehensive result
        result = {
            "success": True,
            "client_name": company_name,
            "quote_number": quote_number,
            "order_id": folder_result["order_id"],
            "folder_path": folder_result["folder_path"],
            "pdf_path": folder_result["pdf_path"],
            "email_sent": folder_result["email_sent"],
            "folder_created": folder_result["folder_created"],
            "pdf_organized": folder_result["pdf_organized"],
            "template_tasks_loaded": len(template_tasks),
            "filtered_tasks": len(filtered_tasks),
            "tasks_created": tasks_created,
            "processing_time": datetime.datetime.now().isoformat(),
            "method": "Complete Sales Order with Task Templates"
        }

        return result

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Test with sample data
    test_order = {
        "customer_name": "Task Template Test Company",
        "email": "tasktest@company.com",
        "package": "Enterprise",
        "total": "$75000",
        "industry": "Dental",
        "addons": ["SmartSpend™ Dashboard", "Voice Pattern Recognition & Analysis"]
    }
    
    result = process_complete_sales_order_with_tasks(test_order)
    print(json.dumps(result, indent=2))