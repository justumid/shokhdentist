# ShokhDentist — Backend API

FastAPI backend for the Shokhdentist Telegram Mini App dental clinic system.

## Quick Start

```bash
pip install -r requirements.txt
cp .env.example .env   # Set BOT_TOKEN and WEB_APP_URL
python3 main.py
# Docs: http://localhost:8000/docs
```

## Architecture

```
Telegram Bot (bot.py)
    ↓ /start → contact share → web-app link
React Mini App (shokhdentist.vercel.app)
    ↓ Authorization: tma <initData>
FastAPI Backend (main.py)
    ↓ JSON file store (data/*.json)
```

## Telegram Bot Flow

1. User sends `/start` → bot shows "Ro'yxatdan o'tish" button
2. User shares contact → bot saves phone + name
3. Bot replies with a **Web App** button → opens the Mini App in Telegram
4. Mini App sends `Authorization: tma <initData>` on every request
5. Backend validates HMAC signature using `BOT_TOKEN`

## Development (no Telegram)

Set `BOT_TOKEN=""` in `.env` — backend returns a default dev user automatically.  
Or send `X-Dev-User-Id: <integer>` header to use a specific user ID.

## Data Files (`data/`)

| File | Contents |
|---|---|
| `appointments.json` | All patient appointments |
| `patient_states.json` | Patient profile wizard data |
| `reviews.json` | User-submitted reviews |
| `admin_slots.json` | Admin-generated slot date records |
| `services_override.json` | Admin-edited services catalog |
| `team_override.json` | Admin-edited team members |
| `faq_override.json` | Admin-edited FAQ items |
| `profiles.json` | Telegram user profiles |

## Running Both Services

```bash
./start.sh   # starts both uvicorn + bot
```
