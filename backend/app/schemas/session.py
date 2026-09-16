from pydantic import BaseModel
from typing import Optional

class SessionCreate(BaseModel):
    caseId: str

class InstructionCreate(BaseModel):
    message: str

class SessionResponse(BaseModel):
    sessionId: str
    caseId: str
    workerId: str
    specialistId: Optional[str] = None
    status: str
    createdAt: str
    updatedAt: str
