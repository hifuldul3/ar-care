from datetime import datetime
from app.database.firebase import get_db
from app.services.case_service import CaseService

class SyncService:
    @staticmethod
    def process_sync_batch(items: list[dict], user_id: str, role: str) -> dict:
        db = get_db()
        synced_ids = []
        errors = []

        for item in items:
            item_id = item.get("id")
            item_type = item.get("type")
            payload = item.get("payload", {})

            try:
                if item_type == "CASE":
                    CaseService.create_case(payload, user_id)
                    synced_ids.append(item_id)
                elif item_type == "VITALS":
                    case_id = payload.get("caseId")
                    if case_id:
                        case = db.get_document("cases", case_id)
                        if case:
                            case["vitals"] = payload.get("vitals", {})
                            case["updatedAt"] = datetime.utcnow().isoformat()
                            db.set_document("cases", case_id, case)
                            synced_ids.append(item_id)
                elif item_type == "NOTE":
                    case_id = payload.get("caseId")
                    note = payload.get("note", "")
                    if case_id:
                        case = db.get_document("cases", case_id)
                        if case:
                            existing_notes = case.get("notes", "")
                            case["notes"] = f"{existing_notes}\n[Offline Note {datetime.utcnow().strftime('%H:%M')}]: {note}".strip()
                            case["updatedAt"] = datetime.utcnow().isoformat()
                            db.set_document("cases", case_id, case)
                            synced_ids.append(item_id)
                else:
                    synced_ids.append(item_id)

                # Record sync item in backend queue audit
                sync_record = {
                    "id": item_id,
                    "userId": user_id,
                    "type": item_type,
                    "status": "SYNCHRONIZED",
                    "processedAt": datetime.utcnow().isoformat()
                }
                db.set_document("sync_queue", item_id, sync_record)

            except Exception as e:
                errors.append({"id": item_id, "error": str(e)})

        return {
            "syncedIds": synced_ids,
            "errors": errors
        }
