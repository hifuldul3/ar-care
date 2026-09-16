# AI Rule Engine & Explainable Clinical Decision Support

AR-CARE LINK incorporates a rule-based decision support engine designed for prototype frontline screening.

## Threshold Evaluation Logic

Configurable clinical parameters defined in `backend/app/config.py`:
- `THRESHOLD_SPO2_WARNING`: 94%
- `THRESHOLD_SPO2_CRITICAL`: 90%
- `THRESHOLD_HEART_RATE_HIGH`: 100 bpm
- `THRESHOLD_RESPIRATORY_RATE_HIGH`: 20 rpm
- `THRESHOLD_BP_SYSTOLIC_HIGH`: 140 mmHg

## Rule Logic Breakdown
1. **SpO2 Oxygen Saturation**:
   - `SpO2 <= 90%`: Flagged as "Critical low oxygen saturation".
   - `SpO2 <= 94%`: Flagged as "Low oxygen saturation".
2. **Respiratory Rate**:
   - `RR >= 20 rpm`: Flagged as "Elevated respiratory rate".
3. **Heart Rate**:
   - `HR >= 100 bpm`: Flagged as "Elevated heart rate".
4. **Symptoms Matching**:
   - Evaluates keywords (`breathing`, `moochu`, `dyspnea`, `thinaral`) -> Flagged as "Reported breathing difficulty".

## Priority Assignment
- **URGENT PROFESSIONAL REVIEW**: 2 or more flagged clinical observations, or critical SpO2 <= 90%.
- **ELEVATED PROFESSIONAL REVIEW**: Exactly 1 flagged clinical observation.
- **ROUTINE PROFESSIONAL REVIEW**: Vitals and symptoms within normal ranges.

## Explainability Format
Outputs specific reasoning arrays, missing information items (e.g. missing allergy/medication details), next step recommendations, and clinical disclaimers.
