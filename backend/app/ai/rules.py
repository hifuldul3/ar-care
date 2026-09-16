from app.config import settings

def evaluate_clinical_rules(case_data: dict) -> dict:
    vitals = case_data.get("vitals", {})
    symptoms = str(case_data.get("symptoms", "")).lower()
    medication = str(case_data.get("medication", "")).strip()
    allergies = str(case_data.get("allergies", "")).strip()
    history = str(case_data.get("medicalHistory", "")).strip()

    reasons = []

    spo2 = float(vitals.get("spO2", 98))
    hr = float(vitals.get("heartRate", 75))
    rr = float(vitals.get("respiratoryRate", 16))
    temp = float(vitals.get("temperature", 37.0))
    bp = str(vitals.get("bloodPressure", "120/80"))

    # Rule 1: SpO2 Evaluation
    if spo2 <= settings.THRESHOLD_SPO2_CRITICAL:
        reasons.append(f"Critical low oxygen saturation (SpO2 {spo2}% <= {settings.THRESHOLD_SPO2_CRITICAL}%)")
    elif spo2 <= settings.THRESHOLD_SPO2_WARNING:
        reasons.append(f"Low oxygen saturation (SpO2 {spo2}% <= {settings.THRESHOLD_SPO2_WARNING}%)")

    # Rule 2: Respiratory Rate
    if rr >= settings.THRESHOLD_RESPIRATORY_RATE_HIGH:
        reasons.append(f"Elevated respiratory rate ({rr} breaths/min >= {settings.THRESHOLD_RESPIRATORY_RATE_HIGH})")

    # Rule 3: Heart Rate
    if hr >= settings.THRESHOLD_HEART_RATE_HIGH:
        reasons.append(f"Elevated heart rate ({hr} bpm >= {settings.THRESHOLD_HEART_RATE_HIGH})")

    # Rule 4: Blood Pressure Systolic check
    try:
        systolic = int(bp.split("/")[0])
        if systolic >= settings.THRESHOLD_BP_SYSTOLIC_HIGH:
            reasons.append(f"Elevated blood pressure ({bp} mmHg)")
    except Exception:
        pass

    # Rule 5: Symptoms keyword matching (English & Tamil transliteration)
    breathing_keywords = ["breathing", "moochu", "dyspnea", "shortness of breath", "thinaral", "suffocating", "chest tightness"]
    if any(kw in symptoms for kw in breathing_keywords):
        reasons.append("Reported breathing difficulty or respiratory distress")

    # Determine missing information
    missing_info = []
    if not history:
        missing_info.append("Medical history")
    if not medication:
        missing_info.append("Medication information")
    if not allergies:
        missing_info.append("Allergy information")

    # Priority calculation
    if len(reasons) >= 2 or spo2 <= settings.THRESHOLD_SPO2_CRITICAL:
        priority = "URGENT PROFESSIONAL REVIEW"
        recommended_action = "Immediate specialist remote review & live AR guidance requested."
    elif len(reasons) == 1:
        priority = "ELEVATED PROFESSIONAL REVIEW"
        recommended_action = "Recommend specialist review within 1 hour."
    else:
        priority = "ROUTINE PROFESSIONAL REVIEW"
        recommended_action = "Standard frontline observation and monitoring."

    disclaimer = "AR-CARE LINK decision-support only. Not a medical diagnosis. Does not replace clinical judgment."

    return {
        "priority": priority,
        "reasons": reasons if reasons else ["Vitals and reported symptoms within standard parameters"],
        "missing_information": missing_info,
        "recommended_action": recommended_action,
        "disclaimer": disclaimer
    }
