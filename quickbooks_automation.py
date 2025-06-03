#!/usr/bin/env python3
"""
QuickBooks Online Automation
Complete financial automation with invoice generation, payment tracking, and reporting
"""

import os
import json
import requests
from datetime import datetime, timedelta
import base64

class QuickBooksAutomation:
    def __init__(self):
        self.client_id = "ABFKQruSPhRVxF89f0OfjopDH75UfGrCvswLR185exeZti85ep"
        self.client_secret = "E2TnUZabfdR7Ty2jV4d8R95VlD4Fl4GwoEaXjm17"
        self.access_token = os.getenv("QUICKBOOKS_ACCESS_TOKEN")
        self.refresh_token = os.getenv("QUICKBOOKS_REFRESH_TOKEN")
        self.realm_id = os.getenv("QUICKBOOKS_REALM_ID")
        self.sandbox_base_url = "https://sandbox-quickbooks.api.intuit.com"
        self.base_url = "https://quickbooks.api.intuit.com"
        
    def get_auth_headers(self):
        """Get authorization headers for API calls"""
        if not self.access_token:
            return None
        
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    def refresh_access_token(self):
        """Refresh expired access token"""
        if not self.refresh_token:
            return False
            
        try:
            auth_string = base64.b64encode(f"{self.client_id}:{self.client_secret}".encode()).decode()
            
            headers = {
                "Authorization": f"Basic {auth_string}",
                "Content-Type": "application/x-www-form-urlencoded"
            }
            
            data = {
                "grant_type": "refresh_token",
                "refresh_token": self.refresh_token
            }
            
            response = requests.post(
                "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
                headers=headers,
                data=data
            )
            
            if response.status_code == 200:
                tokens = response.json()
                self.access_token = tokens.get("access_token")
                if tokens.get("refresh_token"):
                    self.refresh_token = tokens.get("refresh_token")
                return True
                
        except Exception:
            pass
        
        return False
    
    def create_customer(self, customer_data):
        """Create or update customer in QuickBooks"""
        headers = self.get_auth_headers()
        if not headers or not self.realm_id:
            return {"success": False, "error": "QuickBooks not configured"}
        
        try:
            # Check if customer exists
            existing_customer = self.find_customer_by_email(customer_data.get("email"))
            if existing_customer:
                return {"success": True, "customer_id": existing_customer["Id"], "existing": True}
            
            customer_payload = {
                "Name": customer_data.get("name", "Unknown Customer"),
                "CompanyName": customer_data.get("company", ""),
                "PrimaryEmailAddr": {"Address": customer_data.get("email", "")},
                "PrimaryPhone": {"FreeFormNumber": customer_data.get("phone", "")},
                "BillAddr": {
                    "Line1": customer_data.get("address", ""),
                    "City": customer_data.get("city", ""),
                    "CountrySubDivisionCode": customer_data.get("state", ""),
                    "PostalCode": customer_data.get("zip", ""),
                    "Country": customer_data.get("country", "US")
                }
            }
            
            url = f"{self.base_url}/v3/company/{self.realm_id}/customer"
            response = requests.post(url, headers=headers, json=customer_payload)
            
            if response.status_code == 200:
                result = response.json()
                customer = result["QueryResponse"]["Customer"][0] if "QueryResponse" in result else result["Customer"]
                return {"success": True, "customer_id": customer["Id"], "existing": False}
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def find_customer_by_email(self, email):
        """Find customer by email address"""
        if not email:
            return None
            
        headers = self.get_auth_headers()
        if not headers or not self.realm_id:
            return None
        
        try:
            query = f"SELECT * FROM Customer WHERE PrimaryEmailAddr = '{email}'"
            url = f"{self.base_url}/v3/company/{self.realm_id}/query"
            response = requests.get(url, headers=headers, params={"query": query})
            
            if response.status_code == 200:
                result = response.json()
                customers = result.get("QueryResponse", {}).get("Customer", [])
                return customers[0] if customers else None
                
        except Exception:
            pass
        
        return None
    
    def create_invoice(self, invoice_data):
        """Create invoice in QuickBooks"""
        headers = self.get_auth_headers()
        if not headers or not self.realm_id:
            return {"success": False, "error": "QuickBooks not configured"}
        
        try:
            # Create or get customer
            customer_result = self.create_customer(invoice_data.get("customer", {}))
            if not customer_result["success"]:
                return customer_result
            
            customer_id = customer_result["customer_id"]
            
            # Create invoice payload
            line_items = []
            for item in invoice_data.get("line_items", []):
                line_items.append({
                    "Amount": item.get("amount", 0),
                    "DetailType": "SalesItemLineDetail",
                    "SalesItemLineDetail": {
                        "ItemRef": {"value": "1", "name": item.get("description", "Service")},
                        "UnitPrice": item.get("unit_price", item.get("amount", 0)),
                        "Qty": item.get("quantity", 1)
                    }
                })
            
            invoice_payload = {
                "CustomerRef": {"value": customer_id},
                "Line": line_items,
                "DueDate": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
                "TxnDate": datetime.now().strftime("%Y-%m-%d"),
                "DocNumber": invoice_data.get("invoice_number", f"INV-{int(datetime.now().timestamp())}"),
                "PrivateNote": invoice_data.get("notes", "Generated by YoBot Automation")
            }
            
            url = f"{self.base_url}/v3/company/{self.realm_id}/invoice"
            response = requests.post(url, headers=headers, json=invoice_payload)
            
            if response.status_code == 200:
                result = response.json()
                invoice = result["Invoice"]
                return {
                    "success": True,
                    "invoice_id": invoice["Id"],
                    "invoice_number": invoice.get("DocNumber"),
                    "total_amount": invoice.get("TotalAmt"),
                    "due_date": invoice.get("DueDate")
                }
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def record_payment(self, payment_data):
        """Record payment against invoice"""
        headers = self.get_auth_headers()
        if not headers or not self.realm_id:
            return {"success": False, "error": "QuickBooks not configured"}
        
        try:
            payment_payload = {
                "CustomerRef": {"value": payment_data.get("customer_id")},
                "TotalAmt": payment_data.get("amount", 0),
                "Line": [{
                    "Amount": payment_data.get("amount", 0),
                    "LinkedTxn": [{
                        "TxnId": payment_data.get("invoice_id"),
                        "TxnType": "Invoice"
                    }]
                }],
                "TxnDate": datetime.now().strftime("%Y-%m-%d"),
                "PaymentMethodRef": {"value": "1"},
                "PrivateNote": f"Payment processed via {payment_data.get('method', 'Online')}"
            }
            
            url = f"{self.base_url}/v3/company/{self.realm_id}/payment"
            response = requests.post(url, headers=headers, json=payment_payload)
            
            if response.status_code == 200:
                result = response.json()
                payment = result["Payment"]
                return {
                    "success": True,
                    "payment_id": payment["Id"],
                    "amount": payment.get("TotalAmt"),
                    "date": payment.get("TxnDate")
                }
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_company_info(self):
        """Get company information"""
        headers = self.get_auth_headers()
        if not headers or not self.realm_id:
            return {"success": False, "error": "QuickBooks not configured"}
        
        try:
            url = f"{self.base_url}/v3/company/{self.realm_id}/companyinfo/1"
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                result = response.json()
                company = result["QueryResponse"]["CompanyInfo"][0]
                return {
                    "success": True,
                    "company_name": company.get("CompanyName"),
                    "legal_name": company.get("LegalName"),
                    "email": company.get("Email", {}).get("Address"),
                    "phone": company.get("PrimaryPhone", {}).get("FreeFormNumber")
                }
            else:
                return {"success": False, "error": response.text}
                
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def get_financial_summary(self, start_date=None, end_date=None):
        """Get financial summary for reporting"""
        headers = self.get_auth_headers()
        if not headers or not self.realm_id:
            return {"success": False, "error": "QuickBooks not configured"}
        
        try:
            if not start_date:
                start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
            if not end_date:
                end_date = datetime.now().strftime("%Y-%m-%d")
            
            # Get recent invoices
            invoice_query = f"SELECT * FROM Invoice WHERE TxnDate >= '{start_date}' AND TxnDate <= '{end_date}'"
            invoice_url = f"{self.base_url}/v3/company/{self.realm_id}/query"
            invoice_response = requests.get(invoice_url, headers=headers, params={"query": invoice_query})
            
            # Get recent payments
            payment_query = f"SELECT * FROM Payment WHERE TxnDate >= '{start_date}' AND TxnDate <= '{end_date}'"
            payment_response = requests.get(invoice_url, headers=headers, params={"query": payment_query})
            
            invoices = []
            payments = []
            total_invoiced = 0
            total_paid = 0
            
            if invoice_response.status_code == 200:
                invoice_result = invoice_response.json()
                invoices = invoice_result.get("QueryResponse", {}).get("Invoice", [])
                total_invoiced = sum(float(inv.get("TotalAmt", 0)) for inv in invoices)
            
            if payment_response.status_code == 200:
                payment_result = payment_response.json()
                payments = payment_result.get("QueryResponse", {}).get("Payment", [])
                total_paid = sum(float(pay.get("TotalAmt", 0)) for pay in payments)
            
            return {
                "success": True,
                "period": {"start": start_date, "end": end_date},
                "summary": {
                    "total_invoiced": total_invoiced,
                    "total_paid": total_paid,
                    "outstanding": total_invoiced - total_paid,
                    "invoice_count": len(invoices),
                    "payment_count": len(payments)
                },
                "invoices": invoices[:10],  # Recent 10
                "payments": payments[:10]   # Recent 10
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def sync_stripe_payment_to_qbo(self, stripe_payment_data):
        """Sync Stripe payment to QuickBooks"""
        try:
            # Extract payment details
            customer_email = stripe_payment_data.get("customer_email")
            amount = stripe_payment_data.get("amount", 0) / 100  # Stripe uses cents
            description = stripe_payment_data.get("description", "Online Payment")
            
            # Find or create customer
            customer_result = self.create_customer({
                "name": stripe_payment_data.get("customer_name", "Online Customer"),
                "email": customer_email,
                "company": stripe_payment_data.get("customer_company", "")
            })
            
            if not customer_result["success"]:
                return customer_result
            
            # Create invoice if needed
            if stripe_payment_data.get("create_invoice", True):
                invoice_result = self.create_invoice({
                    "customer": {
                        "name": stripe_payment_data.get("customer_name", "Online Customer"),
                        "email": customer_email
                    },
                    "line_items": [{
                        "description": description,
                        "amount": amount,
                        "quantity": 1,
                        "unit_price": amount
                    }],
                    "invoice_number": f"STRIPE-{stripe_payment_data.get('payment_intent_id', '')}"
                })
                
                if invoice_result["success"]:
                    # Record payment against invoice
                    payment_result = self.record_payment({
                        "customer_id": customer_result["customer_id"],
                        "invoice_id": invoice_result["invoice_id"],
                        "amount": amount,
                        "method": "Credit Card (Stripe)"
                    })
                    
                    return {
                        "success": True,
                        "invoice_id": invoice_result["invoice_id"],
                        "payment_id": payment_result.get("payment_id"),
                        "amount": amount
                    }
            
            return {"success": False, "error": "Failed to process payment"}
            
        except Exception as e:
            return {"success": False, "error": str(e)}

def test_quickbooks_integration():
    """Test QuickBooks integration"""
    qb = QuickBooksAutomation()
    
    print("Testing QuickBooks Integration...")
    
    # Test company info
    company_info = qb.get_company_info()
    print(f"Company Info: {company_info}")
    
    # Test customer creation
    test_customer = {
        "name": "Test Customer",
        "email": "test@example.com",
        "company": "Test Company",
        "phone": "555-1234"
    }
    
    customer_result = qb.create_customer(test_customer)
    print(f"Customer Creation: {customer_result}")
    
    # Test invoice creation
    if customer_result.get("success"):
        test_invoice = {
            "customer": test_customer,
            "line_items": [{
                "description": "YoBot Automation Service",
                "amount": 100.00,
                "quantity": 1,
                "unit_price": 100.00
            }],
            "notes": "Test invoice from automation system"
        }
        
        invoice_result = qb.create_invoice(test_invoice)
        print(f"Invoice Creation: {invoice_result}")
    
    # Test financial summary
    summary = qb.get_financial_summary()
    print(f"Financial Summary: {summary}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "test":
            test_quickbooks_integration()
        elif sys.argv[1] == "sync-stripe" and len(sys.argv) > 2:
            stripe_data = json.loads(sys.argv[2])
            qb = QuickBooksAutomation()
            result = qb.sync_stripe_payment_to_qbo(stripe_data)
            print(json.dumps(result))
    else:
        qb = QuickBooksAutomation()
        summary = qb.get_financial_summary()
        print(json.dumps(summary))