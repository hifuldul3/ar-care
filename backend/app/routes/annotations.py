from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.annotation import AnnotationCreate, AnnotationStatusUpdate
from app.auth.dependencies import get_current_user, require_role
from app.database.firebase import get_db

router = APIRouter(prefix="/annotations", tags=["AR Annotations"])

@router.get("/cases/{case_id}", response_model=list[dict])
def get_case_annotations(case_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    annotations = db.query_collection("annotations", {"caseId": case_id})
    return sorted(annotations, key=lambda x: x.get("createdAt", ""))

@router.post("", response_model=dict)
def create_annotation(body: AnnotationCreate, current_user: dict = Depends(require_role(["specialist"]))):
    db = get_db()
    ann_id = f"AR-{int(datetime.utcnow().timestamp()*1000)}"
    ann_record = {
        "annotationId": ann_id,
        "caseId": body.caseId,
        "sessionId": body.sessionId,
        "x": body.x,
        "y": body.y,
        "message": body.message,
        "createdBy": current_user["id"],
        "status": "PENDING",
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat()
    }
    db.set_document("annotations", ann_id, ann_record)

    # Log action timeline
    action = {
        "id": f"ACT-{datetime.utcnow().timestamp()}",
        "caseId": body.caseId,
        "userId": current_user["id"],
        "role": "specialist",
        "action": "AR_MARKER_CREATED",
        "metadata": ann_record,
        "timestamp": datetime.utcnow().isoformat()
    }
    db.set_document("actions", action["id"], action)

    return ann_record

@router.put("/{annotation_id}/acknowledge", response_model=dict)
def acknowledge_annotation(annotation_id: str, current_user: dict = Depends(require_role(["worker"]))):
    db = get_db()
    ann = db.get_document("annotations", annotation_id)
    if not ann:
        raise HTTPException(status_code=404, detail="Annotation not found")

    ann["status"] = "ACKNOWLEDGED"
    ann["updatedAt"] = datetime.utcnow().isoformat()
    db.set_document("annotations", annotation_id, ann)

    action = {
        "id": f"ACT-{datetime.utcnow().timestamp()}",
        "caseId": ann["caseId"],
        "userId": current_user["id"],
        "role": "worker",
        "action": "AR_MARKER_ACKNOWLEDGED",
        "metadata": {"annotationId": annotation_id},
        "timestamp": datetime.utcnow().isoformat()
    }
    db.set_document("actions", action["id"], action)

    return ann

@router.put("/{annotation_id}/complete", response_model=dict)
def complete_annotation(annotation_id: str, current_user: dict = Depends(require_role(["worker"]))):
    db = get_db()
    ann = db.get_document("annotations", annotation_id)
    if not ann:
        raise HTTPException(status_code=404, detail="Annotation not found")

    ann["status"] = "COMPLETED"
    ann["updatedAt"] = datetime.utcnow().isoformat()
    db.set_document("annotations", annotation_id, ann)

    action = {
        "id": f"ACT-{datetime.utcnow().timestamp()}",
        "caseId": ann["caseId"],
        "userId": current_user["id"],
        "role": "worker",
        "action": "AR_MARKER_COMPLETED",
        "metadata": {"annotationId": annotation_id},
        "timestamp": datetime.utcnow().isoformat()
    }
    db.set_document("actions", action["id"], action)

    return ann
