import os
import datetime
from weasyprint import HTML, CSS
from weasyprint.text.fonts import FontConfiguration

def generate_enhanced_quote_pdf(company_name, quote_number, email, package, total, add_ons=None):
    """
    Generate enhanced PDF quote using HTML templates and WeasyPrint
    """
    try:
        # Ensure pdfs directory exists
        pdf_dir = "/home/runner/workspace/pdfs"
        os.makedirs(pdf_dir, exist_ok=True)
        
        # Package pricing
        package_prices = {
            "YoBot Standard Package": 25000,
            "YoBot Professional Package": 75000,
            "YoBot Platinum Package": 125000,
            "YoBot Enterprise Package": 185000
        }
        
        # Add-on pricing
        addon_prices = {
            "SmartSpend": 15000,
            "Advanced Analytics": 10000,
            "A/B Testing": 8000,
            "Custom Integration": 20000
        }
        
        # Calculate pricing
        base_price = package_prices.get(package, 0)
        addon_total = 0
        addon_details = []
        
        if add_ons:
            for addon in add_ons:
                if addon in addon_prices:
                    addon_total += addon_prices[addon]
                    addon_details.append({
                        "name": addon,
                        "price": addon_prices[addon]
                    })
        
        calculated_total = base_price + addon_total
        
        # HTML template with professional styling
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>YoBot Quote - {quote_number}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
                
                * {{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }}
                
                body {{
                    font-family: 'Inter', Arial, sans-serif;
                    color: #1f2937;
                    line-height: 1.6;
                    background: #ffffff;
                }}
                
                .container {{
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px;
                }}
                
                .header {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 50px;
                    padding-bottom: 30px;
                    border-bottom: 3px solid #3b82f6;
                }}
                
                .logo {{
                    font-size: 32px;
                    font-weight: 700;
                    color: #3b82f6;
                    letter-spacing: -1px;
                }}
                
                .quote-info {{
                    text-align: right;
                    color: #6b7280;
                }}
                
                .quote-number {{
                    font-size: 24px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 5px;
                }}
                
                .client-section {{
                    background: #f8fafc;
                    padding: 30px;
                    border-radius: 12px;
                    margin-bottom: 40px;
                    border-left: 4px solid #3b82f6;
                }}
                
                .client-title {{
                    font-size: 20px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 15px;
                }}
                
                .client-info {{
                    font-size: 16px;
                    color: #4b5563;
                }}
                
                .package-section {{
                    margin: 40px 0;
                }}
                
                .section-title {{
                    font-size: 24px;
                    font-weight: 600;
                    color: #1f2937;
                    margin-bottom: 25px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #e5e7eb;
                }}
                
                .package-card {{
                    background: #ffffff;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    padding: 30px;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }}
                
                .package-name {{
                    font-size: 20px;
                    font-weight: 600;
                    color: #3b82f6;
                    margin-bottom: 15px;
                }}
                
                .package-features {{
                    list-style: none;
                    margin: 20px 0;
                }}
                
                .package-features li {{
                    padding: 8px 0;
                    color: #4b5563;
                    position: relative;
                    padding-left: 25px;
                }}
                
                .package-features li:before {{
                    content: "✓";
                    color: #10b981;
                    font-weight: bold;
                    position: absolute;
                    left: 0;
                }}
                
                .addon-item {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 15px 0;
                    border-bottom: 1px solid #e5e7eb;
                }}
                
                .addon-name {{
                    font-weight: 500;
                    color: #1f2937;
                }}
                
                .addon-price {{
                    font-weight: 600;
                    color: #3b82f6;
                }}
                
                .pricing-summary {{
                    background: #f0f9ff;
                    border: 2px solid #3b82f6;
                    border-radius: 12px;
                    padding: 30px;
                    margin-top: 40px;
                }}
                
                .price-row {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    font-size: 16px;
                }}
                
                .total-row {{
                    border-top: 2px solid #3b82f6;
                    margin-top: 15px;
                    padding-top: 15px;
                    font-size: 24px;
                    font-weight: 700;
                    color: #1f2937;
                }}
                
                .footer {{
                    margin-top: 60px;
                    padding-top: 30px;
                    border-top: 2px solid #e5e7eb;
                    text-align: center;
                    color: #6b7280;
                    font-size: 14px;
                }}
                
                .terms {{
                    background: #fef3c7;
                    border: 1px solid #f59e0b;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 30px 0;
                    font-size: 14px;
                    color: #92400e;
                }}
                
                @page {{
                    size: A4;
                    margin: 1cm;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">YoBot</div>
                    <div class="quote-info">
                        <div class="quote-number">{quote_number}</div>
                        <div>{datetime.datetime.now().strftime('%B %d, %Y')}</div>
                    </div>
                </div>
                
                <div class="client-section">
                    <div class="client-title">Prepared For:</div>
                    <div class="client-info">
                        <strong>{company_name}</strong><br>
                        {email}
                    </div>
                </div>
                
                <div class="package-section">
                    <div class="section-title">Selected Package</div>
                    <div class="package-card">
                        <div class="package-name">{package}</div>
                        <ul class="package-features">
                            <li>AI-Powered Voice Bot System</li>
                            <li>CRM Integration (HubSpot, QuickBooks)</li>
                            <li>Automated Lead Processing</li>
                            <li>Real-time Analytics Dashboard</li>
                            <li>24/7 System Monitoring</li>
                            <li>Professional Onboarding & Training</li>
                            <li>Dedicated Support Team</li>
                        </ul>
                    </div>
                </div>
        """
        
        # Add addons section if applicable
        if addon_details:
            html_content += """
                <div class="package-section">
                    <div class="section-title">Selected Add-ons</div>
                    <div class="package-card">
            """
            for addon in addon_details:
                html_content += f"""
                        <div class="addon-item">
                            <div class="addon-name">{addon['name']}</div>
                            <div class="addon-price">${addon['price']:,}</div>
                        </div>
                """
            html_content += """
                    </div>
                </div>
            """
        
        # Add pricing summary
        html_content += f"""
                <div class="pricing-summary">
                    <div class="price-row">
                        <span>Base Package:</span>
                        <span>${base_price:,}</span>
                    </div>
        """
        
        if addon_total > 0:
            html_content += f"""
                    <div class="price-row">
                        <span>Add-ons Total:</span>
                        <span>${addon_total:,}</span>
                    </div>
            """
        
        html_content += f"""
                    <div class="price-row total-row">
                        <span>Total Investment:</span>
                        <span>${calculated_total:,}</span>
                    </div>
                </div>
                
                <div class="terms">
                    <strong>Terms & Conditions:</strong><br>
                    • Quote valid for 30 days from issue date<br>
                    • 50% deposit required to commence implementation<br>
                    • Full system deployment within 14 business days<br>
                    • 12-month warranty included on all services<br>
                    • Training and documentation provided
                </div>
                
                <div class="footer">
                    <p>YoBot Automation Systems | Email: contact@yobot.bot | Phone: (555) 123-4567</p>
                    <p>Professional AI automation solutions for modern businesses</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Generate PDF filename
        filename = f"YoBot_Quote_{quote_number}_{company_name.replace(' ', '_')}.pdf"
        pdf_path = os.path.join(pdf_dir, filename)
        
        # Create PDF from HTML
        font_config = FontConfiguration()
        html_doc = HTML(string=html_content)
        html_doc.write_pdf(pdf_path, font_config=font_config)
        
        return {
            "success": True,
            "pdf_path": pdf_path,
            "filename": filename,
            "calculated_total": calculated_total,
            "base_price": base_price,
            "addon_total": addon_total
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }