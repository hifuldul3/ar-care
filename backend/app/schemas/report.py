from pydantic import BaseModel
from typing import Optional, Dict, Any, List

class ReportCreate(BaseModel):
    caseId: str
    additionalNotes: Optional[str] = ""

class ReportResponse(BaseModel):
    reportId: str
    caseId: str
    downloadUrl: str
    generatedAt: str
