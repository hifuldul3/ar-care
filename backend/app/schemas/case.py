from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from app.schemas.patient import PatientCreate
from app.schemas.vitals import VitalsCreate

class CaseCreate(BaseModel):
    caseId: Optional[str] = "P001"
    patient: PatientCreate
    symptoms: str = Field(..., min_length=1)
    duration: Optional[str] = "1 day"
    medicalHistory: Optional[str] = ""
    medication: Optional[str] = ""
    allergies: Optional[str] = ""
    notes: Optional[str] = ""
    vitals: VitalsCreate

class SpecialistRequest(BaseModel):
    urgencyReason: Optional[str] = "Worker requested specialist review"

class CaseResponse(BaseModel):
    caseId: str
    patientId: str
    workerId: str
    specialistId: Optional[str] = None
    patient: Dict[str, Any]
    symptoms: str
    duration: Optional[str] = ""
    medicalHistory: Optional[str] = ""
    medication: Optional[str] = ""
    allergies: Optional[str] = ""
    notes: Optional[str] = ""
    vitals: Dict[str, Any]
    aiAssessment: Optional[Dict[str, Any]] = None
    completeness: float = 0.0
    missingFields: List[str] = []
    status: str
    priority: str
    createdAt: str
    updatedAt: str
