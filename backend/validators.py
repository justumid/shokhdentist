"""Input validation and sanitization utilities"""
import re
from typing import Any, Dict, List
from datetime import datetime, date
from exceptions import ValidationException

def validate_phone_number(phone: str) -> bool:
    """Validate Uzbekistan phone number format"""
    pattern = r'^\+998[0-9]{9}$'
    return bool(re.match(pattern, phone))

def sanitize_string(value: str, max_length: int = 500) -> str:
    """Sanitize string input - remove dangerous characters"""
    if not value:
        return ""
    
    # Remove null bytes and control characters
    sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', value)
    
    # Trim to max length
    return sanitized[:max_length].strip()

def validate_date_string(date_str: str) -> bool:
    """Validate ISO date format YYYY-MM-DD"""
    try:
        datetime.fromisoformat(date_str)
        return True
    except:
        return False

def validate_time_string(time_str: str) -> bool:
    """Validate time format HH:MM"""
    pattern = r'^([01][0-9]|2[0-3]):[0-5][0-9]$'
    return bool(re.match(pattern, time_str))

def validate_appointment_data(data: Dict[str, Any]) -> List[str]:
    """Validate appointment data and return list of errors"""
    errors = []
    
    # Required fields
    if not data.get("type") in ["free", "paid"]:
        errors.append("Invalid appointment type")
    
    if data.get("date") and not validate_date_string(data["date"]):
        errors.append("Invalid date format")
    
    if data.get("time") and not validate_time_string(data["time"]):
        errors.append("Invalid time format")
    
    # Patient data validation
    patient_data = data.get("patientData", {})
    
    if not patient_data.get("fullName"):
        errors.append("Patient name required")
    
    if not patient_data.get("phone"):
        errors.append("Phone number required")
    elif not validate_phone_number(patient_data["phone"]):
        errors.append("Invalid phone number format (must be +998XXXXXXXXX)")
    
    if not patient_data.get("birthDate"):
        errors.append("Birth date required")
    
    # Medical history
    for field in ["diabet", "heart", "bp"]:
        if patient_data.get(field) is None:
            errors.append(f"Medical field '{field}' required")
    
    # Dental history
    for field in ["toothpain", "gumbleed"]:
        if patient_data.get(field) is None:
            errors.append(f"Dental field '{field}' required")
    
    # Consents
    if patient_data.get("photoConsent") is None:
        errors.append("Photo consent required")
    
    if data.get("type") == "paid" and patient_data.get("programConsent") is None:
        errors.append("Program consent required for paid appointments")
    
    return errors

def validate_review_data(data: Dict[str, Any]) -> List[str]:
    """Validate review data"""
    errors = []
    
    if not data.get("name"):
        errors.append("Name required")
    
    rating = data.get("rating")
    if rating is None:
        errors.append("Rating required")
    elif not isinstance(rating, int) or rating < 1 or rating > 5:
        errors.append("Rating must be 1-5")
    
    if not data.get("text"):
        errors.append("Review text required")
    
    if not isinstance(data.get("tags", []), list):
        errors.append("Tags must be an array")
    
    return errors

def sanitize_appointment_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize appointment data"""
    sanitized = data.copy()
    
    if "patientData" in sanitized:
        patient = sanitized["patientData"]
        
        # Sanitize text fields
        text_fields = ["fullName", "email", "address", "job", "emergencyName", 
                      "allergy", "meds", "otherComplaint", "complaint"]
        for field in text_fields:
            if field in patient and isinstance(patient[field], str):
                patient[field] = sanitize_string(patient[field])
    
    return sanitized

def sanitize_review_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Sanitize review data"""
    sanitized = data.copy()
    
    if "name" in sanitized:
        sanitized["name"] = sanitize_string(sanitized["name"], 100)
    
    if "text" in sanitized:
        sanitized["text"] = sanitize_string(sanitized["text"], 2000)
    
    return sanitized
