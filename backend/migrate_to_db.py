"""Database migration script - JSON to PostgreSQL"""
import json
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config import settings
from database import Base, Appointment, PatientStateDB, ReviewDB, UserProfileDB

def migrate_json_to_postgres():
    """Migrate data from JSON files to PostgreSQL"""
    if not settings.DATABASE_URL:
        print("❌ DATABASE_URL not configured")
        return False
    
    print(f"🔄 Migrating data to {settings.DATABASE_URL}")
    
    # Create engine and tables
    engine = create_engine(settings.DATABASE_URL)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    data_dir = Path("data")
    if not data_dir.exists():
        print("❌ No data directory found")
        return False
    
    try:
        # Migrate appointments
        appointments_file = data_dir / "appointments.json"
        if appointments_file.exists():
            with open(appointments_file) as f:
                appointments = json.load(f)
            
            for apt in appointments:
                db_apt = Appointment(
                    id=apt["id"],
                    type=apt["type"],
                    date=apt["date"],
                    time=apt["time"],
                    status=apt["status"],
                    patient_data=apt.get("patientData", {}),
                    telegram_user_id=apt["telegramUserId"],
                    telegram_user=apt.get("telegramUser"),
                    doctor_name=apt.get("doctorName"),
                    admin_note=apt.get("adminNote"),
                    created_at=datetime.fromisoformat(apt["createdAt"]) if apt.get("createdAt") else datetime.now()
                )
                session.merge(db_apt)
            
            print(f"✓ Migrated {len(appointments)} appointments")
        
        # Migrate patient states
        patients_file = data_dir / "patient_states.json"
        if patients_file.exists():
            with open(patients_file) as f:
                patients = json.load(f)
            
            for patient in patients:
                db_patient = PatientStateDB(
                    telegram_user_id=patient["telegramUserId"],
                    data=patient,
                    updated_at=datetime.fromisoformat(patient["updatedAt"]) if patient.get("updatedAt") else datetime.now()
                )
                session.merge(db_patient)
            
            print(f"✓ Migrated {len(patients)} patient states")
        
        # Migrate reviews
        reviews_file = data_dir / "reviews.json"
        if reviews_file.exists():
            with open(reviews_file) as f:
                reviews = json.load(f)
            
            for review in reviews:
                db_review = ReviewDB(
                    id=review["id"],
                    name=review["name"],
                    rating=review["rating"],
                    tags=review["tags"],
                    text=review["text"],
                    telegram_user_id=review.get("telegramUserId"),
                    verified=review.get("verified", False),
                    hidden=review.get("hidden", False),
                    created_at=datetime.fromisoformat(review["date"]) if review.get("date") else datetime.now()
                )
                session.merge(db_review)
            
            print(f"✓ Migrated {len(reviews)} reviews")
        
        # Migrate profiles
        profiles_file = data_dir / "profiles.json"
        if profiles_file.exists():
            with open(profiles_file) as f:
                profiles = json.load(f)
            
            for profile in profiles:
                db_profile = UserProfileDB(
                    telegram_user_id=profile["telegramUserId"],
                    phone=profile.get("phone"),
                    full_name=profile.get("fullName"),
                    username=profile.get("username"),
                    registered_at=datetime.fromisoformat(profile["registeredAt"]) if profile.get("registeredAt") else datetime.now(),
                    last_active=datetime.fromisoformat(profile["lastActive"]) if profile.get("lastActive") else datetime.now()
                )
                session.merge(db_profile)
            
            print(f"✓ Migrated {len(profiles)} user profiles")
        
        session.commit()
        print("\n✅ Migration completed successfully")
        return True
        
    except Exception as e:
        session.rollback()
        print(f"\n❌ Migration failed: {e}")
        return False
    finally:
        session.close()

if __name__ == "__main__":
    migrate_json_to_postgres()
