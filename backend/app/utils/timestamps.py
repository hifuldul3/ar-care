from datetime import datetime

def current_utc_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"

def format_human_timestamp(iso_str: str) -> str:
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", ""))
        return dt.strftime("%H:%M:%S - %d %b %Y")
    except Exception:
        return iso_str
