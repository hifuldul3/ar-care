from app.ai.rules import evaluate_clinical_rules

def calculate_case_completeness(case_data: dict) -> tuple[float, list[str]]:
    required_fields = {
        "Patient Information": case_data.get("patient", {}).get("name"),
        "Age": case_data.get("patient", {}).get("age"),
        "Gender": case_data.get("patient", {}).get("gender"),
        "Symptoms": case_data.get("symptoms"),
        "Vitals SpO2": case_data.get("vitals", {}).get("spO2"),
        "Vitals Heart Rate": case_data.get("vitals", {}).get("heartRate"),
        "Vitals Respiratory Rate": case_data.get("vitals", {}).get("respiratoryRate"),
        "Vitals Blood Pressure": case_data.get("vitals", {}).get("bloodPressure"),
        "Medical History": case_data.get("medicalHistory"),
        "Medication": case_data.get("medication"),
        "Allergies": case_data.get("allergies")
    }

    total = len(required_fields)
    filled = 0
    missing = []

    for name, val in required_fields.items():
        if val is not None and str(val).strip() != "":
            filled += 1
        else:
            missing.append(name)

    percentage = round((filled / total) * 100, 1)
    return percentage, missing

def run_ai_assessment(case_data: dict) -> dict:
    completeness, missing_fields = calculate_case_completeness(case_data)
    rules_result = evaluate_clinical_rules(case_data)

    return {
        "priority": rules_result["priority"],
        "reasons": rules_result["reasons"],
        "missing_information": rules_result["missing_information"],
        "recommended_action": rules_result["recommended_action"],
        "disclaimer": rules_result["disclaimer"],
        "completeness": completeness,
        "missing_fields": missing_fields
    }
