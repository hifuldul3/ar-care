from pydantic import BaseModel, Field
from typing import Optional

class VitalsCreate(BaseModel):
    spO2: float = Field(..., ge=50, le=100)
    heartRate: float = Field(..., ge=30, le=250)
    respiratoryRate: float = Field(..., ge=5, le=70)
    temperature: float = Field(..., ge=30.0, le=45.0)
    bloodPressure: str = Field(..., pattern=r"^\d{2,3}/\d{2,3}$")

class VitalsResponse(BaseModel):
    spO2: float
    heartRate: float
    respiratoryRate: float
    temperature: float
    bloodPressure: str
    recordedAt: str
