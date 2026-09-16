from pydantic import BaseModel, Field
from typing import Optional

class AnnotationCreate(BaseModel):
    caseId: str
    sessionId: str
    x: float = Field(..., ge=0.0, le=100.0)
    y: float = Field(..., ge=0.0, le=100.0)
    message: str = Field(..., min_length=1)

class AnnotationStatusUpdate(BaseModel):
    status: str  # "ACKNOWLEDGED" or "COMPLETED"

class AnnotationResponse(BaseModel):
    annotationId: str
    caseId: str
    sessionId: str
    x: float
    y: float
    message: str
    createdBy: str
    status: str
    createdAt: str
    updatedAt: str
