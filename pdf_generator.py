from fpdf import FPDF
import os
import json
from datetime import datetime

def generate_pdf_from_fields(submission_id, fields_array):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    HIDDEN_FIELD_KEYWORDS = [
        "Multiplier", "Trigger", "Test Mode", "Always On", "First Month Total", "Bot Package Base Price", "Initialize"
    ]

    # Add header
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "YoBot Sales Order", ln=True, align="C")
    pdf.ln(5)
    
    pdf.set_font("Arial", size=10)
    pdf.cell(0, 10, f"Submission ID: {submission_id}", ln=True)
    pdf.cell(0, 10, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
    pdf.ln(10)
    
    pdf.set_font("Arial", size=12)

    for field in fields_array:
        name = field["name"]
        value = field["value"]
        if any(k in name for k in HIDDEN_FIELD_KEYWORDS):
            continue
        pdf.multi_cell(0, 10, f"{name}:\n{value}\n", border=0)

    folder_path = f"submissions/{submission_id}"
    os.makedirs(folder_path, exist_ok=True)
    file_path = f"{folder_path}/submission.pdf"
    pdf.output(file_path)

    return file_path