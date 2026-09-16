import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from app.schemas.report import ReportCreate
from app.auth.dependencies import get_current_user
from app.services.report_service import ReportService
from app.database.firebase import get_db

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.post("/cases/{case_id}/report", response_model=dict)
def generate_report(case_id: str, req: ReportCreate = None, current_user: dict = Depends(get_current_user)):
    notes = req.additionalNotes if req else ""
    try:
        filename = ReportService.generate_pdf_report(case_id, current_user["id"], notes)
        return {
            "caseId": case_id,
            "filename": filename,
            "downloadUrl": f"/reports/download/{filename}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate report: {str(e)}")

@router.get("/download/{filename}")
def download_pdf(filename: str):
    report_dir = os.path.join(os.getcwd(), "generated_reports")
    file_path = os.path.join(report_dir, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Report file not found")
    return FileResponse(file_path, media_type="application/pdf", filename=filename)
