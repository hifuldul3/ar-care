from fastapi import APIRouter, Depends, HTTPException
from app.schemas.patient import PatientCreate, PatientResponse
from app.auth.dependencies import get_current_user
from app.database.firebase import get_db

router = APIRouter(prefix="/patients", tags=["Patients"])

@router.get("", response_model=list[dict])
def list_patients(current_user: dict = Depends(get_current_user)):
    db = get_db()
    return db.query_collection("patients")

@router.get("/{patient_id}", response_model=dict)
def get_patient(patient_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    patient = db.get_document("patients", patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
