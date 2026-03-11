"""Database module - supports both JSON and PostgreSQL"""
from pathlib import Path
from typing import List, Dict, Optional, Any
import json
from datetime import datetime
from config import settings
from logger import logger

# Determine storage backend
if settings.USE_DATABASE and settings.DATABASE_URL:
    # PostgreSQL support (optional)
    try:
        from sqlalchemy import create_engine, Column, Integer, String, JSON, DateTime, Boolean
        from sqlalchemy.ext.declarative import declarative_base
        from sqlalchemy.orm import sessionmaker
        
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(bind=engine)
        Base = declarative_base()
        
        DATABASE_AVAILABLE = True
        logger.info("PostgreSQL database configured")
    except ImportError:
        DATABASE_AVAILABLE = False
        logger.warning("PostgreSQL requested but sqlalchemy not installed, falling back to JSON")
else:
    DATABASE_AVAILABLE = False

# JSON file storage (default)
DATA_DIR = settings.DATA_DIR
DATA_DIR.mkdir(exist_ok=True)

def load_data(filename: str) -> List[Dict]:
    """Load data from storage"""
    if DATABASE_AVAILABLE:
        # TODO: Implement database queries
        logger.debug(f"Loading {filename} from database")
        pass
    
    # JSON fallback
    file_path = DATA_DIR / f"{filename}.json"
    if file_path.exists():
        try:
            data = json.loads(file_path.read_text())
            logger.debug(f"Loaded {len(data)} records from {filename}.json")
            return data
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse {filename}.json: {e}")
            return []
    return []

def save_data(filename: str, data: List[Dict]) -> bool:
    """Save data to storage"""
    try:
        if DATABASE_AVAILABLE:
            # TODO: Implement database writes
            logger.debug(f"Saving {filename} to database")
            pass
        
        # JSON fallback
        file_path = DATA_DIR / f"{filename}.json"
        file_path.write_text(json.dumps(data, indent=2, default=str))
        logger.debug(f"Saved {len(data)} records to {filename}.json")
        return True
    except Exception as e:
        logger.error(f"Failed to save {filename}: {e}")
        return False

def init_database():
    """Initialize database tables"""
    if DATABASE_AVAILABLE:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database initialized successfully")
    else:
        logger.info("Using JSON file storage")
        DATA_DIR.mkdir(exist_ok=True)
        
        # Initialize default content files if they don't exist
        default_files = {
            "services": [],
            "faqs": [],
            "team": [],
            "reviews": [],
            "settings": {
                "clinic_name": "Shokh Dentist",
                "clinic_address": "Toshkent, O'zbekiston",
                "clinic_phone": "+998 90 123 45 67",
                "clinic_email": "info@shokhdentist.uz",
                "working_hours": "9:00 - 18:00",
                "working_days": "Dushanba - Shanba"
            }
        }
        
        for filename, default_data in default_files.items():
            file_path = DATA_DIR / f"{filename}.json"
            if not file_path.exists():
                file_path.write_text(json.dumps(default_data, indent=2, ensure_ascii=False))
                logger.info(f"Created default {filename}.json")

# Database models (for PostgreSQL migration)
if DATABASE_AVAILABLE:
    class Appointment(Base):
        __tablename__ = "appointments"
        
        id = Column(String, primary_key=True)
        type = Column(String, nullable=False)
        date = Column(String, nullable=False)
        time = Column(String, nullable=False)
        status = Column(String, nullable=False)
        patient_data = Column(JSON, nullable=False)
        telegram_user_id = Column(Integer, nullable=False)
        telegram_user = Column(JSON)
        doctor_name = Column(String)
        admin_note = Column(String)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, onupdate=datetime.utcnow)
        cancelled_at = Column(DateTime)
    
    class PatientStateDB(Base):
        __tablename__ = "patient_states"
        
        telegram_user_id = Column(Integer, primary_key=True)
        data = Column(JSON, nullable=False)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    class ReviewDB(Base):
        __tablename__ = "reviews"
        
        id = Column(String, primary_key=True)
        name = Column(String, nullable=False)
        rating = Column(Integer, nullable=False)
        tags = Column(JSON, nullable=False)
        text = Column(String, nullable=False)
        telegram_user_id = Column(Integer)
        verified = Column(Boolean, default=False)
        hidden = Column(Boolean, default=False)
        created_at = Column(DateTime, default=datetime.utcnow)
        updated_at = Column(DateTime, onupdate=datetime.utcnow)
    
    class UserProfileDB(Base):
        __tablename__ = "user_profiles"
        
        telegram_user_id = Column(Integer, primary_key=True)
        phone = Column(String)
        full_name = Column(String)
        username = Column(String)
        registered_at = Column(DateTime, default=datetime.utcnow)
        last_active = Column(DateTime, default=datetime.utcnow)
