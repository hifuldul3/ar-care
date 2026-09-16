from app.ai.rules import evaluate_clinical_rules

def test_ai_rules_urgent_case():
    demo_case = {
        "symptoms": "Breathing difficulty and chest tightness",
        "medicalHistory": "Hypertension",
        "medication": "",
        "allergies": "",
        "vitals": {
            "spO2": 89,
            "heartRate": 108,
            "respiratoryRate": 26,
            "temperature": 37.4,
            "bloodPressure": "138/86"
        }
    }
    result = evaluate_clinical_rules(demo_case)
    assert result["priority"] == "URGENT PROFESSIONAL REVIEW"
    assert any("oxygen" in r.lower() for r in result["reasons"])
    assert any("respiratory rate" in r.lower() for r in result["reasons"])
