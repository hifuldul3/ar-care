from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_full_case_lifecycle():
    # 1. Login Worker
    w_login = client.post("/auth/login", json={"email": "worker@arcare.demo", "password": "worker123"}).json()
    token = w_login["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Create Case P001
    case_payload = {
        "caseId": "P001",
        "patient": {"patientId": "PT001", "name": "Demo Patient", "age": 52, "gender": "Male"},
        "symptoms": "Breathing difficulty",
        "duration": "1 day",
        "medicalHistory": "None",
        "medication": "None",
        "allergies": "None",
        "notes": "Worker initial observation",
        "vitals": {"spO2": 89, "heartRate": 108, "respiratoryRate": 26, "temperature": 37.4, "bloodPressure": "138/86"}
    }
    c_res = client.post("/cases", json=case_payload, headers=headers)
    assert c_res.status_code == 200
    case_data = c_res.json()
    assert case_data["caseId"] == "P001"
    assert case_data["priority"] == "URGENT PROFESSIONAL REVIEW"

    # 3. Analyze Case
    ai_res = client.post("/cases/P001/analyze", headers=headers)
    assert ai_res.status_code == 200
    assert ai_res.json()["priority"] == "URGENT PROFESSIONAL REVIEW"

    # 4. Request Specialist
    req_res = client.post("/cases/P001/specialist-request", json={"urgencyReason": "Urgent review requested"}, headers=headers)
    assert req_res.status_code == 200
    assert req_res.json()["status"] == "WAITING_FOR_SPECIALIST"
