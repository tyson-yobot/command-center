import os
import json
import datetime
import shutil
from localSalesOrderAutomation import generate_quote_pdf

def create_local_client_folder(client_name):
    """Create local folder for client with organized structure"""
    try:
        # Create main client folders directory
        base_dir = "/home/runner/workspace/client_folders"
        os.makedirs(base_dir, exist_ok=True)
        
        # Create client-specific folder with timestamp
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        folder_name = f"{client_name.replace(' ', '_')}_{timestamp}"
        client_folder = os.path.join(base_dir, folder_name)
        
        # Create folder structure
        os.makedirs(client_folder, exist_ok=True)
        os.makedirs(os.path.join(client_folder, "quotes"), exist_ok=True)
        os.makedirs(os.path.join(client_folder, "contracts"), exist_ok=True)
        os.makedirs(os.path.join(client_folder, "communications"), exist_ok=True)
        
        # Create client info file
        client_info = {
            "client_name": client_name,
            "created_date": datetime.datetime.now().isoformat(),
            "folder_path": client_folder,
            "status": "Active"
        }
        
        with open(os.path.join(client_folder, "client_info.json"), "w") as f:
            json.dump(client_info, f, indent=2)
        
        return {
            "success": True,
            "folder_path": client_folder,
            "folder_name": folder_name,
            "quotes_folder": os.path.join(client_folder, "quotes")
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}

def process_complete_local_sales_order(order_data):
    """Complete sales order processing with local folder system"""
    try:
        company_name = order_data.get('customer_name', 'Client Company')
        client_email = order_data.get('email', 'client@example.com')
        package = order_data.get('package', 'YoBot Package')
        total = order_data.get('total', '$0')
        
        print(f"Processing complete local sales order for {company_name}")

        # Step 1: Generate quote number
        today = datetime.datetime.now().strftime("%Y%m%d")
        company_code = ''.join([c.upper() for c in company_name.split() if c])[:3]
        quote_number = f"Q-{company_code}-{today}-001"

        # Step 2: Create local client folder
        folder_result = create_local_client_folder(company_name)
        if not folder_result["success"]:
            return {"success": False, "error": f"Local folder creation failed: {folder_result['error']}"}

        # Step 3: Generate PDF in client folder
        pdf_result = generate_quote_pdf(company_name, quote_number, package, total, client_email)
        if not pdf_result["success"]:
            return {"success": False, "error": f"PDF generation failed: {pdf_result['error']}"}

        # Step 4: Move PDF to client folder
        try:
            destination_path = os.path.join(folder_result["quotes_folder"], f"{company_name}_{quote_number}.pdf")
            shutil.copy2(pdf_result["pdf_path"], destination_path)
            
            # Keep original in pdfs folder for backup
            organized_pdf_path = destination_path
        except Exception as move_error:
            organized_pdf_path = pdf_result["pdf_path"]
            print(f"PDF organization warning: {move_error}")

        # Step 5: Create comprehensive client package
        client_package = {
            "client_name": company_name,
            "quote_number": quote_number,
            "email": client_email,
            "package": package,
            "total": total,
            "pdf_path": organized_pdf_path,
            "folder_path": folder_result["folder_path"],
            "created_date": datetime.datetime.now().isoformat(),
            "order_id": order_data.get('order_id', quote_number),
            "processing_method": "Local Folder System"
        }

        # Step 6: Save order details
        with open(os.path.join(folder_result["folder_path"], "order_details.json"), "w") as f:
            json.dump(client_package, f, indent=2)

        # Step 7: Log to Airtable (if available)
        try:
            import requests
            api_key = os.getenv("AIRTABLE_API_KEY")
            if api_key:
                webhook_data = {
                    "🧾 Function Name": "Complete Local Sales Order Processing",
                    "📝 Source Form": "Tally Sales Order Form",
                    "📅 Timestamp": datetime.datetime.now().isoformat(),
                    "📊 Dashboard Name": "Sales Automation",
                    "👤 Client": company_name,
                    "📧 Email": client_email,
                    "💰 Total": total,
                    "📦 Package": package,
                    "📁 Folder Path": folder_result["folder_path"],
                    "📄 PDF Path": organized_pdf_path,
                    "🔗 Quote Number": quote_number,
                    "🎯 Status": "Complete - Local Processing"
                }

                requests.post(
                    "https://api.airtable.com/v0/appRt8V3tH4g5Z5if/tbldPRZ4nHbtj9opU/",
                    headers={
                        "Authorization": f"Bearer {api_key.strip()}",
                        "Content-Type": "application/json"
                    },
                    json={"fields": webhook_data},
                    timeout=5
                )
        except Exception as log_error:
            print(f"Airtable logging failed: {log_error}")

        return {
            "success": True,
            "client_name": company_name,
            "quote_number": quote_number,
            "order_id": client_package["order_id"],
            "folder_path": folder_result["folder_path"],
            "pdf_path": organized_pdf_path,
            "email_sent": False,
            "processing_time": datetime.datetime.now().isoformat(),
            "method": "Complete Local Folder System",
            "folder_created": True,
            "pdf_organized": True
        }

    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # Test with sample data
    test_order = {
        "customer_name": "Local Test Company",
        "email": "test@localtest.com",
        "package": "Enterprise Local Package",
        "total": "$45000"
    }
    
    result = process_complete_local_sales_order(test_order)
    print(json.dumps(result, indent=2))