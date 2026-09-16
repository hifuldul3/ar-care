import os
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from app.config import settings

logger = logging.getLogger("arcare.database")

class Database:
    """
    Database Interface for AR-CARE LINK.
    Provides Firestore integration with an in-memory/file fallback for out-of-the-box demo execution.
    """
    def __init__(self):
        self.firestore_db = None
        self.use_firebase = False
        
        # Initialize Firebase if credentials exist
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            try:
                import firebase_admin
                from firebase_admin import credentials, firestore
                if not firebase_admin._apps:
                    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
                    firebase_admin.initialize_app(cred)
                self.firestore_db = firestore.client()
                self.use_firebase = True
                logger.info("Firebase Firestore connected successfully.")
            except Exception as e:
                logger.warning(f"Firebase initialization failed: {e}. Falling back to local data store.")
                self.use_firebase = False

        # In-memory local fallback store
        self._collections: Dict[str, Dict[str, Dict[str, Any]]] = {
            "users": {},
            "patients": {},
            "cases": {},
            "vitals": {},
            "ai_assessments": {},
            "sessions": {},
            "annotations": {},
            "actions": {},
            "reports": {},
            "notifications": {},
            "sync_queue": {}
        }
        
        # Pre-seed demo users & demo patient data
        self._seed_initial_data()

    def _seed_initial_data(self):
        from app.auth.password import get_password_hash
        
        # Seed Worker User
        self._collections["users"]["W001"] = {
            "id": "W001",
            "email": "worker@arcare.demo",
            "password_hash": get_password_hash("worker123"),
            "name": "Demo Frontline Worker",
            "role": "worker",
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Seed Specialist User
        self._collections["users"]["S001"] = {
            "id": "S001",
            "email": "doctor@arcare.demo",
            "password_hash": get_password_hash("doctor123"),
            "name": "Dr. Sarah Specialist",
            "role": "specialist",
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Seed Demo Patient PT001
        self._collections["patients"]["PT001"] = {
            "patientId": "PT001",
            "name": "Demo Patient",
            "age": 52,
            "gender": "Male",
            "createdAt": datetime.utcnow().isoformat()
        }

    # Generic CRUD methods
    def get_document(self, collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        if self.use_firebase and self.firestore_db:
            try:
                doc = self.firestore_db.collection(collection).document(doc_id).get()
                return doc.to_dict() if doc.exists else None
            except Exception as e:
                logger.error(f"Firestore get error: {e}")
        return self._collections.get(collection, {}).get(doc_id)

    def set_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        data["updatedAt"] = datetime.utcnow().isoformat()
        if "createdAt" not in data:
            data["createdAt"] = datetime.utcnow().isoformat()

        if self.use_firebase and self.firestore_db:
            try:
                self.firestore_db.collection(collection).document(doc_id).set(data, merge=True)
            except Exception as e:
                logger.error(f"Firestore set error: {e}")
        
        if collection not in self._collections:
            self._collections[collection] = {}
        self._collections[collection][doc_id] = data
        return data

    def query_collection(self, collection: str, filters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        items = list(self._collections.get(collection, {}).values())
        if filters:
            filtered = []
            for item in items:
                match = True
                for k, v in filters.items():
                    if item.get(k) != v:
                        match = False
                        break
                if match:
                    filtered.append(item)
            items = filtered
        return items

    def delete_document(self, collection: str, doc_id: str) -> bool:
        if self.use_firebase and self.firestore_db:
            try:
                self.firestore_db.collection(collection).document(doc_id).delete()
            except Exception as e:
                logger.error(f"Firestore delete error: {e}")

        if collection in self._collections and doc_id in self._collections[collection]:
            del self._collections[collection][doc_id]
            return True
        return False

    # Specialized User queries
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        users = self.query_collection("users", {"email": email.lower().strip()})
        return users[0] if users else None

db_instance = Database()

def get_db() -> Database:
    return db_instance
