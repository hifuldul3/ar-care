from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.auth.dependencies import get_current_user
from app.database.firebase import get_db
from app.ai.assessment import run_ai_assessment

router = APIRouter(prefix="/cases", tags=["AI Assessment"])

@router.post("/{case_id}/analyze", response_model=dict)
def analyze_case(case_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    case = db.get_document("cases", case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    assessment = run_ai_assessment(case)
    case["aiAssessment"] = assessment
    case["priority"] = assessment["priority"]
    case["completeness"] = assessment["completeness"]
    case["missingFields"] = assessment["missing_fields"]
    case["updatedAt"] = datetime.utcnow().isoformat()

    db.set_document("cases", case_id, case)
    db.set_document("ai_assessments", f"AI-{case_id}", {
        "caseId": case_id,
        "assessment": assessment,
        "createdAt": datetime.utcnow().isoformat()
    })

    # Log action
    action = {
        "id": f"ACT-{datetime.utcnow().timestamp()}",
        "caseId": case_id,
        "userId": current_user["id"],
        "role": current_user["role"],
        "action": "AI_ANALYSIS_COMPLETED",
        "metadata": {"priority": assessment["priority"]},
        "timestamp": datetime.utcnow().isoformat()
    }
    db.set_document("actions", action["id"], action)

    return assessment
