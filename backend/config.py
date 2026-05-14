"""
Configuration settings for the backend application
"""

import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App settings
    APP_NAME: str = "Pharmacovigilance AI Agent"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("API_PORT", os.getenv("PORT", "8000")))

    # Database - Railway provides DATABASE_URL automatically
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://pharmavig:password@localhost:5432/pharmavig_mvp"
    )

    # Redis (for Celery) - Railway provides REDIS_URL automatically
    REDIS_URL: str = os.getenv(
        "REDIS_URL",
        "redis://localhost:6379/0"
    )

    # Celery
    CELERY_BROKER_URL: str = REDIS_URL
    CELERY_RESULT_BACKEND: str = REDIS_URL

    # JWT / Security
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY",
        "your-secret-key-change-in-production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Scrapers
    AERZTEBLATT_BASE_URL: str = "https://www.aerzteblatt.de"
    SCRAPER_TIMEOUT: int = 30
    SCRAPER_RATE_LIMIT: float = 2.0

    # NLP
    SPACY_MODEL: str = "en_core_web_sm"
    USE_GPT4_FALLBACK: bool = False
    OPENAI_API_KEY: Optional[str] = None

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables from Railway

settings = Settings()
