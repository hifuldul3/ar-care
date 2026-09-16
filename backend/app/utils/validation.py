import re

def validate_blood_pressure(bp: str) -> bool:
    if not bp:
        return False
    match = re.match(r"^\d{2,3}/\d{2,3}$", bp.strip())
    if not match:
        return False
    parts = bp.split("/")
    sys, dia = int(parts[0]), int(parts[1])
    return 40 <= sys <= 260 and 30 <= dia <= 160
