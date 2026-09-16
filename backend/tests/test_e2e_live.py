import httpx

BASE_URL = "http://localhost:8000"

def test_live_pipeline():
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)

    print("1. Testing Root Endpoint...")
    res = client.get("/")
    assert res.status_code == 200, f"Root failed: {res.text}"
    print("   [OK] Root response:", res.json())

    print("2. Testing Worker Login...")
    res = client.post("/auth/login", json={"email": "worker@arcare.demo", "password": "worker123"})
    assert res.status_code == 200, f"Worker login failed: {res.text}"
    w_data = res.json()
    w_token = w_data["access_token"]
    w_headers = {"Authorization": f"Bearer {w_token}"}
    print("   [OK] Worker Login OK")

    print("3. Testing Specialist Login...")
    res = client.post("/auth/login", json={"email": "doctor@arcare.demo", "password": "doctor123"})
    assert res.status_code == 200, f"Specialist login failed: {res.text}"
    s_data = res.json()
    s_token = s_data["access_token"]
    s_headers = {"Authorization": f"Bearer {s_token}"}
    print("   [OK] Specialist Login OK")

    print("4. Testing Case Creation (P001)...")
    case_payload = {
        "caseId": "P001",
        "patient": {"patientId": "PT001", "name": "Demo Patient", "age": 52, "gender": "Male"},
        "symptoms": "Breathing difficulty",
        "duration": "1 day",
        "medicalHistory": "Hypertension",
        "medication": "Amlodipine",
        "allergies": "None",
        "notes": "E2E live verification",
        "vitals": {"spO2": 89, "heartRate": 108, "respiratoryRate": 26, "temperature": 37.4, "bloodPressure": "138/86"}
    }
    res = client.post("/cases", json=case_payload, headers=w_headers)
    assert res.status_code == 200, f"Case creation failed: {res.text}"
    print("   [OK] Case P001 Created OK")

    print("5. Testing AI Clinical Analysis...")
    res = client.post("/cases/P001/analyze", headers=w_headers)
    assert res.status_code == 200, f"AI assessment failed: {res.text}"
    ai_res = res.json()
    assert ai_res["priority"] == "URGENT PROFESSIONAL REVIEW"
    print("   [OK] AI Assessment Priority:", ai_res["priority"])

    print("6. Testing Specialist Request...")
    res = client.post("/cases/P001/specialist-request", json={"urgencyReason": "Urgent review required"}, headers=w_headers)
    assert res.status_code == 200, f"Specialist request failed: {res.text}"
    print("   [OK] Specialist Request Status:", res.json()["status"])

    print("7. Testing Session Initialization...")
    res = client.post("/sessions", json={"caseId": "P001"}, headers=w_headers)
    assert res.status_code == 200, f"Session init failed: {res.text}"
    session_id = res.json()["sessionId"]
    print("   [OK] Session Created OK:", session_id)

    print("8. Testing AR Annotation Placement...")
    ann_payload = {
        "caseId": "P001",
        "sessionId": session_id,
        "x": 62.0,
        "y": 43.0,
        "message": "Observe chest movement"
    }
    res = client.post("/annotations", json=ann_payload, headers=s_headers)
    assert res.status_code == 200, f"AR Annotation creation failed: {res.text}"
    ann_id = res.json()["annotationId"]
    print("   [OK] AR Marker Created OK:", ann_id)

    print("9. Testing AR Acknowledgement & Completion...")
    res = client.put(f"/annotations/{ann_id}/acknowledge", headers=w_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "ACKNOWLEDGED"

    res = client.put(f"/annotations/{ann_id}/complete", headers=w_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "COMPLETED"
    print("   [OK] AR Marker Acknowledged & Completed OK")

    print("10. Testing Action Timeline Retrieval...")
    res = client.get("/cases/P001/timeline", headers=w_headers)
    assert res.status_code == 200
    timeline = res.json()
    assert len(timeline) >= 4
    print(f"   [OK] Action Timeline OK ({len(timeline)} events recorded)")

    print("11. Testing Batch Sync Endpoint...")
    sync_payload = {
        "items": [
            {
                "id": "SYNC-TEST-001",
                "type": "NOTE",
                "payload": {"caseId": "P001", "note": "Offline test note"}
            }
        ]
    }
    res = client.post("/sync", json=sync_payload, headers=w_headers)
    assert res.status_code == 200
    print("   [OK] Batch Sync OK:", res.json())

    print("12. Testing PDF Report Generation & Download...")
    res = client.post("/reports/cases/P001/report", json={"caseId": "P001", "additionalNotes": ""}, headers=w_headers)
    assert res.status_code == 200
    download_url = res.json()["downloadUrl"]
    
    res_pdf = client.get(download_url)
    assert res_pdf.status_code == 200
    assert len(res_pdf.content) > 100
    print("   [OK] PDF Report Generated & Downloaded OK (Size:", len(res_pdf.content), "bytes)")

    print("\n==================================================")
    print("ALL E2E BACKEND & FEATURE TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    test_live_pipeline()
