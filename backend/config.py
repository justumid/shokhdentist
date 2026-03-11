"""Configuration management for production-ready backend"""
import os
from pathlib import Path
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env from project root (parent directory of backend/)
env_path = Path(__file__).parent.parent / ".env"
if env_path.exists():
    load_dotenv(env_path)

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ShokhDentist API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_BASE_URL: str = "http://localhost:8000"
    
    # Telegram
    BOT_TOKEN: str = ""
    WEB_APP_URL: str = "https://shokhdentist.vercel.app"
    
    # Admin Authentication
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = ""  # Set in .env
    ADMIN_SECRET_KEY: str = ""  # For JWT tokens
    
    # Database
    USE_DATABASE: bool = False
    DATABASE_URL: Optional[str] = None
    
    # CORS
    CORS_ORIGINS: list = [
        "https://web.telegram.org",
        "https://telegram.org",
        "https://shokhdentist.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
        "https://shokhdentist-frontend.onrender.com",
        "https://*.onrender.com"
    ]
    
    # Storage
    DATA_DIR: Path = Path("data")
    
    # Rate Limiting
    RATE_LIMIT_ENABLED: bool = True
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds
    
    # WebSocket
    WS_HEARTBEAT_INTERVAL: int = 30  # seconds
    WS_MAX_CONNECTIONS_PER_IP: int = 10
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # or "text"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
