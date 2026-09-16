from datetime import datetime
from app.database.firebase import get_db
from app.ai.assessment import run_ai_assessment

class CaseService:
    @staticmethod
    def create_case(case_data: dict, worker_id: str) -> dict:
        db = get_db()
        case_id = case_data.get("caseId") or f"P{int(datetime.utcnow().timestamp())}"
        
        patient_info = case_data.get("patient", {})
        patient_id = patient_info.get("patientId") or f"PT-{int(datetime.utcnow().timestamp())}"
        
        # Save or update Patient document
        patient_record = {
            "patientId": patient_id,
            "name": patient_info.get("name", "Demo Patient"),
            "age": patient_info.get("age", 0),
            "gender": patient_info.get("gender", "Unknown"),
            "createdAt": datetime.utcnow().isoformat()
        }
        db.set_document("patients", patient_id, patient_record)

        # Run AI Assessment automatically on creation
        ai_assessment = run_ai_assessment(case_data)

        # Build Case record
        case_record = {
            "caseId": case_id,
            "patientId": patient_id,
            "workerId": worker_id,
            "specialistId": None,
            "patient": patient_record,
            "symptoms": case_data.get("symptoms", ""),
            "duration": case_data.get("duration", ""),
            "medicalHistory": case_data.get("medicalHistory", ""),
            "medication": case_data.get("medication", ""),
            "allergies": case_data.get("allergies", ""),
            "notes": case_data.get("notes", ""),
            "vitals": case_data.get("vitals", {}),
            "aiAssessment": ai_assessment,
            "completeness": ai_assessment["completeness"],
            "missingFields": ai_assessment["missing_fields"],
            "status": "NEW",
            "priority": ai_assessment["priority"],
            "createdAt": datetime.utcnow().isoformat(),
            "updatedAt": datetime.utcnow().isoformat()
        }
        db.set_document("cases", case_id, case_record)

        # Record Action Timeline entry
        action = {
            "id": f"ACT-{datetime.utcnow().timestamp()}",
            "caseId": case_id,
            "userId": worker_id,
            "role": "worker",
            "action": "CASE_CREATED",
            "metadata": {"caseId": case_id, "priority": ai_assessment["priority"]},
            "timestamp": datetime.utcnow().isoformat()
        }
        db.set_document("actions", action["id"], action)

        return case_record

    @staticmethod
    def get_case(case_id: str) -> dict:
        db = get_db()
        return db.get_document("cases", case_id)

    @staticmethod
    def list_cases(worker_id: str = None, role: str = None) -> list[dict]:
        db = get_db()
        all_cases = db.query_collection("cases")
        if role == "worker" and worker_id:
            return [c for c in all_cases if c.get("workerId") == worker_id]
        return all_cases

    @staticmethod
    def request_specialist(case_id: str, worker_id: str, urgency_reason: str = None) -> dict:
        db = get_db()
        case = db.get_document("cases", case_id)
        if not case:
            return None

        case["status"] = "WAITING_FOR_SPECIALIST"
        case["updatedAt"] = datetime.utcnow().isoformat()
        db.set_document("cases", case_id, case)

        # Create notification for specialists
        notif = {
            "id": f"NOTIF-{datetime.utcnow().timestamp()}",
            "targetRole": "specialist",
            "title": f"Specialist Requested for Case {case_id}",
            "body": f"Patient {case.get('patient', {}).get('name')} requires specialist review. Priority: {case.get('priority')}",
            "caseId": case_id,
            "read": False,
            "timestamp": datetime.utcnow().isoformat()
        }
        db.set_document("notifications", notif["id"], notif)

        # Log timeline action
        action = {
            "id": f"ACT-{datetime.utcnow().timestamp()}",
            "caseId": case_id,
            "userId": worker_id,
            "role": "worker",
            "action": "SPECIALIST_REQUESTED",
            "metadata": {"urgencyReason": urgency_reason},
            "timestamp": datetime.utcnow().isoformat()
        }
        db.set_document("actions", action["id"], action)

        return case
