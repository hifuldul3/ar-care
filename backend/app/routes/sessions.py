from fastapi import APIRouter, Depends, HTTPException
from app.schemas.session import SessionCreate, InstructionCreate
from app.auth.dependencies import get_current_user
from app.services.session_service import SessionService
from app.database.firebase import get_db

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.post("", response_model=dict)
def create_or_join_session(body: SessionCreate, current_user: dict = Depends(get_current_user)):
    return SessionService.get_or_create_session(body.caseId, current_user["id"], current_user["role"])

@router.get("/{session_id}", response_model=dict)
def get_session(session_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    session = db.get_document("sessions", session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/{session_id}/instructions", response_model=dict)
def send_session_instruction(session_id: str, body: InstructionCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    session = db.get_document("sessions", session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    instruction_data = {
        "id": f"INST-{int(datetime.utcnow().timestamp()*1000)}",
        "sessionId": session_id,
        "caseId": session["caseId"],
        "message": body.message,
        "sentBy": current_user["id"],
        "status": "PENDING",
        "timestamp": datetime.utcnow().isoformat()
    }
    db.set_document("actions", instruction_data["id"], {
        "id": instruction_data["id"],
        "caseId": session["caseId"],
        "userId": current_user["id"],
        "role": current_user["role"],
        "action": "INSTRUCTION_SENT",
        "metadata": {"message": body.message},
        "timestamp": datetime.utcnow().isoformat()
    })

    return instruction_data
