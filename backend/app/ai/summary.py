def generate_case_summary(case_data: dict, assessment_data: dict) -> str:
    patient = case_data.get("patient", {})
    vitals = case_data.get("vitals", {})
    symptoms = case_data.get("symptoms", "None reported")
    priority = assessment_data.get("priority", "ROUTINE PROFESSIONAL REVIEW")
    reasons = ", ".join(assessment_data.get("reasons", []))

    summary = (
        f"Case {case_data.get('caseId')} for {patient.get('name', 'Patient')} ({patient.get('age', 'N/A')} y/o {patient.get('gender', '')}) "
        f"presented with '{symptoms}'. Vitals: SpO2 {vitals.get('spO2')}% | HR {vitals.get('heartRate')} bpm | "
        f"RR {vitals.get('respiratoryRate')} rpm | BP {vitals.get('bloodPressure')}. "
        f"Assessment Status: {priority}. Flagged Observations: {reasons}."
    )
    return summary
