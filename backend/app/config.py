import os

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "AR-CARE LINK")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "arcarelink_super_secret_jwt_key_hackathon_2026_demo")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")
    
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    FIREBASE_PROJECT_ID: str = os.getenv("FIREBASE_PROJECT_ID", "")
    
    # Clinical AI thresholds
    THRESHOLD_SPO2_WARNING: float = float(os.getenv("THRESHOLD_SPO2_WARNING", "94.0"))
    THRESHOLD_SPO2_CRITICAL: float = float(os.getenv("THRESHOLD_SPO2_CRITICAL", "90.0"))
    THRESHOLD_HEART_RATE_HIGH: float = float(os.getenv("THRESHOLD_HEART_RATE_HIGH", "100.0"))
    THRESHOLD_RESPIRATORY_RATE_HIGH: float = float(os.getenv("THRESHOLD_RESPIRATORY_RATE_HIGH", "20.0"))
    THRESHOLD_BP_SYSTOLIC_HIGH: float = float(os.getenv("THRESHOLD_BP_SYSTOLIC_HIGH", "140.0"))
    THRESHOLD_TEMP_HIGH_C: float = float(os.getenv("THRESHOLD_TEMP_HIGH_C", "38.0"))

settings = Settings()
