from pydantic import BaseModel, Field
from typing import Optional

class PatientCreate(BaseModel):
    patientId: Optional[str] = None
    name: str = Field(..., min_length=1)
    age: int = Field(..., ge=0, le=130)
    gender: str

class PatientResponse(BaseModel):
    patientId: str
    name: str
    age: int
    gender: str
    createdAt: str
