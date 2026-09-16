from datetime import datetime
from app.database.firebase import get_db

async def handle_websocket_message(session_id: str, data: dict, sender_user_id: str, sender_role: str) -> dict:
    """
    Processes incoming WebSocket messages and updates persistent state if required.
    """
    msg_type = data.get("type")
    db = get_db()
    now_iso = datetime.utcnow().isoformat()

    # Log action to audit timeline if applicable
    if msg_type in ["AR_MARKER", "INSTRUCTION", "ACKNOWLEDGED", "COMPLETED", "SESSION_STARTED", "SESSION_ENDED"]:
        case_id = data.get("caseId")
        if not case_id:
            session = db.get_document("sessions", session_id)
            case_id = session.get("caseId") if session else "UNKNOWN"

        action_entry = {
            "id": f"ACT-{now_iso}",
            "caseId": case_id,
            "userId": sender_user_id,
            "role": sender_role,
            "action": msg_type,
            "metadata": data,
            "timestamp": now_iso
        }
        db.set_document("actions", action_entry["id"], action_entry)

    # Specific AR marker handling
    if msg_type == "AR_MARKER":
        annotation_id = data.get("annotationId") or f"AR-{int(datetime.utcnow().timestamp()*1000)}"
        annotation_data = {
            "annotationId": annotation_id,
            "caseId": data.get("caseId"),
            "sessionId": session_id,
            "x": data.get("x", 50),
            "y": data.get("y", 50),
            "message": data.get("message", ""),
            "createdBy": sender_user_id,
            "status": "PENDING",
            "createdAt": now_iso
        }
        db.set_document("annotations", annotation_id, annotation_data)
        data["annotationId"] = annotation_id
        data["status"] = "PENDING"
        data["createdAt"] = now_iso

    # Handle status transitions
    elif msg_type == "ACKNOWLEDGED":
        annotation_id = data.get("annotationId")
        if annotation_id:
            ann = db.get_document("annotations", annotation_id)
            if ann:
                ann["status"] = "ACKNOWLEDGED"
                db.set_document("annotations", annotation_id, ann)

    elif msg_type == "COMPLETED":
        annotation_id = data.get("annotationId")
        if annotation_id:
            ann = db.get_document("annotations", annotation_id)
            if ann:
                ann["status"] = "COMPLETED"
                db.set_document("annotations", annotation_id, ann)

    return data
