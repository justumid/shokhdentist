# Telegram Mini App Backend API

## 🚀 Complete Backend for Telegram Web Mini App

### Features

✅ **Telegram Web App Integration** - Full validation and user context
✅ **Patient State Management** - Auto-save with progress tracking  
✅ **Smart Appointment System** - Free consultations + Paid program slots
✅ **Real-time Slot Management** - Conflict prevention and availability
✅ **Review System** - Verified reviews from Telegram users
✅ **Progress Tracking** - Section-based completion percentages
✅ **User Profiles** - Telegram user data integration
✅ **Statistics Dashboard** - Clinic performance metrics

## 🔧 API Endpoints

### 🎯 Telegram Mini App Core
```
GET  /api/init                    # Initialize app with Telegram user
GET  /api/patient/state           # Get patient form state  
POST /api/patient/state           # Save patient form state
GET  /api/health                  # Health check
GET  /api/stats                   # Clinic statistics
```

### 📅 Appointments
```
POST /api/appointments            # Create appointment (free/paid)
GET  /api/appointments            # Get user appointments
PATCH /api/appointments/{id}      # Update appointment status
```

### 🕐 Time Slots
```
GET /api/slots/available?date=... # Get available slots with booking status
```

### ⭐ Reviews
```
GET  /api/reviews?tag=&rating=&sort= # Get filtered reviews
POST /api/reviews                    # Submit review (one per user)
```

### 📋 Static Data
```
GET /api/services                 # Services catalog with pricing
GET /api/team                     # Team members with specializations
GET /api/faq                      # FAQ with categories
```

## 🔐 Telegram Authentication

### Authorization Header
```
Authorization: tma query_id=...&user=...&hash=...
```

### Automatic User Context
- Extracts Telegram user data from init_data
- Validates hash with bot token
- Links all data to Telegram user ID
- Auto-updates user profiles

## 📊 Progress Tracking System

### Section Weights
- **Personal Info**: 30% (name, phone, birthdate required)
- **Medical History**: 20% (diabetes, heart, BP required)  
- **Dental History**: 20% (toothpain, gumbleed required)
- **Consultation**: 20% (complaint required, bleedDur if gumbleed)
- **Consent**: 10% (photo consent + program consent for paid)

### Smart Skip Logic
- Completed sections (100%) are skipped in wizard
- Real-time progress calculation
- Weighted total progress percentage

## 🏥 Appointment Flows

### Free Consultation Flow
```json
{
  "type": "free",
  "patientData": { ... },
  "selectedSlot": null  // User picks preferred date/time
}
```

### Paid Program Flow  
```json
{
  "type": "paid", 
  "patientData": { ... },
  "selectedSlot": {
    "date": "2025-04-23",
    "time": "10:00"
  }
}
```

## 🕒 Time Slot System

### Operating Hours
- **Ertalab**: 09:00 – 12:00 (Morning)
- **Kunduzi**: 12:00 – 16:00 (Afternoon)  
- **Kechqurun**: 16:00 – 19:00 (Evening)

### Slot Management
- 60-minute intervals
- Real-time booking conflict prevention
- Working days only (Mon-Sat)
- 30 days advance booking

## 💾 Data Models

### PatientState (25+ fields)
```typescript
interface PatientState {
  // Personal (30% weight)
  fullName?: string       // required
  phone?: string          // required (+998 format)
  birthDate?: string      // required (YYYY-MM-DD)
  email?: string
  address?: string
  job?: string
  emergencyName?: string
  emergencyPhone?: string

  // Medical (20% weight)  
  diabet?: boolean        // required
  heart?: boolean         // required
  bp?: boolean            // required
  allergy?: string
  meds?: string
  pregnancy?: string

  // Dental (20% weight)
  lastVisit?: string      // "6oy"|"1yil"|"2yil+"|"hech"
  toothpain?: boolean     // required
  gumbleed?: boolean      // required
  sensitivity?: boolean
  bruxism?: boolean
  otherComplaint?: string

  // Consultation (20% weight)
  brushFreq?: string      // "1marta"|"2marta"|"yoq"
  floss?: string          // "har_kun"|"bazan"|"yoq"
  badBreath?: boolean
  smoking?: boolean
  bleedDur?: string       // required if gumbleed=true
  bleedWhen?: string[]    // multiple choice
  complaint?: string      // main complaint

  // Consent (10% weight)
  photoConsent?: boolean  // required
  programConsent?: boolean // required for paid flow

  // Appointment Selection
  preferredDate?: string  // free flow
  preferredTime?: string  // free flow
}
```

## 🔄 Frontend Integration

### Initialize App
```javascript
// Get Telegram WebApp init data
const initData = window.Telegram.WebApp.initData;

// Initialize backend
const response = await fetch('/api/init', {
  headers: {
    'Authorization': `tma ${initData}`
  }
});
```

### Save Patient Data
```javascript
// Auto-save on form changes
const saveState = async (patientData) => {
  await fetch('/api/patient/state', {
    method: 'POST',
    headers: {
      'Authorization': `tma ${initData}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patientData)
  });
};
```

### Submit Appointment
```javascript
// Final submission
const submitAppointment = async (patientData, type, selectedSlot) => {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Authorization': `tma ${initData}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      patientData,
      type,
      selectedSlot
    })
  });
};
```

## 🚀 Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Setup environment  
cp .env.example .env
# Add BOT_TOKEN

# Start backend
python main.py
```

**API Docs**: http://localhost:8000/docs

## 🔒 Security Features

- Telegram WebApp data validation with HMAC
- User identification via Telegram ID
- One review per user enforcement  
- Slot booking conflict prevention
- Input validation and sanitization

## 📱 Telegram Mini App Features

- **Auto User Detection** - No manual registration needed
- **Seamless Integration** - Native Telegram UI/UX
- **Offline Support** - Local state management
- **Progress Persistence** - Auto-save form data
- **Real-time Updates** - Live slot availability
- **Verified Reviews** - Telegram user verification

## 🎯 Production Ready

- Comprehensive error handling
- Input validation with Pydantic
- CORS configuration for Telegram domains
- Health check endpoints
- Structured logging ready
- Database migration ready (JSON → PostgreSQL)

The backend is specifically designed for Telegram Mini Apps with full user context, progress tracking, and seamless integration!
