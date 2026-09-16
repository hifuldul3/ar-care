import os
from datetime import datetime
from app.database.firebase import get_db

class ReportService:
    @staticmethod
    def generate_pdf_report(case_id: str, user_id: str, additional_notes: str = "") -> str:
        db = get_db()
        case = db.get_document("cases", case_id)
        if not case:
            raise ValueError(f"Case {case_id} not found")

        actions = db.query_collection("actions", {"caseId": case_id})
        annotations = db.query_collection("annotations", {"caseId": case_id})
        
        # Sort timeline actions by timestamp
        actions = sorted(actions, key=lambda x: x.get("timestamp", ""))

        patient = case.get("patient", {})
        vitals = case.get("vitals", {})
        assessment = case.get("aiAssessment", {})

        report_dir = os.path.join(os.getcwd(), "generated_reports")
        os.makedirs(report_dir, exist_ok=True)
        pdf_filename = f"Report_{case_id}_{int(datetime.utcnow().timestamp())}.pdf"
        pdf_path = os.path.join(report_dir, pdf_filename)

        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib import colors

            doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
            styles = getSampleStyleSheet()

            title_style = ParagraphStyle(
                'DocTitle',
                parent=styles['Heading1'],
                fontSize=22,
                leading=26,
                textColor=colors.HexColor('#0284c7'),
                spaceAfter=6
            )
            header_style = ParagraphStyle(
                'DocHeader',
                parent=styles['Heading2'],
                fontSize=14,
                leading=18,
                textColor=colors.HexColor('#0f172a'),
                spaceBefore=12,
                spaceAfter=6
            )
            body_style = ParagraphStyle(
                'Body',
                parent=styles['Normal'],
                fontSize=10,
                leading=14,
                textColor=colors.HexColor('#334155')
            )

            story = []

            # Title Header
            story.append(Paragraph("AR-CARE LINK - CLINICAL CASE REPORT", title_style))
            story.append(Paragraph("Frontline Remote Decision-Support & Shared AR Guidance Summary", body_style))
            story.append(Spacer(1, 10))
            story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=15))

            # Patient & Case Info Table
            info_data = [
                [Paragraph("<b>Case ID:</b>", body_style), Paragraph(case_id, body_style),
                 Paragraph("<b>Generated Date:</b>", body_style), Paragraph(datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"), body_style)],
                [Paragraph("<b>Patient Name:</b>", body_style), Paragraph(str(patient.get("name")), body_style),
                 Paragraph("<b>Age / Gender:</b>", body_style), Paragraph(f"{patient.get('age')} / {patient.get('gender')}", body_style)],
                [Paragraph("<b>Worker ID:</b>", body_style), Paragraph(str(case.get("workerId")), body_style),
                 Paragraph("<b>Specialist ID:</b>", body_style), Paragraph(str(case.get("specialistId") or "Unassigned"), body_style)],
                [Paragraph("<b>Status:</b>", body_style), Paragraph(str(case.get("status")), body_style),
                 Paragraph("<b>Priority:</b>", body_style), Paragraph(f"<b>{case.get('priority')}</b>", body_style)]
            ]
            t_info = Table(info_data, colWidths=[100, 160, 100, 160])
            t_info.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(t_info)
            story.append(Spacer(1, 15))

            # Clinical Presentation & Vitals
            story.append(Paragraph("1. Symptoms & Baseline Vitals", header_style))
            vitals_data = [
                [Paragraph("<b>Symptoms Reported:</b>", body_style), Paragraph(str(case.get("symptoms")), body_style)],
                [Paragraph("<b>SpO2 Saturation:</b>", body_style), Paragraph(f"{vitals.get('spO2')}%", body_style)],
                [Paragraph("<b>Heart Rate:</b>", body_style), Paragraph(f"{vitals.get('heartRate')} bpm", body_style)],
                [Paragraph("<b>Respiratory Rate:</b>", body_style), Paragraph(f"{vitals.get('respiratoryRate')} rpm", body_style)],
                [Paragraph("<b>Blood Pressure:</b>", body_style), Paragraph(f"{vitals.get('bloodPressure')} mmHg", body_style)],
                [Paragraph("<b>Body Temperature:</b>", body_style), Paragraph(f"{vitals.get('temperature')} °C", body_style)],
            ]
            t_vitals = Table(vitals_data, colWidths=[150, 370])
            t_vitals.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('PADDING', (0,0), (-1,-1), 5),
            ]))
            story.append(t_vitals)
            story.append(Spacer(1, 15))

            # AI Assessment Section
            story.append(Paragraph("2. AI Decision Support & Risk Stratification", header_style))
            reasons_str = "<br/>• ".join(assessment.get("reasons", ["None"]))
            missing_str = ", ".join(assessment.get("missing_information", ["None"]))
            
            ai_data = [
                [Paragraph("<b>Assessment Classification:</b>", body_style), Paragraph(f"<b>{assessment.get('priority')}</b>", body_style)],
                [Paragraph("<b>Flagged Observations:</b>", body_style), Paragraph(f"• {reasons_str}", body_style)],
                [Paragraph("<b>Missing Information:</b>", body_style), Paragraph(missing_str, body_style)],
                [Paragraph("<b>Recommended Action:</b>", body_style), Paragraph(str(assessment.get("recommended_action")), body_style)],
            ]
            t_ai = Table(ai_data, colWidths=[150, 370])
            t_ai.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0f9ff')),
                ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#bae6fd')),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            story.append(t_ai)
            story.append(Spacer(1, 15))

            # AR Annotations & Instructions
            if annotations:
                story.append(Paragraph("3. Specialist AR Annotations & Instructions", header_style))
                ann_rows = [[Paragraph("<b>Marker ID</b>", body_style), Paragraph("<b>Coordinates (X%, Y%)</b>", body_style), Paragraph("<b>Instruction</b>", body_style), Paragraph("<b>Status</b>", body_style)]]
                for ann in annotations:
                    ann_rows.append([
                        Paragraph(ann.get("annotationId", "AR"), body_style),
                        Paragraph(f"({ann.get('x')}%, {ann.get('y')}%)", body_style),
                        Paragraph(ann.get("message", ""), body_style),
                        Paragraph(f"<b>{ann.get('status')}</b>", body_style)
                    ])
                t_ann = Table(ann_rows, colWidths=[80, 120, 220, 100])
                t_ann.setStyle(TableStyle([
                    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0284c7')),
                    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
                    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
                    ('PADDING', (0,0), (-1,-1), 5),
                ]))
                story.append(t_ann)
                story.append(Spacer(1, 15))

            # Action Audit Timeline
            story.append(Paragraph("4. Session Action Audit Timeline", header_style))
            act_rows = [[Paragraph("<b>Timestamp</b>", body_style), Paragraph("<b>Role</b>", body_style), Paragraph("<b>Action Event</b>", body_style)]]
            for act in actions:
                act_rows.append([
                    Paragraph(act.get("timestamp", "")[:19].replace("T", " "), body_style),
                    Paragraph(str(act.get("role")).upper(), body_style),
                    Paragraph(str(act.get("action")), body_style)
                ])
            t_act = Table(act_rows, colWidths=[140, 80, 300])
            t_act.setStyle(TableStyle([
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
                ('PADDING', (0,0), (-1,-1), 4),
            ]))
            story.append(t_act)
            story.append(Spacer(1, 20))

            # Safety Disclaimer
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#94a3b8'), spaceAfter=10))
            disclaimer_text = "<b>Healthcare Safety Disclaimer:</b> AR-CARE LINK is a prototype system for remote assistance and clinical decision-support. AI outputs are not medical diagnoses and must not replace professional clinical judgment."
            story.append(Paragraph(disclaimer_text, ParagraphStyle('Disc', parent=body_style, fontSize=8, textColor=colors.HexColor('#64748b'))))

            doc.build(story)
        except Exception as e:
            # Fallback text file generation if ReportLab encounters any issues
            with open(pdf_path, "w", encoding="utf-8") as f:
                f.write(f"AR-CARE LINK CASE REPORT - {case_id}\n")
                f.write(f"Generated At: {datetime.utcnow().isoformat()}\n\n")
                f.write(f"Patient: {patient.get('name')} ({patient.get('age')} y/o {patient.get('gender')})\n")
                f.write(f"Symptoms: {case.get('symptoms')}\n")
                f.write(f"Vitals: SpO2 {vitals.get('spO2')}% | HR {vitals.get('heartRate')} bpm | RR {vitals.get('respiratoryRate')} rpm\n")
                f.write(f"AI Assessment: {assessment.get('priority')}\n")
                f.write(f"Reasons: {', '.join(assessment.get('reasons', []))}\n")

        # Record Report document
        report_id = f"RPT-{int(datetime.utcnow().timestamp())}"
        report_record = {
            "reportId": report_id,
            "caseId": case_id,
            "filename": pdf_filename,
            "filepath": pdf_path,
            "generatedBy": user_id,
            "generatedAt": datetime.utcnow().isoformat()
        }
        db.set_document("reports", report_id, report_record)

        return pdf_filename
