# ShokhDentist — Backend Developer Guide

## Overview

FastAPI backend for a **Telegram Mini App** dental clinic. Patients fill out a multi-step profile wizard, book appointments, and write reviews — all inside Telegram. An **Admin Panel** (accessible from the Profile tab) allows clinic staff to manage appointments, patients, slots, services, team, FAQ, and view statistics.

---

## Tech Stack (Frontend)

- **React 18** + **Vite** + **Tailwind CSS v4**
- **React Router v7** (client-side routing)
- **Phosphor Icons**
- **State**: localStorage (`shokh_v2`) — to be replaced by API calls

---

## App Routes

| Path | Tab | Page |
|---|---|---|
| `/` | Asosiy | Home (hero, services grid, team, reviews, FAQ) |
| `/services` | Xizmatlar | Services accordion |
| `/appointment` | Qabul | Appointment list + slot picker |
| `/contact` | Aloqa | Contact info + map |
| `/profile` | Profil | Profile wizard + Admin Panel access |

---

## Data Models

### PatientState
Core model — everything the user fills across the 5-step wizard.

```typescript
interface PatientState {
  // Personal (30% weight) — required: fullName, phone, birthDate
  fullName?: string; phone?: string; birthDate?: string;
  email?: string; address?: string; job?: string;
  emergencyName?: string; emergencyPhone?: string;

  // Medical (20% weight) — required: diabet, heart, bp
  diabet?: boolean; heart?: boolean; bp?: boolean;
  allergy?: string; meds?: string; pregnancy?: string;

  // Dental (20% weight) — required: toothpain, gumbleed
  toothpain?: boolean; gumbleed?: boolean;
  lastVisit?: "6oy" | "1yil" | "2yil+" | "hech";
  sensitivity?: boolean; bruxism?: boolean; otherComplaint?: string;

  // Consult (20% weight) — required: bleedDur (if gumBleed=true), complaint
  brushFreq?: "1marta" | "2marta" | "yoq";
  floss?: "har_kun" | "bazan" | "yoq";
  badBreath?: boolean; smoking?: boolean;
  gumBleed?: boolean;  // Note: uppercase B — consult section alias of gumbleed
  bleedDur?: "1-2hafta" | "1-3oy" | "bir_necha_yil";
  bleedWhen?: string[];  // ["tish_yuvish", "ovqat", "o'z_o'zi", "doim"]
  complaint?: string;

  // Consent (10% weight) — required: photoConsent; programConsent only for paid
  photoConsent?: boolean; programConsent?: boolean;

  // Appointment preferences (free flow)
  preferredDate?: string; preferredTime?: string;
  hasSubmitted?: boolean; requestType?: "free" | "paid";
}
```

### Appointment

```typescript
interface Appointment {
  id: string;
  type: "free" | "paid";
  date: string;        // ISO: "2026-04-23"
  time: string;        // "09:00"
  status: "reviewing" | "contacted" | "completed" | "cancelled";
  doctorName?: string;
  adminNote?: string;
  createdAt: string;
}
```

### Review

```typescript
interface Review {
  id: string;
  name: string;
  rating: number;      // 1–5
  tags: string[];
  text: string;
  date: string;        // ISO
  verified: boolean;
  hidden?: boolean;
}
```

---

## Two Appointment Flows

### Flow 1 — "Qabulga yozilish" (Free)
```
Home CTA → navigate to /appointment → open wizard
  → Step 1: Personal info
  → Step 2: Medical history
  → Step 3: Dental history
  → Step 4: Consultation form
  → Step 5: Date/time preference + photo consent
  → POST /api/appointments (type: "free")
```
Already-complete sections are skipped automatically.

### Flow 2 — "Dasturga qo'shilish" (Paid Program)
```
Home card → navigate to /appointment → slot picker overlay
  → Pick date (available from admin-generated slots)
  → Pick time (booked slots shown as disabled)
  → Confirm slot → open wizard (same steps 1–4)
  → Step 5: Photo consent + Program consent (required)
  → POST /api/appointments (type: "paid", selectedSlot: {date, time})
```

---

## Admin Panel

Accessed via **Profile → "Admin panelga o'tish"**.

### 4 Admin Tabs

#### 1. Qabullar
- Lists all appointments
- Search by patient name
- Filter tabs: Barchasi / Qabul (free) / Dastur (paid)
- Status badges: **Faol** (reviewing/contacted) / **Bekor qilingan** (cancelled)
- Tap → appointment detail → update status

#### 2. Slotlar
- Field: Boshlanish sanasi (start date)
- Field: Tugash sanasi (end date)
- Button: "Slotlarni ochish" → `POST /api/admin/slots`
- Lists generated slot days with booking info per time slot
- Kunlik slot limiti: 3 ta (default)

#### 3. Bemorlar
- Lists all patients
- Search by name / phone / email
- Filter tab: Dastur ishtirokchilari (paid programme members only)
- Tap → full patient profile + appointment history

#### 4. Boshqalar (slide-up menu)
| Item | Action |
|---|---|
| Xizmatlar | Add/edit/delete service categories and items |
| Jamoa | Add/edit/delete team members |
| Sharhlar | View all reviews, verify or delete |
| FAQ | Add/edit/delete FAQ items |
| Statistika | Date-range filtered stats dashboard |

**Statistika cards:**
- Jami qabullar, Bemorlar soni, Dastur ishtirokchilari, Sharhlar
- Umumiy ma'lumot: service count, team count, kunlik slot limiti
- Xizmat turi bo'yicha: Qabulga yozilish % / Dasturga qo'shilish %

---

## Wizard Completion Logic

```
totalProgress = Σ (section_completion% × weight) / 100
```

| Section | Weight | Required to reach 100% |
|---|---|---|
| personal | 30% | fullName, phone, birthDate |
| medical | 20% | diabet, heart, bp |
| dental | 20% | toothpain, gumbleed |
| consult | 20% | complaint (+ bleedDur if gumBleed=true) |
| consent | 10% | photoConsent (+ programConsent for paid) |

---

## Auth

**Production:** `Authorization: tma <initData>` — HMAC-validated with `BOT_TOKEN`

**Development:** Set `BOT_TOKEN=` (empty) — returns mock user automatically.  
Or: `X-Dev-User-Id: 12345678` header — uses that integer as user ID.

---

## Storage

JSON files in `data/` directory. **Production:** replace with PostgreSQL.

| File | Purpose |
|---|---|
| `appointments.json` | Patient appointments |
| `patient_states.json` | Patient wizard data |
| `reviews.json` | User reviews |
| `admin_slots.json` | Admin-generated slot dates |
| `services_override.json` | Admin-managed services |
| `team_override.json` | Admin-managed team |
| `faq_override.json` | Admin-managed FAQ |
| `profiles.json` | Telegram user profiles |

---

## Frontend Integration Points

When connecting the API to the React frontend, replace localStorage calls in:

| File | What to Replace |
|---|---|
| `use-patient-state.ts` | localStorage read/write → `GET/POST /api/patient/state` |
| `appointment-page.tsx` | Hardcoded dates + `MOCK_BOOKED` → `GET /api/slots/available` |
| `appointment-page.tsx` | Hardcoded appointments → `GET /api/appointments` |
| `form-overlay.tsx` | `handleSave(isLast=true)` → `POST /api/appointments` |
| `review-data.ts` | `addReview()` localStorage → `POST /api/reviews` |

Also connect the **WebSocket** `/ws/slots/{date}` for real-time slot updates in the slot picker.

---

## Language

All UI text is in **Uzbek (Latin script)**. Backend user-facing messages should also be in Uzbek.

---

## Production Checklist

- [ ] Replace JSON storage with PostgreSQL / MongoDB
- [ ] Add rate limiting (e.g. `slowapi`)
- [ ] Add structured logging
- [ ] Set `BOT_TOKEN` in production environment
- [ ] Configure CORS to production Vercel URL only
- [ ] Add admin authentication (JWT or Telegram-based role check)
