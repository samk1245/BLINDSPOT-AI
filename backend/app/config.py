import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=False)
    APP_NAME: str = Field(default="BLINDSPOT AI")
    APP_VERSION: str = Field(default="1.0.0")

    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    FRONTEND_URL: str = Field(default="http://localhost:5173")

    # Security & Tokens
    SECRET_KEY: str = Field(default="d7b2a95c4e3f1a08b5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # Database: Default Async SQLite for immediate zero-dependency portability
    # Automatically works with PostgreSQL when set to postgresql+asyncpg://...
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./blindspot.db")

    # Redis (Optional)
    REDIS_URL: str = Field(default="redis://localhost:6379/0")
    USE_REDIS: bool = Field(default=False)

    # AI Provider
    AI_PROVIDER: str = Field(default="offline")  # 'gemini' or 'offline'
    GEMINI_API_KEY: str = Field(default="")
    GEMINI_MODEL: str = Field(default="gemini-2.5-flash")

    # Scraping & Ingestion Safety
    MAX_CONTENT_LENGTH_BYTES: int = Field(default=10 * 1024 * 1024)  # 10 MB
    SCRAPE_TIMEOUT_SECONDS: float = Field(default=10.0)
    ALLOWED_URL_SCHEMES: str = Field(default="http,https")

    # Uploads
    UPLOAD_MAX_SIZE_BYTES: int = Field(default=15 * 1024 * 1024)  # 15 MB
    UPLOAD_DIR: str = Field(default="./uploads")

    # CORS
    ALLOWED_ORIGINS: str = Field(default="http://localhost:5173,http://127.0.0.1:5173")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]


settings = Settings()
