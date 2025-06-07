#!/usr/bin/env python3
"""
PDF Generator for Tally Form Submissions
Creates professional PDFs from form field data
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors

def generate_pdf_from_fields(fields, submission_id, output_path):
    """Generate PDF from form fields"""
    
    # Ensure directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Create PDF document
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                          rightMargin=72, leftMargin=72,
                          topMargin=72, bottomMargin=18)
    
    # Get styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Heading1'],
                                fontSize=24, spaceAfter=30, textColor=colors.darkblue)
    
    # Build PDF content
    story = []
    
    # Title
    title = Paragraph("YoBot Order Submission", title_style)
    story.append(title)
    story.append(Spacer(1, 20))
    
    # Submission info
    info_data = [
        ['Submission ID:', submission_id],
        ['Generated:', f"{os.path.basename(output_path)}"]
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(info_table)
    story.append(Spacer(1, 30))
    
    # Form fields
    if fields:
        field_title = Paragraph("Form Submission Details", styles['Heading2'])
        story.append(field_title)
        story.append(Spacer(1, 15))
        
        # Create table for fields
        field_data = [['Field', 'Value']]
        
        for field in fields:
            field_name = field.get('label', field.get('key', 'Unknown'))
            field_value = str(field.get('value', ''))
            
            # Clean up field names
            if field_name.startswith('question_'):
                field_name = field_name.split('_', 1)[1] if '_' in field_name else field_name
            
            field_data.append([field_name, field_value])
        
        field_table = Table(field_data, colWidths=[2.5*inch, 3.5*inch])
        field_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        
        story.append(field_table)
    
    # Build PDF
    doc.build(story)
    return output_path

if __name__ == "__main__":
    # Test PDF generation
    test_fields = [
        {"key": "company", "label": "Company Name", "value": "Test Company"},
        {"key": "email", "label": "Email", "value": "test@company.com"}
    ]
    
    output = "test_submission.pdf"
    generate_pdf_from_fields(test_fields, "test123", output)
    print(f"Test PDF generated: {output}")