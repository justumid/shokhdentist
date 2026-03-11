from fastapi import FastAPI, HTTPException, Header, Depends, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import StreamingResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any, Set
from datetime import datetime, date, timedelta
import uuid
import json
import hashlib
import hmac
import urllib.parse
from pathlib import Path
import os
import asyncio

# Production modules
from config import settings
from logger import logger
from auth import get_admin_user, get_admin_user_optional
from rate_limiter import rate_limiter
from exceptions import (
    AppException, ValidationException, AuthenticationException, 
    NotFoundException, ConflictException,
    app_exception_handler, http_exception_handler, 
    validation_exception_handler, general_exception_handler
)
from pdf_generator import questionnaire_generator

app = FastAPI(
    title="ShokhDentist Telegram Mini App API",
    version="1.0.0",
    debug=settings.DEBUG
)

# Register exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Register exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limiting to all requests"""
    try:
        await rate_limiter.check_rate_limit(request)
    except HTTPException:
        raise
    response = await call_next(request)
    return response

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize app on startup"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Rate limiting: {settings.RATE_LIMIT_ENABLED}")
    
    # Initialize database
    from database import init_database
    init_database()
    
    # Start rate limiter cleanup
    if settings.RATE_LIMIT_ENABLED:
        asyncio.create_task(rate_limiter.start_cleanup_task())
    
    logger.info("Application startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down application")

BOT_TOKEN = settings.BOT_TOKEN
DATA_DIR = settings.DATA_DIR
DATA_DIR.mkdir(exist_ok=True)

# WebSocket connection manager for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}  # date -> set of websockets
    
    async def connect(self, websocket: WebSocket, date: str):
        await websocket.accept()
        if date not in self.active_connections:
            self.active_connections[date] = set()
        self.active_connections[date].add(websocket)
    
    def disconnect(self, websocket: WebSocket, date: str):
        if date in self.active_connections:
            self.active_connections[date].discard(websocket)
            if not self.active_connections[date]:
                del self.active_connections[date]
    
    async def broadcast_slot_update(self, date: str, slot_data: Dict):
        if date in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[date]:
                try:
                    await connection.send_json(slot_data)
                except:
                    disconnected.add(connection)
            
            # Clean up disconnected clients
            for conn in disconnected:
                self.active_connections[date].discard(conn)

manager = ConnectionManager()

def load_data(filename: str) -> List[Dict]:
    """Load data from storage with error handling"""
    try:
        from database import load_data as db_load
        return db_load(filename)
    except Exception as e:
        logger.error(f"Error loading {filename}: {e}")
        return []

def save_data(filename: str, data: List[Dict]):
    """Save data to storage with error handling"""
    try:
        from database import save_data as db_save
        success = db_save(filename, data)
        if not success:
            logger.error(f"Failed to save {filename}")
    except Exception as e:
        logger.error(f"Error saving {filename}: {e}")

# Telegram Web App validation
def validate_telegram_data(init_data: str) -> Dict:
    """Validate Telegram Web App init data with improved error handling"""
    if not BOT_TOKEN:
        logger.debug("No BOT_TOKEN - skipping validation (dev mode)")
        return {}  # Skip validation in development
    
    try:
        parsed_data = dict(urllib.parse.parse_qsl(init_data))
        hash_value = parsed_data.pop('hash', '')
        
        if not hash_value:
            logger.warning("No hash in Telegram data")
            return {}
        
        data_check_string = '\n'.join([f"{k}={v}" for k, v in sorted(parsed_data.items())])
        secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        if calculated_hash == hash_value:
            logger.debug("Telegram data validated successfully")
            # Extract user data from the 'user' field
            if 'user' in parsed_data:
                try:
                    user_data = json.loads(parsed_data['user'])
                    logger.debug(f"Extracted user data: {user_data}")
                    return user_data
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse user JSON: {e}")
                    return {}
            return parsed_data
        
        logger.warning("Invalid Telegram data hash")
        return {}
    except Exception as e:
        logger.error(f"Error validating Telegram data: {e}")
        return {}

def get_telegram_user(
    authorization: str = Header(None),
    x_dev_user_id: Optional[str] = Header(None)
) -> Dict:
    """Extract Telegram user from authorization header or dev bypass"""
    # 1. Check for dev bypass header
    if x_dev_user_id:
        try:
            user_id = int(x_dev_user_id)
            logger.debug(f"Dev mode: Using X-Dev-User-Id {user_id}")
            return {
                "id": user_id,
                "first_name": "Dev",
                "last_name": "User",
                "username": "devuser",
                "is_dev": True
            }
        except ValueError:
            logger.warning(f"Invalid X-Dev-User-Id: {x_dev_user_id}")
            pass

    # 2. Regular Telegram auth
    if not authorization:
        # Production mode: always require authentication
        if BOT_TOKEN:
            logger.warning("No authorization header provided - authentication required")
            raise HTTPException(
                status_code=401,
                detail="This app must be opened from Telegram bot"
            )
        # Development mode only: return default user if no BOT_TOKEN is set
        logger.debug("No auth header, returning default dev user (DEV MODE)")
        return {
            "id": 12345678,
            "first_name": "Default",
            "last_name": "Dev",
            "username": "default_dev",
            "is_dev": True
        }
    
    try:
        init_data = authorization.replace("tma ", "")
        user_data = validate_telegram_data(init_data)
        if not user_data:
            logger.warning("Invalid Telegram authentication data")
            raise HTTPException(
                status_code=401,
                detail="Invalid Telegram authentication"
            )
        logger.debug(f"Authenticated Telegram user: {user_data.get('id')}")
        return user_data
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing authorization: {e}")
        raise HTTPException(
            status_code=401,
            detail="Failed to authenticate Telegram user"
        )

# Models
class TelegramUser(BaseModel):
    id: int
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None
    language_code: Optional[str] = None
    is_premium: Optional[bool] = None
    photo_url: Optional[str] = None

class PatientState(BaseModel):
    # Personal Info
    fullName: Optional[str] = None
    phone: Optional[str] = None
    birthDate: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    job: Optional[str] = None
    emergencyName: Optional[str] = None
    emergencyPhone: Optional[str] = None
    
    # Medical History
    diabet: Optional[bool] = None
    heart: Optional[bool] = None
    bp: Optional[bool] = None
    allergy: Optional[str] = None
    meds: Optional[str] = None
    pregnancy: Optional[str] = None
    
    # Dental History
    lastVisit: Optional[str] = None
    toothpain: Optional[bool] = None
    gumbleed: Optional[bool] = None
    sensitivity: Optional[bool] = None
    bruxism: Optional[bool] = None
    otherComplaint: Optional[str] = None
    
    # Consultation Form
    brushFreq: Optional[str] = None
    floss: Optional[str] = None
    badBreath: Optional[bool] = None
    smoking: Optional[bool] = None
    gumBleed: Optional[bool] = None  # Match UI consult section camelCase
    bleedDur: Optional[str] = None
    bleedWhen: Optional[List[str]] = None
    complaint: Optional[str] = None
    
    # Consent
    photoConsent: Optional[bool] = None
    programConsent: Optional[bool] = None
    
    # Appointment Selection
    preferredDate: Optional[str] = None
    preferredTime: Optional[str] = None
    
    # Metadata
    hasSubmitted: Optional[bool] = None
    requestType: Optional[str] = None
    
    @field_validator('phone')
    @classmethod
    def validate_phone(cls, v):
        if v and not v.startswith('+998'):
            raise ValueError('Phone must start with +998')
        return v

class AppointmentRequest(BaseModel):
    patientData: PatientState
    type: str = Field(..., pattern="^(free|paid)$")
    selectedSlot: Optional[Dict[str, str]] = None
    telegramUser: Optional[TelegramUser] = None

class Review(BaseModel):
    name: str
    rating: int = Field(..., ge=1, le=5)
    tags: List[str]
    text: str
    telegramUserId: Optional[int] = None

class UserProfile(BaseModel):
    telegramUserId: int
    phone: Optional[str] = None
    fullName: Optional[str] = None
    registeredAt: datetime
    lastActive: datetime

# Time slots configuration
TIME_PERIODS = {
    "morning": {"label": "Ertalab 09:00 – 12:00", "start": 9, "end": 12},
    "afternoon": {"label": "Kunduzi 12:00 – 16:00", "start": 12, "end": 16},
    "evening": {"label": "Kechqurun 16:00 – 19:00", "start": 16, "end": 19}
}

def generate_time_slots():
    slots = []
    for period_key, period in TIME_PERIODS.items():
        period_slots = []
        for hour in range(period["start"], period["end"]):
            period_slots.append({
                "time": f"{hour:02d}:00",
                "booked": False
            })
        slots.append({
            "period": period_key,
            "label": period["label"],
            "slots": period_slots
        })
    return slots

def get_booked_slots(target_date: str) -> List[str]:
    appointments = load_data("appointments")
    return [apt["time"] for apt in appointments if apt["date"] == target_date and apt["status"] != "cancelled"]

def calculate_section_progress(patient: PatientState) -> Dict[str, float]:
    """Calculate completion percentage for each section"""
    progress = {}
    
    # Personal Info (30% weight)
    personal_fields = [patient.fullName, patient.phone, patient.birthDate]
    personal_optional = [patient.email, patient.address, patient.job, patient.emergencyName, patient.emergencyPhone]
    personal_required = sum(1 for field in personal_fields if field)
    personal_total = len(personal_fields) + len([f for f in personal_optional if f])
    progress["personal"] = (personal_required / len(personal_fields)) * 100 if personal_required >= len(personal_fields) else (personal_total / (len(personal_fields) + len(personal_optional))) * 100
    
    # Medical History (20% weight)
    medical_required = [patient.diabet, patient.heart, patient.bp]
    medical_optional = [patient.allergy, patient.meds, patient.pregnancy]
    medical_req_count = sum(1 for field in medical_required if field is not None)
    medical_opt_count = sum(1 for field in medical_optional if field)
    progress["medical"] = (medical_req_count / len(medical_required)) * 100 if medical_req_count >= len(medical_required) else ((medical_req_count + medical_opt_count) / (len(medical_required) + len(medical_optional))) * 100
    
    # Dental History (20% weight)
    dental_required = [patient.toothpain, patient.gumbleed]
    dental_optional = [patient.lastVisit, patient.sensitivity, patient.bruxism, patient.otherComplaint]
    dental_req_count = sum(1 for field in dental_required if field is not None)
    dental_opt_count = sum(1 for field in dental_optional if field)
    progress["dental"] = (dental_req_count / len(dental_required)) * 100 if dental_req_count >= len(dental_required) else ((dental_req_count + dental_opt_count) / (len(dental_required) + len(dental_optional))) * 100
    
    # Consultation (20% weight)
    consult_fields = [patient.brushFreq, patient.floss, patient.complaint]
    if patient.gumBleed or patient.gumbleed:
        consult_fields.append(patient.bleedDur)
    consult_optional = [patient.badBreath, patient.smoking, patient.bleedWhen]
    consult_count = sum(1 for field in consult_fields if field)
    consult_opt_count = sum(1 for field in consult_optional if field)
    progress["consult"] = (consult_count / len(consult_fields)) * 100 if consult_count >= len(consult_fields) else ((consult_count + consult_opt_count) / (len(consult_fields) + len(consult_optional))) * 100
    
    # Consent (10% weight)
    consent_fields = [patient.photoConsent]
    if patient.requestType == "paid":
        consent_fields.append(patient.programConsent)
    consent_count = sum(1 for field in consent_fields if field)
    progress["consent"] = (consent_count / len(consent_fields)) * 100
    
    return progress

# API Endpoints

@app.get("/api/init")
async def init_app(telegram_user: Dict = Depends(get_telegram_user)):
    """Initialize Telegram Mini App"""
    try:
        if telegram_user:
            # Update user profile
            profiles = load_data("profiles")
            user_id = int(telegram_user.get("id", 0))
            
            # Check if user is admin
            is_admin = False
            if settings.ADMIN_CHAT_ID:
                admin_chat_ids = [id.strip() for id in settings.ADMIN_CHAT_ID.split(",")]
                is_admin = str(user_id) in admin_chat_ids
            
            profile = next((p for p in profiles if p["telegramUserId"] == user_id), None)
            if profile:
                profile["lastActive"] = datetime.now().isoformat()
                profile["isAdmin"] = is_admin
                logger.info(f"User {user_id} session updated (admin={is_admin})")
            else:
                profile = {
                    "telegramUserId": user_id,
                    "fullName": f"{telegram_user.get('first_name', '')} {telegram_user.get('last_name', '')}".strip(),
                    "username": telegram_user.get("username"),
                    "isAdmin": is_admin,
                    "registeredAt": datetime.now().isoformat(),
                    "lastActive": datetime.now().isoformat()
                }
                profiles.append(profile)
                logger.info(f"New user registered: {user_id} (admin={is_admin})")
            
            save_data("profiles", profiles)
            
            return {
                "success": True,
                "user": profile,
                "isAdmin": is_admin,
                "telegramData": telegram_user
            }
        
        logger.warning("Init called without valid Telegram data")
        return {"success": False, "error": "Invalid Telegram data"}
    except Exception as e:
        logger.error(f"Error in init_app: {e}")
        raise HTTPException(500, "Failed to initialize app")

@app.get("/api/patient/state")
async def get_patient_state(telegram_user: Dict = Depends(get_telegram_user)):
    """Get current patient state"""
    try:
        if not telegram_user:
            raise AuthenticationException("Invalid Telegram data")
        
        user_id = int(telegram_user.get("id", 0))
        patients = load_data("patient_states")
        
        patient_state = next((p for p in patients if p.get("telegramUserId") == user_id), None)
        if not patient_state:
            patient_state = {"telegramUserId": user_id}
            logger.debug(f"No patient state found for user {user_id}, returning empty")
        
        # Calculate progress
        patient_obj = PatientState(**{k: v for k, v in patient_state.items() if k != "telegramUserId"})
        progress = calculate_section_progress(patient_obj)
        
        logger.debug(f"Retrieved patient state for user {user_id}")
        return {
            "patientState": patient_state,
            "progress": progress,
            "totalProgress": sum(progress.values()) / len(progress) if progress else 0
        }
    except AuthenticationException:
        raise
    except Exception as e:
        logger.error(f"Error getting patient state: {e}")
        raise HTTPException(500, "Failed to retrieve patient state")

@app.post("/api/patient/state")
async def save_patient_state(
    patient_data: PatientState,
    telegram_user: Dict = Depends(get_telegram_user)
):
    """Save patient state"""
    try:
        if not telegram_user:
            raise AuthenticationException("Invalid Telegram data")
        
        user_id = int(telegram_user.get("id", 0))
        patients = load_data("patient_states")
        
        # Update or create patient state
        patient_dict = patient_data.dict()
        patient_dict["telegramUserId"] = user_id
        patient_dict["updatedAt"] = datetime.now().isoformat()
        
        existing_index = next((i for i, p in enumerate(patients) if p.get("telegramUserId") == user_id), None)
        if existing_index is not None:
            patients[existing_index] = patient_dict
            logger.info(f"Updated patient state for user {user_id}")
        else:
            patients.append(patient_dict)
            logger.info(f"Created patient state for user {user_id}")
        
        save_data("patient_states", patients)
        
        # Calculate progress
        progress = calculate_section_progress(patient_data)
        
        return {
            "success": True,
            "progress": progress,
            "totalProgress": sum(progress.values()) / len(progress) if progress else 0
        }
    except AuthenticationException:
        raise
    except Exception as e:
        logger.error(f"Error saving patient state: {e}")
        raise HTTPException(500, "Failed to save patient state")

@app.post("/api/appointments")
async def create_appointment(
    request: AppointmentRequest,
    telegram_user: Dict = Depends(get_telegram_user)
):
    """Create new appointment"""
    try:
        if not telegram_user:
            raise AuthenticationException("Invalid Telegram data")
        
        appointments = load_data("appointments")
        patient = request.patientData
        user_id = int(telegram_user.get("id", 0))
        
        # Validate required fields
        if not all([patient.fullName, patient.phone, patient.birthDate]):
            raise ValidationException("Missing required personal info", {
                "missing": [k for k in ["fullName", "phone", "birthDate"] 
                           if not getattr(patient, k)]
            })
        
        if not all([patient.diabet is not None, patient.heart is not None, patient.bp is not None]):
            raise ValidationException("Missing required medical history", {
                "missing": [k for k in ["diabet", "heart", "bp"] 
                           if getattr(patient, k) is None]
            })
        
        if not all([patient.toothpain is not None, patient.gumbleed is not None]):
            raise ValidationException("Missing required dental history")
        
        if patient.photoConsent is None:
            raise ValidationException("Photo consent required")
        
        if request.type == "paid" and patient.programConsent is None:
            raise ValidationException("Program consent required for paid appointments")
        
        # Check slot availability for paid appointments
        if request.type == "paid" and request.selectedSlot:
            slot_date = request.selectedSlot["date"]
            slot_time = request.selectedSlot["time"]
            booked_slots = get_booked_slots(slot_date)
            if slot_time in booked_slots:
                logger.warning(f"Slot conflict: {slot_date} {slot_time} already booked")
                raise ConflictException(
                    "Selected time slot is already booked",
                    {"date": slot_date, "time": slot_time}
                )
        
        # Create appointment
        appointment = {
            "id": str(uuid.uuid4()),
            "type": request.type,
            "date": request.selectedSlot["date"] if request.selectedSlot else patient.preferredDate,
            "time": request.selectedSlot["time"] if request.selectedSlot else patient.preferredTime,
            "status": "reviewing",
            "doctorName": None,
            "patientData": patient.dict(),
            "telegramUserId": user_id,
            "telegramUser": telegram_user,
            "createdAt": datetime.now().isoformat()
        }
        
        appointments.append(appointment)
        save_data("appointments", appointments)
        
        logger.info(f"Appointment created: {appointment['id']} for user {user_id}, type: {request.type}")
        
        # Broadcast real-time update to connected clients
        if appointment["date"]:
            slot_update = {
                "type": "slot_booked",
                "date": appointment["date"],
                "time": appointment["time"],
                "availableSlots": get_booked_slots(appointment["date"])
            }
            await manager.broadcast_slot_update(appointment["date"], slot_update)
            logger.debug(f"Broadcasted slot_booked for {appointment['date']} {appointment['time']}")
        
        return {
            "id": appointment["id"],
            "status": "reviewing",
            "message": "Sizning so'rovingiz qabul qilindi. Tez orada siz bilan bog'lanamiz."
        }
    except (ValidationException, ConflictException, AuthenticationException):
        raise
    except Exception as e:
        logger.error(f"Error creating appointment: {e}")
        raise HTTPException(500, "Failed to create appointment")

@app.get("/api/appointments")
async def get_appointments(telegram_user: Dict = Depends(get_telegram_user)):
    """Get user appointments"""
    try:
        if not telegram_user:
            raise AuthenticationException("Invalid Telegram data")
        
        user_id = int(telegram_user.get("id", 0))
        appointments = load_data("appointments")
        
        user_appointments = [
            {
                "id": apt["id"],
                "type": apt["type"],
                "date": apt["date"],
                "time": apt["time"],
                "status": apt["status"],
                "doctorName": apt.get("doctorName"),
                "createdAt": apt["createdAt"]
            }
            for apt in appointments 
            if apt.get("telegramUserId") == user_id
        ]
        
        logger.debug(f"Retrieved {len(user_appointments)} appointments for user {user_id}")
        return {"appointments": user_appointments}
    except AuthenticationException:
        raise
    except Exception as e:
        logger.error(f"Error getting appointments: {e}")
        raise HTTPException(500, "Failed to retrieve appointments")

@app.patch("/api/appointments/{appointment_id}")
async def update_appointment(
    appointment_id: str,
    update_data: Dict[str, Any],
    telegram_user: Dict = Depends(get_telegram_user),
    admin_user: Optional[str] = Depends(get_admin_user_optional)
):
    """Update appointment (user cancellation or admin update)"""
    try:
        appointments = load_data("appointments")
        
        appointment = next((apt for apt in appointments if apt["id"] == appointment_id), None)
        if not appointment:
            raise NotFoundException(f"Appointment {appointment_id} not found")
        
        appointment_date = appointment.get("date")
        is_owner = telegram_user and appointment.get("telegramUserId") == int(telegram_user.get("id", 0))
        is_admin = admin_user is not None
        
        # Authorization check
        if not is_owner and not is_admin:
            raise AuthorizationException("You can only modify your own appointments")
        
        # User can only cancel their own appointments
        if is_owner and not is_admin:
            if update_data.get("status") == "cancelled":
                appointment["status"] = "cancelled"
                appointment["cancelledAt"] = datetime.now().isoformat()
                appointment["cancelledBy"] = "user"
                save_data("appointments", appointments)
                
                logger.info(f"User {telegram_user.get('id')} cancelled appointment {appointment_id}")
                
                # Broadcast slot availability update
                if appointment_date:
                    slot_update = {
                        "type": "slot_cancelled",
                        "date": appointment_date,
                        "time": appointment["time"],
                        "availableSlots": get_booked_slots(appointment_date)
                    }
                    await manager.broadcast_slot_update(appointment_date, slot_update)
                    logger.debug(f"Broadcasted slot_cancelled for {appointment_date}")
                
                return {"success": True, "message": "Appointment cancelled"}
            else:
                raise AuthorizationException("Users can only cancel appointments")
        
        # Admin updates (full access)
        if is_admin:
            old_status = appointment.get("status")
            appointment.update(update_data)
            appointment["updatedAt"] = datetime.now().isoformat()
            appointment["updatedBy"] = admin_user
            save_data("appointments", appointments)
            
            logger.info(f"Admin {admin_user} updated appointment {appointment_id}")
            
            # Broadcast if status changed to cancelled
            if update_data.get("status") == "cancelled" and old_status != "cancelled" and appointment_date:
                slot_update = {
                    "type": "slot_cancelled",
                    "date": appointment_date,
                    "time": appointment["time"],
                    "availableSlots": get_booked_slots(appointment_date)
                }
                await manager.broadcast_slot_update(appointment_date, slot_update)
            
            return {"success": True}
        
        raise AuthorizationException("Unauthorized")
        
    except (NotFoundException, AuthorizationException):
        raise
    except Exception as e:
        logger.error(f"Error updating appointment {appointment_id}: {e}")
        raise HTTPException(500, "Failed to update appointment")

@app.get("/api/slots/available")
async def get_available_slots(date: str):
    """Get available time slots"""
    try:
        # Generate available dates (next 30 days, excluding weekends)
        today = datetime.now().date()
        available_dates = []
        for i in range(1, 45):  # Check 45 days to get 30 working days
            check_date = today + timedelta(days=i)
            if check_date.weekday() < 6:  # Monday=0, Sunday=6
                available_dates.append(check_date.isoformat())
            if len(available_dates) >= 30:
                break
        
        # Generate time slots
        time_slots = generate_time_slots()
        
        # Mark booked slots for the requested date
        booked_slots = get_booked_slots(date)
        for period in time_slots:
            for slot in period["slots"]:
                slot["booked"] = slot["time"] in booked_slots
        
        logger.debug(f"Retrieved slots for {date}: {len(booked_slots)} booked")
        
        return {
            "dates": available_dates,
            "timeSlots": time_slots,
            "selectedDate": date
        }
    except Exception as e:
        logger.error(f"Error getting available slots: {e}")
        raise HTTPException(500, "Failed to retrieve available slots")

@app.websocket("/ws/slots/{date}")
async def websocket_slots(websocket: WebSocket, date: str):
    """WebSocket endpoint for real-time slot updates"""
    client_id = f"{websocket.client.host}:{websocket.client.port}" if websocket.client else "unknown"
    logger.info(f"WebSocket connection attempt for date {date} from {client_id}")
    
    try:
        await manager.connect(websocket, date)
        logger.info(f"WebSocket connected: {client_id} watching {date}")
        
        # Send initial slot data
        time_slots = generate_time_slots()
        booked_slots = get_booked_slots(date)
        for period in time_slots:
            for slot in period["slots"]:
                slot["booked"] = slot["time"] in booked_slots
        
        await websocket.send_json({
            "type": "initial",
            "date": date,
            "timeSlots": time_slots,
            "bookedSlots": booked_slots
        })
        
        logger.debug(f"Sent initial data to {client_id}")
        
        # Keep connection alive and listen for pings
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_json({"type": "pong"})
                logger.debug(f"Pong sent to {client_id}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, date)
        logger.info(f"WebSocket disconnected: {client_id} from {date}")
    except Exception as e:
        manager.disconnect(websocket, date)
        logger.error(f"WebSocket error for {client_id}: {e}")

@app.get("/api/reviews")
async def get_reviews(
    tag: Optional[str] = None,
    sort: str = "newest",
    rating: Optional[int] = None,
    limit: int = 50
):
    """Get reviews with filtering"""
    reviews = load_data("reviews")
    
    # Filter by tag
    if tag:
        reviews = [r for r in reviews if tag in r.get("tags", [])]
    
    # Filter by rating
    if rating:
        reviews = [r for r in reviews if r.get("rating") == rating]
    
    # Sort
    if sort == "newest":
        reviews.sort(key=lambda x: x.get("date", ""), reverse=True)
    elif sort == "oldest":
        reviews.sort(key=lambda x: x.get("date", ""))
    elif sort == "highest" or sort == "rating":
        reviews.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort == "lowest":
        reviews.sort(key=lambda x: x.get("rating", 0))
    
    return {"reviews": reviews[:limit]}

@app.post("/api/reviews")
async def create_review(
    review: Review,
    telegram_user: Dict = Depends(get_telegram_user)
):
    """Submit new review"""
    try:
        reviews = load_data("reviews")
        
        # Check if user already reviewed
        user_id = int(telegram_user.get("id", 0)) if telegram_user else None
        if user_id:
            existing_review = next((r for r in reviews if r.get("telegramUserId") == user_id), None)
            if existing_review:
                raise ConflictException("Siz allaqachon sharh qoldirgan ekansiz")
        
        new_review = {
            "id": str(uuid.uuid4()),
            "name": review.name,
            "rating": review.rating,
            "tags": review.tags,
            "text": review.text,
            "telegramUserId": user_id,
            "date": datetime.now().isoformat(),
            "verified": bool(user_id),  # Verified if from Telegram
            "hidden": False
        }
        
        reviews.append(new_review)
        save_data("reviews", reviews)
        
        logger.info(f"Review created by user {user_id}: {review.rating} stars")
        
        return {
            "id": new_review["id"],
            "status": "created",
            "message": "Sharhingiz uchun rahmat!"
        }
    except ConflictException:
        raise
    except Exception as e:
        logger.error(f"Error creating review: {e}")
        raise HTTPException(500, "Failed to create review")

@app.get("/api/services")
async def get_services():
    """Get services catalog"""
    return {
        "categories": [
            {
                "id": "terapevtik",
                "name": "Terapevtik stomatologiya",
                "icon": "🦷",
                "services": [
                    {"id": "cons", "name": "Konsultatsiya", "price": "100 000"},
                    {"id": "karies", "name": "Karies davolash", "price": "200 000+"},
                    {"id": "plomba_de", "name": "Svet plomba (Germany)", "price": "400 000"},
                    {"id": "plomba_jp", "name": "Svet plomba (Japan)", "price": "500 000 – 600 000"},
                    {"id": "plomba_us", "name": "Svet plomba (USA)", "price": "800 000"},
                    {"id": "nerve_1", "name": "Nerv davolash 1-kanal", "price": "400 000"},
                    {"id": "nerve_3", "name": "Nerv davolash 3-kanal", "price": "600 000"},
                    {"id": "rest", "name": "Restavratsiya", "price": "600 000 – 900 000"},
                    {"id": "whit", "name": "Oqartirish", "price": "3 000 000"}
                ]
            },
            {
                "id": "jarrohlik",
                "name": "Jarrohlik stomatologiyasi",
                "icon": "💉",
                "services": [
                    {"id": "extr", "name": "Tish sug'urish", "price": "300 000"},
                    {"id": "extr_c", "name": "Murakkab sug'urish", "price": "300 000 – 500 000"},
                    {"id": "wisdom", "name": "Aql tishi", "price": "400 000 – 600 000"},
                    {"id": "retin", "name": "Retinatsiyalangan tish", "price": "700 000"},
                    {"id": "resec", "name": "Rezektsiya", "price": "1 500 000"},
                    {"id": "implant", "name": "Implant (Osstem)", "price": "4 800 000"}
                ]
            },
            {
                "id": "ortopedik",
                "name": "Ortopedik stomatologiya",
                "icon": "👑",
                "services": [
                    {"id": "meta", "name": "Metallokeramika koronka", "price": "800 000 – 1 000 000"},
                    {"id": "impl_c", "name": "Implantga koronka", "price": "1 200 000 – 3 000 000"},
                    {"id": "zirk", "name": "Zirkon koronka (ZrO2)", "price": "2 000 000 – 3 200 000"},
                    {"id": "temp", "name": "Vaqtinchalik koronka", "price": "300 000"},
                    {"id": "part", "name": "Qisman olinadigan protez", "price": "2 000 000 – 3 500 000"},
                    {"id": "byug", "name": "Byugel protez", "price": "5 500 000"}
                ]
            },
            {
                "id": "gigiyena",
                "name": "Gigiyena va parvarish",
                "icon": "✨",
                "services": [
                    {"id": "cl_uz", "name": "Tozalash (UZ)", "price": "400 000"},
                    {"id": "cl_af", "name": "Tozalash (Airflow)", "price": "600 000"},
                    {"id": "poli", "name": "Polirovka", "price": "100 000"},
                    {"id": "fluor", "name": "Ftorlak", "price": "150 000"},
                    {"id": "shin", "name": "Shinlash (6 tish)", "price": "400 000"}
                ]
            }
        ]
    }

@app.get("/api/team")
async def get_team():
    """Get team members"""
    return {
        "team": [
            {
                "id": "dr_shakhbozbek",
                "name": "Dr. Shakhbozbek",
                "role": "Bosh shifokor",
                "experience": "8 yil tajriba",
                "description": "Bosh shifokor",
                "gradient": ["#0E2A4A", "#163859"]
            },
            {
                "id": "dr_nilufar",
                "name": "Dr. Nilufar",
                "role": "Ortodont",
                "experience": "5 yil tajriba",
                "description": "Breket va Invisalign",
                "gradient": ["#4A1B6B", "#6B2490"]
            },
            {
                "id": "dr_bobur",
                "name": "Dr. Bobur",
                "role": "Implantolog",
                "experience": "6 yil tajriba",
                "description": "Implantatsiya va Jarrohlik",
                "gradient": ["#1B4A6B", "#1C6B9A"]
            },
            {
                "id": "dr_zulfiya",
                "name": "Dr. Zulfiya",
                "role": "Parodontolog",
                "experience": "4 yil tajriba",
                "description": "Milk kasalliklari davolash",
                "gradient": ["#1B6B3A", "#25964F"]
            }
        ]
    }

@app.get("/api/faq")
async def get_faq():
    """Get FAQ items"""
    return {
        "faq": [
            {"id": 1, "q": "Birinchi tashrif qanday o'tadi?", "a": "Birinchi tashrifda shifokor og'iz bo'shlig'ini ko'rib chiqadi, kerak bo'lsa rentgen olinadi va individual davolash rejasi tuziladi. Bu jarayon odatda 30–40 daqiqa davom etadi."},
            {"id": 2, "q": "Qabul oldin nima qilishim kerak?", "a": "Ilovadagi profilni to'ldiring — shaxsiy, tibbiy va tish tarixi ma'lumotlarini kiriting. Bu shifokorga tashxisni tezroq qo'yishga yordam beradi."},
            {"id": 3, "q": "Narxlar qanday belgilanadi?", "a": "Narxlar xizmat turiga va ishlatilgan materiallarga qarab belgilanadi. Konsultatsiya 100 000 so'mdan boshlanadi. Aniq narxni shifokor ko'rikdan keyin aytadi."},
            {"id": 4, "q": "Bo'lib to'lash mumkinmi?", "a": "Ha, katta summali davolashlar uchun bo'lib to'lash imkoniyati mavjud. Tafsilotlarni qabul vaqtida shifokor bilan kelishishingiz mumkin."},
            {"id": 5, "q": "Profilaktik dastur nima?", "a": "Har 6 oyda bepul profilaktik ko'rik va professional tish tozalash dasturi. Agar ko'rikda aniqlangan kariyes davolansa, keyingi cleaning bepul bo'ladi."},
            {"id": 6, "q": "Profilaktik dasturga qanday qo'shilaman?", "a": "Ilovadagi profilingizni to'liq to'ldiring va 'Qabul' bo'limidan 'Dasturga qo'shilish' tugmasini bosing. Shifokor siz bilan bog'lanib, birinchi tashrif vaqtini belgilaydi."},
            {"id": 7, "q": "Qabulni bekor qilish mumkinmi?", "a": "Ha, qabulni kamida 24 soat oldin bekor qilish kerak. Aks holda profilaktik dastur imtiyozlari ta'sirlanishi mumkin."},
            {"id": 8, "q": "Tish oqartirish xavflimi?", "a": "Professional oqartirish shifokor nazoratida xavfsiz o'tkaziladi. Emal strukturasiga zarar yetkazmaydi, lekin muolaja keyin 48 soat rangli oziq-ovqat va ichimliklardan saqlanish tavsiya etiladi."},
            {"id": 9, "q": "Implant o'rnatish og'riqli bo'ladimi?", "a": "Operatsiya mahalliy anesteziya ostida o'tkaziladi, shuning uchun jarayon og'riqsiz bo'ladi. Operatsiyadan keyin 2–3 kun yengil shishish va noqulaylik bo'lishi mumkin."},
            {"id": 10, "q": "Breket qo'yish qancha davom etadi?", "a": "Breket tizimi odatda 12–24 oy orasida kiyiladi. Aniq muddat tishlar holatiga bog'liq. Har 4–6 haftada tekshiruv amalga oshiriladi."},
            {"id": 11, "q": "Bolalar uchun qabul bormi?", "a": "Ha, biz bolalar stomatologiyasi xizmatini ham ko'rsatamiz. 3 yoshdan boshlab bolalarni profilaktik ko'rikka olib kelish tavsiya etiladi."},
            {"id": 12, "q": "Rentgen xavfsizmi?", "a": "Klinikamizda raqamli rentgen qurilmasi ishlatiladi — an'anaviy rentgenga nisbatan nurlanish 90% kam. Homilador ayollar uchun ehtiyotkorlik sifatida rentgendan vaqtincha voz kechish tavsiya etiladi."},
            {"id": 13, "q": "Tish nervi davolash nima?", "a": "Tish ichidagi yallig'langan yoki kasallangan nervni olib tashlash va kanallarni tozalash jarayoni. Bu tishni sug'urib tashlashdan saqlaydi. Bir yoki bir necha tashrif talab qilishi mumkin."},
            {"id": 14, "q": "Qancha vaqt kutish kerak?", "a": "Biz oldindan qabul vaqtini belgilaymiz, shuning uchun kutish vaqti minimal — odatda 5–10 daqiqa. Shoshilinch holatlarda navbatsiz qabul ham mavjud."},
            {"id": 15, "q": "Allergiyam bo'lsa nima qilaman?", "a": "Profilni to'ldirishda barcha allergiyalarni ko'rsating. Shifokor muqobil materiallar va dorilarni tanlaydi. Har qanday allergiya haqida qabul vaqtida ham aytib o'ting."},
            {"id": 16, "q": "Homiladorlik davrida davolanish mumkinmi?", "a": "Ikkinchi trimestrda ba'zi davolashlar xavfsiz hisoblanadi. Lekin shifokor bilan maslahat qilish shart. Rentgen va ba'zi dorilar homiladorlik davrida qo'llanilmaydi."},
            {"id": 17, "q": "Kafolat beriladi mi?", "a": "Ha, plomba va protezlarga materialga qarab 6 oydan 2 yilgacha kafolat beriladi. Implantlarga esa ishlab chiqaruvchi kafolati amal qiladi."},
            {"id": 18, "q": "Ish vaqtingiz qanday?", "a": "Dushanba–Shanba kunlari soat 9:00 dan 19:00 gacha ishlaymiz. Yakshanba — dam olish kuni. Shoshilinch holatlarda telefon orqali bog'lanishingiz mumkin."},
            {"id": 19, "q": "Klinika qayerda joy housework?", "a": "Toshkent shahri, Furqat ko'chasi 11a. Metro bekatidan 5 daqiqalik piyoda masofa. Google Maps orqali yo'nalishni olishingiz mumkin."},
            {"id": 20, "q": "Masofaviy konsultatsiya bormi?", "a": "Ha, Telegram orqali dastlabki maslahat olishingiz mumkin. Lekin aniq tashxis qo'yish uchun klinikaga kelish tavsiya etiladi."}
        ]
    }

@app.get("/api/stats")
async def get_stats(telegram_user: Dict = Depends(get_telegram_user)):
    """Get clinic statistics"""
    appointments = load_data("appointments")
    reviews = load_data("reviews")
    
    total_appointments = len(appointments)
    completed_appointments = len([a for a in appointments if a["status"] == "completed"])
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
    
    return {
        "totalPatients": len(set(a.get("telegramUserId") for a in appointments)),
        "totalAppointments": total_appointments,
        "completedAppointments": completed_appointments,
        "averageRating": round(avg_rating, 1),
        "totalReviews": len(reviews),
        "successRate": round((completed_appointments / total_appointments * 100) if total_appointments > 0 else 0, 1)
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint with detailed status"""
    try:
        # Check data directory
        data_accessible = DATA_DIR.exists()
        
        # Check WebSocket connections
        total_connections = sum(len(conns) for conns in manager.active_connections.values())
        active_dates = len(manager.active_connections)
        
        # Check data files
        data_files_status = {}
        for filename in ["appointments", "patient_states", "reviews", "profiles"]:
            file_path = DATA_DIR / f"{filename}.json"
            data_files_status[filename] = file_path.exists()
        
        return {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": settings.APP_VERSION,
            "debug": settings.DEBUG,
            "data_directory": str(DATA_DIR),
            "data_accessible": data_accessible,
            "websocket": {
                "active_connections": total_connections,
                "active_dates": active_dates
            },
            "storage": {
                "type": "database" if settings.USE_DATABASE else "json",
                "files": data_files_status
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

# ──────────────────────────────────────────────────────────
# ADMIN PANEL ENDPOINTS
# These power the "Admin panelga o'tish" section in the UI.
# All endpoints prefixed with /api/admin/
# ──────────────────────────────────────────────────────────

# ── 1. QABULLAR (Appointments) ────────────────────────────

@app.get("/api/admin/appointments")
async def admin_get_appointments(
    type: Optional[str] = None,      # "free" | "paid"
    status: Optional[str] = None,    # "reviewing" | "contacted" | "completed" | "cancelled" | "faol"
    search: Optional[str] = None,    # search by patient name
    date_from: Optional[str] = None, # ISO date filter start
    date_to: Optional[str] = None,   # ISO date filter end
    admin_user: str = Depends(get_admin_user)
):
    """
    Admin: Get all appointments with filtering.
    Requires admin authentication.
    """
    try:
        logger.info(f"Admin {admin_user} retrieving appointments")
        appointments = load_data("appointments")

        # Filter by type (Qabul = free, Dastur = paid)
        if type:
            appointments = [a for a in appointments if a.get("type") == type]

        # Filter by type (Qabul = free, Dastur = paid)
        if type:
            appointments = [a for a in appointments if a.get("type") == type]

        # Filter by status
        if status:
            if status == "faol":
                appointments = [a for a in appointments if a.get("status") in ("reviewing", "contacted")]
            else:
                appointments = [a for a in appointments if a.get("status") == status]

        # Search by patient name
        if search:
            search_lower = search.lower()
            appointments = [
                a for a in appointments
                if search_lower in (a.get("patientData", {}).get("fullName", "") or "").lower()
            ]

        # Date range filter
        if date_from:
            appointments = [a for a in appointments if (a.get("date") or "") >= date_from]
        if date_to:
            appointments = [a for a in appointments if (a.get("date") or "") <= date_to]

        # Sort newest first
        appointments.sort(key=lambda x: x.get("createdAt", ""), reverse=True)

        # Build response with summary info for list view
        result = []
        for a in appointments:
            pd = a.get("patientData", {})
            result.append({
                "id": a["id"],
                "type": a.get("type"),
                "date": a.get("date"),
                "time": a.get("time"),
                "status": a.get("status"),
                "doctorName": a.get("doctorName"),
                "createdAt": a.get("createdAt"),
                "patient": {
                    "fullName": pd.get("fullName"),
                    "phone": pd.get("phone"),
                    "complaint": pd.get("complaint") or pd.get("otherComplaint"),
                }
            })

        return {
            "appointments": result,
            "total": len(result),
            "byType": {
                "free": len([a for a in result if a["type"] == "free"]),
                "paid": len([a for a in result if a["type"] == "paid"]),
            }
        }
    except Exception as e:
        logger.error(f"Error retrieving admin appointments: {e}")
        raise HTTPException(500, "Failed to retrieve appointments")


@app.get("/api/admin/appointments/{appointment_id}")
async def admin_get_appointment_detail(appointment_id: str,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Get full appointment details including complete patient profile."""
    appointments = load_data("appointments")
    apt = next((a for a in appointments if a["id"] == appointment_id), None)
    if not apt:
        raise HTTPException(404, "Appointment not found")
    return apt


@app.get("/api/admin/appointments/{appointment_id}/questionnaire")
async def admin_download_questionnaire(
    appointment_id: str,
    admin_user: str = Depends(get_admin_user)
):
    """
    Admin: Download patient questionnaire as PDF
    Returns: PDF file with all patient and appointment details
    """
    logger.info(f"Admin '{admin_user}' downloading questionnaire for appointment {appointment_id}")
    
    # Get appointment data
    appointments = load_data("appointments")
    appointment = next((a for a in appointments if a["id"] == appointment_id), None)
    if not appointment:
        raise HTTPException(404, "Appointment not found")
    
    # Get patient data
    patient_id = appointment.get("patientId")
    if not patient_id:
        raise HTTPException(400, "No patient data associated with this appointment")
    
    patients = load_data("patients")
    patient = next((p for p in patients if p["id"] == patient_id), None)
    if not patient:
        # Try to get patient data from appointment itself
        patient = {
            "fullName": appointment.get("patientName", "N/A"),
            "phone": appointment.get("phone", "N/A"),
            "birthYear": appointment.get("birthYear", "N/A"),
            "gender": appointment.get("gender", ""),
            "complaints": appointment.get("complaints", []),
            "previousTreatments": [],
            "allergies": [],
            "chronicDiseases": [],
            "currentMedications": [],
            "isProgrammeParticipant": False,
            "additionalInfo": ""
        }
    
    try:
        # Generate PDF
        pdf_buffer = questionnaire_generator.generate_questionnaire(appointment, patient)
        
        # Create filename
        patient_name = patient.get("fullName", "Patient").replace(" ", "_")
        filename = f"Anketa_{patient_name}_{appointment_id[:8]}.pdf"
        
        # Return PDF as streaming response
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        logger.error(f"Failed to generate questionnaire PDF: {str(e)}")
        raise HTTPException(500, f"Failed to generate questionnaire: {str(e)}")


@app.patch("/api/admin/appointments/{appointment_id}/status")
async def admin_update_appointment_status(
    appointment_id: str,
    body: Dict[str, Any],
    admin_user: str = Depends(get_admin_user)
):
    """
    Admin: Update appointment status.
    Valid statuses: reviewing → contacted → completed | cancelled
    """
    valid_statuses = {"reviewing", "contacted", "completed", "cancelled"}
    new_status = body.get("status")
    if new_status not in valid_statuses:
        raise HTTPException(400, f"Invalid status. Valid: {valid_statuses}")

    appointments = load_data("appointments")
    for apt in appointments:
        if apt["id"] == appointment_id:
            apt["status"] = new_status
            apt["updatedAt"] = datetime.now().isoformat()
            if new_status == "cancelled":
                apt["cancelledAt"] = datetime.now().isoformat()
            if body.get("doctorName"):
                apt["doctorName"] = body["doctorName"]
            if body.get("adminNote"):
                apt["adminNote"] = body["adminNote"]
            save_data("appointments", appointments)

            # Broadcast WebSocket update if date is set
            appointment_date = apt.get("date")
            if appointment_date and new_status == "cancelled":
                await manager.broadcast_slot_update(appointment_date, {
                    "type": "slot_cancelled",
                    "date": appointment_date,
                    "time": apt.get("time"),
                    "availableSlots": get_booked_slots(appointment_date)
                })

            return {"success": True, "status": new_status}

    raise HTTPException(404, "Appointment not found")


# ── 2. SLOTLAR (Slot Manager) ─────────────────────────────

class SlotRangeRequest(BaseModel):
    startDate: str   # ISO date: "2026-04-23"
    endDate: str     # ISO date: "2026-04-25"
    slotsPerDay: int = 3  # UI shows "kunlik slot limiti 3 ta"


@app.post("/api/admin/slots")
async def admin_generate_slots(body: SlotRangeRequest,
    admin_user: str = Depends(get_admin_user)):
    """
    Admin: Generate available slots for a date range.
    UI: 'Boshlanish sanasi' + 'Tugash sanasi' → 'Slotlarni ochish' button.
    Generates up to 3 slots per day (kunlik slot limiti).
    """
    try:
        start = date.fromisoformat(body.startDate)
        end = date.fromisoformat(body.endDate)
    except ValueError:
        raise HTTPException(400, "Invalid date format. Use YYYY-MM-DD")

    if end < start:
        raise HTTPException(400, "endDate must be >= startDate")

    if (end - start).days > 30:
        raise HTTPException(400, "Date range cannot exceed 30 days")

    slots_data = load_data("admin_slots")
    existing_dates = {s["date"] for s in slots_data}

    generated = []
    current = start
    while current <= end:
        iso = current.isoformat()
        if iso not in existing_dates and current.weekday() < 6:  # Mon–Sat
            slot_record = {
                "id": str(uuid.uuid4()),
                "date": iso,
                "slotsPerDay": body.slotsPerDay,
                "isOpen": True,
                "createdAt": datetime.now().isoformat()
            }
            slots_data.append(slot_record)
            generated.append(slot_record)
            existing_dates.add(iso)
        current += timedelta(days=1)

    save_data("admin_slots", slots_data)
    return {"success": True, "generated": len(generated), "slots": generated}


@app.get("/api/admin/slots")
async def admin_get_slots(
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    admin_user: str = Depends(get_admin_user)
):
    """Admin: Get all managed slot records with booking info."""
    slots_data = load_data("admin_slots")
    appointments = load_data("appointments")

    if date_from:
        slots_data = [s for s in slots_data if s["date"] >= date_from]
    if date_to:
        slots_data = [s for s in slots_data if s["date"] <= date_to]

    slots_data.sort(key=lambda x: x["date"])

    result = []
    for slot in slots_data:
        booked = get_booked_slots(slot["date"])
        time_slots = generate_time_slots()
        for period in time_slots:
            for ts in period["slots"]:
                ts["booked"] = ts["time"] in booked
        result.append({
            **slot,
            "bookedCount": len(booked),
            "timeSlots": time_slots
        })

    return {"slots": result, "total": len(result)}


@app.delete("/api/admin/slots/{slot_id}")
async def admin_delete_slot(slot_id: str,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Remove a slot record (close that day)."""
    slots_data = load_data("admin_slots")
    before = len(slots_data)
    slots_data = [s for s in slots_data if s["id"] != slot_id]
    if len(slots_data) == before:
        raise HTTPException(404, "Slot not found")
    save_data("admin_slots", slots_data)
    return {"success": True}


# ── 3. BEMORLAR (Patients) ────────────────────────────────

@app.get("/api/admin/patients")
async def admin_get_patients(
    search: Optional[str] = None,
    filter: Optional[str] = None,  # "dastur" = programme participants only
    admin_user: str = Depends(get_admin_user)
):
    """
    Admin: List all patients.
    UI: search by name/phone/email, filter tab 'Dastur ishtirokchilari'
    Shows: Avatar, Name, Phone, appointment count
    """
    patients = load_data("patient_states")
    appointments = load_data("appointments")

    if search:
        s = search.lower()
        patients = [
            p for p in patients
            if s in (p.get("fullName") or "").lower()
            or s in (p.get("phone") or "").lower()
            or s in (p.get("email") or "").lower()
        ]

    result = []
    for p in patients:
        uid = p.get("telegramUserId")
        user_apts = [a for a in appointments if a.get("telegramUserId") == uid]
        is_programme = any(a["type"] == "paid" for a in user_apts)

        if filter == "dastur" and not is_programme:
            continue

        result.append({
            "telegramUserId": uid,
            "fullName": p.get("fullName"),
            "phone": p.get("phone"),
            "email": p.get("email"),
            "appointmentCount": len(user_apts),
            "isProgrammeParticipant": is_programme,
            "lastAppointment": max(
                (a.get("createdAt", "") for a in user_apts), default=None
            )
        })

    return {"patients": result, "total": len(result)}


@app.get("/api/admin/patients/{telegram_user_id}")
async def admin_get_patient_detail(telegram_user_id: int,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Full patient profile + appointment history."""
    patients = load_data("patient_states")
    patient = next(
        (p for p in patients if p.get("telegramUserId") == telegram_user_id), None
    )
    if not patient:
        raise HTTPException(404, "Patient not found")

    appointments = load_data("appointments")
    user_apts = [
        {
            "id": a["id"],
            "type": a.get("type"),
            "date": a.get("date"),
            "time": a.get("time"),
            "status": a.get("status"),
            "doctorName": a.get("doctorName"),
            "createdAt": a.get("createdAt"),
        }
        for a in appointments
        if a.get("telegramUserId") == telegram_user_id
    ]

    return {
        "patient": patient,
        "appointments": user_apts,
        "appointmentCount": len(user_apts),
        "isProgrammeParticipant": any(a["type"] == "paid" for a in user_apts)
    }


# ── 4. XIZMATLAR (Services) CRUD ──────────────────────────

class ServiceCategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = "🦷"
    description: Optional[str] = None


class ServiceItemCreate(BaseModel):
    categoryId: str
    name: str
    price: str
    description: Optional[str] = None


@app.post("/api/admin/services/categories")
async def admin_add_service_category(body: ServiceCategoryCreate,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Add a new service category. UI: '+ Kategoriya' button."""
    services = load_data("services_override")
    new_cat = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "icon": body.icon,
        "description": body.description,
        "services": [],
        "createdAt": datetime.now().isoformat()
    }
    services.append(new_cat)
    save_data("services_override", services)
    return {"success": True, "category": new_cat}


@app.post("/api/admin/services")
async def admin_add_service(body: ServiceItemCreate,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Add a service to a category. UI: '+ Xizmat qo'shish' button."""
    services = load_data("services_override")
    for cat in services:
        if cat["id"] == body.categoryId:
            new_service = {
                "id": str(uuid.uuid4()),
                "name": body.name,
                "price": body.price,
                "description": body.description,
                "createdAt": datetime.now().isoformat()
            }
            cat.setdefault("services", []).append(new_service)
            save_data("services_override", services)
            return {"success": True, "service": new_service}
    raise HTTPException(404, "Category not found")


@app.put("/api/admin/services/{service_id}")
async def admin_update_service(service_id: str, body: Dict[str, Any],
    admin_user: str = Depends(get_admin_user)):
    """Admin: Update a service item."""
    services = load_data("services_override")
    for cat in services:
        for svc in cat.get("services", []):
            if svc["id"] == service_id:
                svc.update({k: v for k, v in body.items() if k != "id"})
                svc["updatedAt"] = datetime.now().isoformat()
                save_data("services_override", services)
                return {"success": True, "service": svc}
    raise HTTPException(404, "Service not found")


@app.delete("/api/admin/services/{service_id}")
async def admin_delete_service(service_id: str,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Delete a service item."""
    services = load_data("services_override")
    for cat in services:
        before = len(cat.get("services", []))
        cat["services"] = [s for s in cat.get("services", []) if s["id"] != service_id]
        if len(cat["services"]) < before:
            save_data("services_override", services)
            return {"success": True}
    raise HTTPException(404, "Service not found")


# ── 5. JAMOA (Team) CRUD ──────────────────────────────────

class TeamMemberCreate(BaseModel):
    name: str
    role: str
    experience: str
    description: Optional[str] = None
    gradient: Optional[List[str]] = None


@app.post("/api/admin/team")
async def admin_add_team_member(body: TeamMemberCreate,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Add a team member. UI: '+ A'zo qo'shish' button."""
    team = load_data("team_override")
    new_member = {
        "id": str(uuid.uuid4()),
        "name": body.name,
        "role": body.role,
        "experience": body.experience,
        "description": body.description,
        "gradient": body.gradient or ["#0E2A4A", "#163859"],
        "createdAt": datetime.now().isoformat()
    }
    team.append(new_member)
    save_data("team_override", team)
    return {"success": True, "member": new_member}


@app.put("/api/admin/team/{member_id}")
async def admin_update_team_member(member_id: str, body: Dict[str, Any],
    admin_user: str = Depends(get_admin_user)):
    """Admin: Update a team member."""
    team = load_data("team_override")
    for member in team:
        if member["id"] == member_id:
            member.update({k: v for k, v in body.items() if k != "id"})
            member["updatedAt"] = datetime.now().isoformat()
            save_data("team_override", team)
            return {"success": True, "member": member}
    raise HTTPException(404, "Team member not found")


@app.delete("/api/admin/team/{member_id}")
async def admin_delete_team_member(member_id: str,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Delete a team member."""
    team = load_data("team_override")
    before = len(team)
    team = [m for m in team if m["id"] != member_id]
    if len(team) == before:
        raise HTTPException(404, "Team member not found")
    save_data("team_override", team)
    return {"success": True}


# ── 6. SHARHLAR (Reviews) CRUD ────────────────────────────

@app.delete("/api/admin/reviews/{review_id}")
async def admin_delete_review(review_id: str,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Delete a review (moderation)."""
    reviews = load_data("reviews")
    before = len(reviews)
    reviews = [r for r in reviews if r["id"] != review_id]
    if len(reviews) == before:
        raise HTTPException(404, "Review not found")
    save_data("reviews", reviews)
    return {"success": True}


@app.patch("/api/admin/reviews/{review_id}")
async def admin_update_review(review_id: str, body: Dict[str, Any],
    admin_user: str = Depends(get_admin_user)):
    """Admin: Verify or hide a review."""
    reviews = load_data("reviews")
    for review in reviews:
        if review["id"] == review_id:
            if "verified" in body:
                review["verified"] = body["verified"]
            if "hidden" in body:
                review["hidden"] = body["hidden"]
            review["updatedAt"] = datetime.now().isoformat()
            save_data("reviews", reviews)
            return {"success": True}
    raise HTTPException(404, "Review not found")


# ── 7. FAQ CRUD ───────────────────────────────────────────

class FAQCreate(BaseModel):
    q: str
    a: str
    category: Optional[str] = "umumiy"


@app.post("/api/admin/faq")
async def admin_add_faq(body: FAQCreate,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Add a new FAQ. UI: '+ Savol qo'shish' button."""
    faq = load_data("faq_override")
    new_item = {
        "id": str(uuid.uuid4()),
        "q": body.q,
        "a": body.a,
        "category": body.category,
        "createdAt": datetime.now().isoformat()
    }
    faq.append(new_item)
    save_data("faq_override", faq)
    return {"success": True, "item": new_item}


@app.put("/api/admin/faq/{faq_id}")
async def admin_update_faq(faq_id: str, body: Dict[str, Any],
    admin_user: str = Depends(get_admin_user)):
    """Admin: Update a FAQ item."""
    faq = load_data("faq_override")
    for item in faq:
        if item["id"] == faq_id:
            item.update({k: v for k, v in body.items() if k != "id"})
            item["updatedAt"] = datetime.now().isoformat()
            save_data("faq_override", faq)
            return {"success": True, "item": item}
    raise HTTPException(404, "FAQ not found")


@app.delete("/api/admin/faq/{faq_id}")
async def admin_delete_faq(faq_id: str,
    admin_user: str = Depends(get_admin_user)):
    """Admin: Delete a FAQ item."""
    faq = load_data("faq_override")
    before = len(faq)
    faq = [f for f in faq if f["id"] != faq_id]
    if len(faq) == before:
        raise HTTPException(404, "FAQ not found")
    save_data("faq_override", faq)
    return {"success": True}


# ── 8. STATISTIKA (Admin Stats) ───────────────────────────

@app.get("/api/admin/stats")
async def admin_get_stats(
    date_from: Optional[str] = None,  # UI: "DAN" date filter
    date_to: Optional[str] = None,    # UI: "GACHA" date filter

    admin_user: str = Depends(get_admin_user)):
    """
    Admin Statistika page:
    - 4 stat cards: Jami qabullar, Bemorlar soni, Dastur ishtirokchilari, Sharhlar
    - Umumiy ma'lumot: Xizmat turlari, Jamoa a'zolari, Kunlik slot limiti
    - Xizmat turi bo'yicha: Qabulga yozilish vs Dasturga qo'shilish breakdown
    - Supports date range filtering
    """
    appointments = load_data("appointments")
    reviews = load_data("reviews")
    patients = load_data("patient_states")
    admin_slots = load_data("admin_slots")
    services_data = load_data("services_override")

    # Apply date filters
    if date_from:
        appointments = [a for a in appointments if (a.get("date") or "") >= date_from]
    if date_to:
        appointments = [a for a in appointments if (a.get("date") or "") <= date_to]

    total_apts = len(appointments)
    free_apts = [a for a in appointments if a.get("type") == "free"]
    paid_apts = [a for a in appointments if a.get("type") == "paid"]
    programme_patient_ids = set(a.get("telegramUserId") for a in paid_apts)

    avg_rating = (
        sum(r["rating"] for r in reviews) / len(reviews)
        if reviews else 0
    )

    # Services count from either admin overrides or static data
    service_categories = services_data if services_data else []
    total_services = sum(len(c.get("services", [])) for c in service_categories)
    total_categories = len(service_categories)

    team = load_data("team_override")
    total_team = len(team)

    # Slot limit (from most recent admin_slots entry or default 3)
    slot_limit = admin_slots[-1]["slotsPerDay"] if admin_slots else 3

    return {
        # 4 stat cards
        "totalAppointments": total_apts,
        "totalPatients": len(patients),
        "programmeParticipants": len(programme_patient_ids),
        "totalReviews": len(reviews),

        # Umumiy ma'lumot section
        "general": {
            "serviceCategories": total_categories,
            "totalServices": total_services,
            "teamMembers": total_team,
            "dailySlotLimit": slot_limit,
        },

        # Xizmat turi bo'yicha chart
        "byType": {
            "free": {
                "count": len(free_apts),
                "percent": round(len(free_apts) / total_apts * 100 if total_apts else 0, 1)
            },
            "paid": {
                "count": len(paid_apts),
                "percent": round(len(paid_apts) / total_apts * 100 if total_apts else 0, 1)
            }
        },

        # Extra metrics
        "averageRating": round(avg_rating, 1),
        "completedAppointments": len([a for a in appointments if a.get("status") == "completed"]),
        "cancelledAppointments": len([a for a in appointments if a.get("status") == "cancelled"]),
    }

@app.get("/api/admin/services")
async def admin_get_services(admin_user: str = Depends(get_admin_user)):
    """Admin: Get services (from override or inline data)."""
    logger.info(f"Admin '{admin_user}' fetching services")
    services = load_data("services_override")
    if not services:
        # Return inline services data
        services_response = await get_services()
        services = services_response.get("categories", [])
    return {"services": services}

@app.get("/api/admin/team")
async def admin_get_team(admin_user: str = Depends(get_admin_user)):
    """Admin: Get team members (from override or inline data)."""
    logger.info(f"Admin '{admin_user}' fetching team")
    team = load_data("team_override")
    if not team:
        # Return inline team data
        team_response = await get_team()
        team = team_response.get("team", [])
    return {"team": team}

@app.get("/api/admin/reviews")
async def admin_get_all_reviews(admin_user: str = Depends(get_admin_user)):
    """Admin: Get all reviews for moderation."""
    logger.info(f"Admin '{admin_user}' fetching all reviews")
    reviews = load_data("reviews")
    return {"reviews": reviews, "total": len(reviews)}

@app.get("/api/admin/faq")
async def admin_get_faq(admin_user: str = Depends(get_admin_user)):
    """Admin: Get FAQ items (from override or inline data)."""
    logger.info(f"Admin '{admin_user}' fetching FAQ")
    faq = load_data("faq_override")
    if not faq:
        # Return inline FAQ data
        faq_response = await get_faq()
        faq = faq_response.get("faq", [])
    return {"faq": faq}

@app.get("/api/admin/frozen-days")
async def admin_get_frozen_days(admin_user: str = Depends(get_admin_user)):
    """Admin: Get frozen days list."""
    logger.info(f"Admin '{admin_user}' fetching frozen days")
    frozen = load_data("frozen_days")
    return {"frozenDays": frozen}

@app.get("/api/admin/booked-slots")
async def admin_get_booked_slots(admin_user: str = Depends(get_admin_user)):
    """Admin: Get all booked slots."""
    logger.info(f"Admin '{admin_user}' fetching booked slots")
    booked = load_data("booked_slots")
    return {"bookedSlots": booked}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)

