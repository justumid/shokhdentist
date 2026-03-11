# ShokhDentist — Backend Developer Guide

## Project Overview

Mobile-first dental clinic web app for patient onboarding and appointment booking. Currently fully frontend (React + TypeScript + Vite) with all data in localStorage. This guide covers everything you need to build the backend.

---

## Tech Stack (Frontend)

- **React 18** + **TypeScript** + **Vite**
- **React Router v7** (client-side routing)
- **Phosphor Icons**, **Radix UI / shadcn**
- **State**: localStorage (`shokh_v2` key)

---

## App Architecture

```
main.tsx → BrowserRouter → Layout.tsx → <Outlet> → Route pages
```

**Layout.tsx** manages all shared state and passes it to child routes via `useOutletContext()`.

### Routes

| Path           | Tab     | Page Component     |
|----------------|---------|--------------------|
| `/`            | home    | HomePage           |
| `/services`    | services| ServicesPage       |
| `/appointment` | appt    | AppointmentPage    |
| `/contact`     | contact | ContactPage        |
| `/profile`     | profile | ProfilePage        |

---

## Data Models

### PatientState (main entity)

This is the core model — everything the user fills out across the wizard steps.

```typescript
interface PatientState {
  // === PERSONAL INFO ===
  fullName?: string       // required
  phone?: string          // required, format: +998 XX XXX XX XX
  birthDate?: string      // required, format: YYYY-MM-DD
  email?: string
  address?: string
  job?: string
  emergencyName?: string
  emergencyPhone?: string

  // === MEDICAL HISTORY ===
  diabet?: boolean        // required
  heart?: boolean         // required
  bp?: boolean            // required (blood pressure)
  allergy?: string        // free text
  meds?: string           // current medications
  pregnancy?: string      // free text

  // === DENTAL HISTORY ===
  lastVisit?: string      // "6oy" | "1yil" | "2yil+" | "hech"
  toothpain?: boolean     // required
  gumbleed?: boolean      // required
  sensitivity?: boolean
  bruxism?: boolean
  otherComplaint?: string

  // === CONSULTATION FORM ===
  brushFreq?: string      // "1marta" | "2marta" | "yoq"
  floss?: string          // "har_kun" | "bazan" | "yoq"
  badBreath?: boolean
  smoking?: boolean
  bleedDur?: string       // "1-2hafta" | "1-3oy" | "bir_necha_yil"
  bleedWhen?: string[]    // ["tish_yuvish", "ovqat", "o'z_o'zi", "doim"]
  complaint?: string      // main complaint, free text

  // === CONSENT ===
  photoConsent?: boolean
  programConsent?: boolean // required for paid flow only

  // === APPOINTMENT SELECTION ===
  preferredDate?: string  // YYYY-MM-DD (free flow only)
  preferredTime?: string  // HH:mm (free flow only)

  // === METADATA ===
  hasSubmitted?: boolean
  requestType?: string    // "free" | "paid"
}
```

### Appointment (currently mock)

```typescript
interface Appointment {
  id: string
  type: "free" | "paid"
  date: string            // "2025-04-23"
  time: string            // "09:00"
  status: "reviewing" | "contacted" | "confirmed" | "cancelled"
  doctorName?: string
}
```

### Review

```typescript
interface Review {
  id: string
  name: string
  rating: number          // 1-5
  tags: string[]          // e.g. ["cleaning", "implant"]
  text: string
  date: string            // ISO date
}
```

### FAQ Item

```typescript
interface FaqItem {
  id: number
  q: string               // question (Uzbek)
  a: string               // answer (Uzbek)
}
```

---

## Two Appointment Flows

### Flow 1: "Qabulga yozilish" (Free Appointment)

User books a regular checkup — **no slot picker**, user picks their preferred date/time in the last wizard step.

```
Button click → Navigate to /appointment → Start wizard directly
  → Step 1: Personal info
  → Step 2: Medical history
  → Step 3: Dental history
  → Step 4: Consultation form
  → Step 5: "Sana va vaqt" (date/time picker + photo consent)
  → Submit
```

**Key**: Already-completed sections (100% filled) are skipped automatically.

### Flow 2: "Dasturga qo'shilish" (Paid Program)

User joins the 6-month preventive program — **slot picker shown first** with booked slots.

```
Button click → Navigate to /appointment → Open slot picker overlay
  → Pick date → Pick time slot (booked slots are disabled)
  → "Tasdiqlash" → Start wizard
  → Step 1-4: Same as free flow
  → Step 5: "Roziliklar" (photo consent + program consent checkbox — REQUIRED)
  → Submit
```

---

## API Endpoints Needed

### 1. Appointments

```
POST   /api/appointments
  Body: { patientData: PatientState, type: "free" | "paid", selectedSlot?: { date, time } }
  Response: { id, status: "reviewing" }

GET    /api/appointments
  Query: ?patientPhone=+998...
  Response: Appointment[]

PATCH  /api/appointments/:id
  Body: { status: "confirmed" | "cancelled" | "contacted" }
```

### 2. Available Slots (for paid flow)

```
GET    /api/slots/available
  Query: ?date=2025-04-23
  Response: {
    dates: string[],          // available dates
    timeSlots: {
      period: "morning" | "afternoon" | "evening",
      label: string,          // "Ertalab 09:00 – 12:00"
      slots: {
        time: string,         // "09:00"
        booked: boolean
      }[]
    }[]
  }
```

**Time periods currently defined:**
- Ertalab: 09:00 – 12:00
- Kunduzi: 12:00 – 16:00
- Kechqurun: 16:00 – 19:00

Slots are in 60-minute intervals.

### 3. Reviews

```
GET    /api/reviews
  Query: ?tag=cleaning&sort=newest&rating=5
  Response: Review[]

POST   /api/reviews
  Body: { name, rating, tags, text }
```

**Available tags:** `"tozalash"`, `"implant"`, `"breket"`, `"oqartirish"`, `"plomba"`, `"boshqa"`

### 4. Services (optional — currently hardcoded)

```
GET    /api/services
  Response: {
    categories: {
      name: string,
      services: { name: string, price: string, unit?: string }[]
    }[]
  }
```

### 5. Team (optional — currently hardcoded)

```
GET    /api/team
  Response: { name, role, experience, photo? }[]
```

### 6. FAQ (optional — currently hardcoded)

```
GET    /api/faq
  Response: FaqItem[]
```

---

## Wizard Steps & Required Fields

The wizard validates by section progress percentage. Each section has required fields:

| Section    | Weight | Required Fields                        |
|------------|--------|----------------------------------------|
| personal   | 30%    | fullName, phone, birthDate             |
| medical    | 20%    | diabet, heart, bp                      |
| dental     | 20%    | toothpain, gumbleed                    |
| consult    | 20%    | bleedDur (if gumbleed), complaint      |
| consent    | 10%    | photoConsent, programConsent (paid only)|

**Skip logic:** If a section is already 100% complete from a previous submission, it's skipped in the wizard.

---

## localStorage Keys

| Key             | Purpose                                  |
|-----------------|------------------------------------------|
| `shokh_v2`      | Full PatientState JSON                   |
| `shokh_reviews` | User-submitted reviews (array of Review) |

When backend is ready, replace localStorage reads/writes with API calls in:
- `src/app/components/use-patient-state.ts` — patient data
- `src/app/components/review-data.ts` — reviews
- `src/app/components/appointment-page.tsx` — appointments list & slot availability

---

## Integration Points (where to connect)

### 1. Submit appointment (highest priority)
**File:** `src/app/components/form-overlay.tsx`
**Function:** `handleSave()` → calls `onSave(localRef.current, isLast, nextId)`
**When `isLast === true`:** This is the final submission — POST to your API here.

### 2. Fetch available slots
**File:** `src/app/components/appointment-page.tsx`
**Constants to replace:** `AVAILABLE_DATES`, `TIME_PERIODS`, `MOCK_BOOKED`, `getBookedSlots()`
**Replace with:** `useEffect` → fetch from `/api/slots/available?date=...`

### 3. Fetch appointment list
**File:** `src/app/components/appointment-page.tsx`
**State:** `appointments` array (currently hardcoded mock data)
**Replace with:** `useEffect` → fetch from `/api/appointments`

### 4. Submit review
**File:** `src/app/components/review-data.ts`
**Function:** `addReview()` — currently saves to localStorage

### 5. Load patient data
**File:** `src/app/components/use-patient-state.ts`
**Hook:** `usePatientState()` — currently reads/writes localStorage
**Replace with:** fetch on mount, debounced save on change

---

## Language

All UI text is in **Uzbek (Latin script)**. Backend responses containing user-facing text should also be in Uzbek.

---

## Notes

- App is mobile-only (max-width: 480px, centered on desktop)
- No authentication currently — patient is identified by phone number
- The `consult` section form resets each time the wizard enters it (fresh consultation each visit)
- `programConsent` checkbox is **required** to submit in paid flow — button is disabled until checked
- Free flow collects preferred date/time as a **request** (not a confirmed booking)
- Paid flow selects a specific slot from available slots (confirmed booking)
