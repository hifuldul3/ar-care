from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.vitals import VitalsCreate
from app.auth.dependencies import get_current_user, require_role
from app.database.firebase import get_db
from app.ai.assessment import run_ai_assessment

router = APIRouter(prefix="/cases", tags=["Vitals"])

@router.post("/{case_id}/vitals", response_model=dict)
def update_vitals(case_id: str, vitals_data: VitalsCreate, current_user: dict = Depends(require_role(["worker"]))):
    db = get_db()
    case = db.get_document("cases", case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case["vitals"] = vitals_data.model_dump()
    case["updatedAt"] = datetime.utcnow().isoformat()

    # Re-run AI assessment with updated vitals
    assessment = run_ai_assessment(case)
    case["aiAssessment"] = assessment
    case["priority"] = assessment["priority"]
    case["completeness"] = assessment["completeness"]
    case["missingFields"] = assessment["missing_fields"]

    db.set_document("cases", case_id, case)

    # Log action
    action = {
        "id": f"ACT-{datetime.utcnow().timestamp()}",
        "caseId": case_id,
        "userId": current_user["id"],
        "role": "worker",
        "action": "VITALS_UPDATED",
        "metadata": vitals_data.model_dump(),
        "timestamp": datetime.utcnow().isoformat()
    }
    db.set_document("actions", action["id"], action)

    return case
