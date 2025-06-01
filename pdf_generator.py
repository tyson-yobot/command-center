#!/usr/bin/env python3
"""
PDF Generator for SOPs and Documentation
Generates PDF documents from HTML content using Puppeteer service
"""

import os
import requests
import json
from datetime import datetime

def generate_sop_pdf(sop_content, title, output_filename=None):
    """
    Generate PDF from SOP content using Puppeteer service
    """
    try:
        pdf_service_url = os.getenv("PDF_SERVICE_URL", "https://pdf-service.yobot.com")
        
        if not output_filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"sop_{title.replace(' ', '_')}_{timestamp}.pdf"
        
        # Create HTML template for SOP
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 40px;
                }}
                .header {{
                    text-align: center;
                    border-bottom: 2px solid #333;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }}
                .content {{
                    margin-bottom: 30px;
                }}
                .footer {{
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    font-size: 12px;
                    color: #666;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>{title}</h1>
                <p>Generated on {datetime.now().strftime("%B %d, %Y at %I:%M %p")}</p>
            </div>
            <div class="content">
                {sop_content}
            </div>
            <div class="footer">
                YoBot Standard Operating Procedure
            </div>
        </body>
        </html>
        """
        
        # Send to PDF service
        payload = {
            "html": html_content,
            "filename": output_filename,
            "options": {
                "format": "A4",
                "printBackground": True,
                "margin": {
                    "top": "1in",
                    "bottom": "1in",
                    "left": "1in",
                    "right": "1in"
                }
            }
        }
        
        response = requests.post(
            f"{pdf_service_url}/render",
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            # Save PDF file
            pdf_path = os.path.join("pdfs", output_filename)
            os.makedirs("pdfs", exist_ok=True)
            
            with open(pdf_path, 'wb') as f:
                f.write(response.content)
            
            print(f"PDF generated successfully: {pdf_path}")
            
            return {
                "success": True,
                "message": f"PDF generated: {output_filename}",
                "file_path": pdf_path
            }
        else:
            return {
                "success": False,
                "message": f"PDF generation failed: {response.status_code}"
            }
            
    except Exception as e:
        return {
            "success": False,
            "message": f"PDF generation error: {str(e)}"
        }

def export_knowledge_base_to_pdf(knowledge_entries):
    """
    Export entire knowledge base to PDF for archiving
    """
    try:
        html_content = "<h2>Knowledge Base Export</h2>"
        
        for entry in knowledge_entries:
            html_content += f"""
            <div style="margin-bottom: 30px; page-break-inside: avoid;">
                <h3>{entry.get('title', 'Untitled')}</h3>
                <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #007cba;">
                    {entry.get('content', 'No content available')}
                </div>
                <p style="font-size: 12px; color: #666;">
                    Tags: {', '.join(entry.get('tags', []))} | 
                    Last Updated: {entry.get('timestamp', 'Unknown')}
                </p>
            </div>
            """
        
        return generate_sop_pdf(
            html_content,
            "Knowledge Base Export",
            f"knowledge_base_{datetime.now().strftime('%Y%m%d')}.pdf"
        )
        
    except Exception as e:
        return {
            "success": False,
            "message": f"Knowledge base export error: {str(e)}"
        }

if __name__ == "__main__":
    # Test PDF generation
    test_sop = """
    <h2>Test Standard Operating Procedure</h2>
    <p>This is a test SOP for the PDF generation system.</p>
    <ol>
        <li>Step one of the procedure</li>
        <li>Step two of the procedure</li>
        <li>Step three of the procedure</li>
    </ol>
    """
    
    result = generate_sop_pdf(test_sop, "Test SOP", "test_sop.pdf")
    print(result)