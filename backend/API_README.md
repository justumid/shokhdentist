# ShokhDentist — Complete API Reference

## Base URL
```
http://localhost:8000
```

## Authentication

All protected endpoints require a Telegram Mini App header:
```
Authorization: tma <initData>
```

**Dev bypass** (when `BOT_TOKEN` is empty):
```
X-Dev-User-Id: 12345678
```

---

## 📱 Patient (Public) Endpoints

### Init / Session
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/init` | Initialize session, upsert user profile |
| `GET` | `/api/health` | Health check |

### Patient Profile
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/patient/state` | Get patient profile + section progress |
| `POST` | `/api/patient/state` | Save full PatientState |

**PatientState fields:**
```
Personal:  fullName, phone (+998), birthDate, email, address, job, emergencyName, emergencyPhone
Medical:   diabet, heart, bp, allergy, meds, pregnancy
Dental:    toothpain, gumbleed, lastVisit, sensitivity, bruxism, otherComplaint
Consult:   brushFreq, floss, badBreath, smoking, gumBleed, bleedDur, bleedWhen[], complaint
Consent:   photoConsent, programConsent (paid only)
Appt:      preferredDate, preferredTime, hasSubmitted, requestType
```

Section weights: personal=30%, medical=20%, dental=20%, consult=20%, consent=10%

---

### Appointments
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/appointments` | Create appointment (free or paid flow) |
| `GET` | `/api/appointments` | Get current user's appointments |
| `PATCH` | `/api/appointments/{id}` | User-cancel own appointment |

**POST body:**
```json
{
  "patientData": { ...PatientState },
  "type": "free | paid",
  "selectedSlot": { "date": "2026-04-23", "time": "09:00" }
}
```

**Appointment statuses:** `reviewing` → `contacted` → `completed` | `cancelled`

---

### Time Slots
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/slots/available?date=YYYY-MM-DD` | Available slots for a date |
| `WS` | `/ws/slots/{date}` | Real-time slot updates via WebSocket |

**Slot periods:**
- Ertalab: 09:00, 10:00, 11:00
- Kunduzi: 12:00, 13:00, 14:00, 15:00
- Kechqurun: 16:00, 17:00, 18:00

---

### Reviews
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/reviews` | Get reviews (filter + sort) |
| `POST` | `/api/reviews` | Submit a review |

**GET params:** `?tag=<tag>&rating=1-5&sort=newest|oldest|highest|lowest&limit=50`

**Available tags:** Mehribon shifokorlar, Og'riqsiz davolash, Toza va qulay muhit, Sifatli xizmat, Qulay narxlar, Tez qabul

---

### Static Data
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/services` | 4 categories, 26 dental services with prices |
| `GET` | `/api/team` | 4 doctors (name, role, experience, gradient) |
| `GET` | `/api/faq` | 20 FAQ items in Uzbek |
| `GET` | `/api/stats` | Clinic summary statistics |

---

## 🔧 Admin Panel Endpoints

Accessible via UI: **Profile → "Admin panelga o'tish"**.  
No separate auth — same Telegram auth as patient endpoints.

### Qabullar (Appointments)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/appointments` | All appointments with search/filter/date range |
| `GET` | `/api/admin/appointments/{id}` | Full appointment + patient profile |
| `PATCH` | `/api/admin/appointments/{id}/status` | Update status + assign doctor |

**GET params:** `?type=free|paid&status=faol|reviewing|contacted|completed|cancelled&search=name&date_from=&date_to=`

**PATCH body:** `{ "status": "contacted", "doctorName": "Dr. Shakhbozbek", "adminNote": "..." }`

---

### Slotlar (Slot Manager)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/slots` | Generate slots for a date range |
| `GET` | `/api/admin/slots` | List all slot records with booking info |
| `DELETE` | `/api/admin/slots/{id}` | Remove/close a slot day |

**POST body:** `{ "startDate": "2026-04-23", "endDate": "2026-04-25", "slotsPerDay": 3 }`

---

### Bemorlar (Patients)
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/patients` | All patients with search + dastur filter |
| `GET` | `/api/admin/patients/{telegramUserId}` | Full patient profile + appointment history |

**GET params:** `?search=name|phone|email&filter=dastur`

---

### Xizmatlar (Services CRUD)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/services/categories` | Add category |
| `POST` | `/api/admin/services` | Add service to category |
| `PUT` | `/api/admin/services/{id}` | Update service |
| `DELETE` | `/api/admin/services/{id}` | Delete service |

---

### Jamoa (Team CRUD)
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/team` | Add team member |
| `PUT` | `/api/admin/team/{id}` | Update team member |
| `DELETE` | `/api/admin/team/{id}` | Delete team member |

---

### Sharhlar (Reviews Moderation)
| Method | Path | Description |
|---|---|---|
| `PATCH` | `/api/admin/reviews/{id}` | Verify or hide a review |
| `DELETE` | `/api/admin/reviews/{id}` | Delete a review |

---

### FAQ CRUD
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/admin/faq` | Add FAQ item |
| `PUT` | `/api/admin/faq/{id}` | Update FAQ item |
| `DELETE` | `/api/admin/faq/{id}` | Delete FAQ item |

---

### Statistika
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Full clinic stats with date range filter |

**GET params:** `?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD`

**Response:**
```json
{
  "totalAppointments": 5,
  "totalPatients": 5,
  "programmeParticipants": 2,
  "totalReviews": 3,
  "general": {
    "serviceCategories": 4,
    "totalServices": 26,
    "teamMembers": 4,
    "dailySlotLimit": 3
  },
  "byType": {
    "free": { "count": 3, "percent": 60.0 },
    "paid": { "count": 2, "percent": 40.0 }
  },
  "averageRating": 4.7
}
```

---

## Error Codes
| Code | Meaning |
|---|---|
| 400 | Missing required fields / invalid data |
| 404 | Resource not found |
| 409 | Time slot already booked |

## Interactive Docs
```
http://localhost:8000/docs
```
