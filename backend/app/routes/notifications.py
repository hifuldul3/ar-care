from fastapi import APIRouter, Depends
from app.auth.dependencies import get_current_user
from app.database.firebase import get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=list[dict])
def get_notifications(current_user: dict = Depends(get_current_user)):
    db = get_db()
    all_notifs = db.query_collection("notifications")
    role_notifs = [n for n in all_notifs if n.get("targetRole") == current_user["role"] or n.get("userId") == current_user["id"]]
    return sorted(role_notifs, key=lambda x: x.get("timestamp", ""), reverse=True)
