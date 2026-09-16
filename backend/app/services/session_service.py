from datetime import datetime
from app.database.firebase import get_db

class SessionService:
    @staticmethod
    def get_or_create_session(case_id: str, user_id: str, role: str) -> dict:
        db = get_db()
        sessions = db.query_collection("sessions", {"caseId": case_id})
        
        if sessions:
            session = sessions[0]
            if role == "specialist" and not session.get("specialistId"):
                session["specialistId"] = user_id
                session["status"] = "ACTIVE"
                session["updatedAt"] = datetime.utcnow().isoformat()
                db.set_document("sessions", session["sessionId"], session)
            return session

        # Create new session
        session_id = f"SESSION-{case_id}"
        case = db.get_document("cases", case_id)
        worker_id = case.get("workerId") if case else user_id

        session_record = {
            "sessionId": session_id,
            "caseId": case_id,
            "workerId": worker_id,
            "specialistId": user_id if role == "specialist" else None,
            "status": "WAITING" if role == "worker" else "ACTIVE",
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        db.set_document("sessions", session_id, session_record)

        # Update case status
        if case:
            case["status"] = "IN_SESSION"
            if role == "specialist":
                case["specialistId"] = user_id
            db.set_document("cases", case_id, case)

        return session_record
