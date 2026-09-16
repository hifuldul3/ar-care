from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.case import CaseCreate, SpecialistRequest, CaseResponse
from app.auth.dependencies import get_current_user, require_role
from app.services.case_service import CaseService
from app.database.firebase import get_db

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.post("", response_model=dict)
def create_case(case_data: CaseCreate, current_user: dict = Depends(require_role(["worker"]))):
    created = CaseService.create_case(case_data.model_dump(), current_user["id"])
    return created

@router.get("", response_model=list[dict])
def list_cases(current_user: dict = Depends(get_current_user)):
    return CaseService.list_cases(worker_id=current_user["id"], role=current_user["role"])

@router.get("/{case_id}", response_model=dict)
def get_case_details(case_id: str, current_user: dict = Depends(get_current_user)):
    case = CaseService.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.put("/{case_id}", response_model=dict)
def update_case(case_id: str, case_data: dict, current_user: dict = Depends(get_current_user)):
    db = get_db()
    existing = db.get_document("cases", case_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Case not found")
    existing.update(case_data)
    db.set_document("cases", case_id, existing)
    return existing

@router.post("/{case_id}/specialist-request", response_model=dict)
def request_specialist(case_id: str, req: SpecialistRequest = None, current_user: dict = Depends(require_role(["worker"]))):
    reason = req.urgencyReason if req else "Worker requested specialist review"
    updated = CaseService.request_specialist(case_id, current_user["id"], reason)
    if not updated:
        raise HTTPException(status_code=404, detail="Case not found")
    return updated

@router.get("/{case_id}/timeline", response_model=list[dict])
def get_case_timeline(case_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    actions = db.query_collection("actions", {"caseId": case_id})
    return sorted(actions, key=lambda x: x.get("timestamp", ""))
