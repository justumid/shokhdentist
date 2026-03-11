# Real-time Slot Updates - Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DENTAL BOOKING SYSTEM                        │
│              With Real-time WebSocket Updates                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  Browser 1   │      │  Browser 2   │      │  Browser 3   │
│   Client A   │      │   Client B   │      │   Client C   │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │ WebSocket           │ WebSocket           │ WebSocket
       │ /ws/slots/          │ /ws/slots/          │ /ws/slots/
       │ 2026-03-12          │ 2026-03-12          │ 2026-03-13
       │                     │                     │
       └─────────────────────┴─────────────────────┘
                             │
                             ▼
              ┌──────────────────────────────┐
              │   FastAPI Backend Server     │
              │   (main.py)                  │
              │                              │
              │  ┌────────────────────────┐  │
              │  │  ConnectionManager     │  │
              │  │                        │  │
              │  │  active_connections:   │  │
              │  │  {                     │  │
              │  │   "2026-03-12": {      │  │
              │  │     <WebSocket A>,     │  │
              │  │     <WebSocket B>      │  │
              │  │   },                   │  │
              │  │   "2026-03-13": {      │  │
              │  │     <WebSocket C>      │  │
              │  │   }                    │  │
              │  │  }                     │  │
              │  └────────────────────────┘  │
              │                              │
              │  REST API Endpoints:         │
              │  • POST /api/appointments    │
              │  • PATCH /api/appointments   │
              │  • GET /api/slots/available  │
              │                              │
              │  WebSocket Endpoint:         │
              │  • WS /ws/slots/{date}       │
              │                              │
              └──────────────┬───────────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   Data Storage        │
                 │   (JSON Files)        │
                 │                       │
                 │  • appointments.json  │
                 │  • patient_states.json│
                 │  • reviews.json       │
                 │  • profiles.json      │
                 └───────────────────────┘
```

## Message Flow

### 1. Client Connection

```
Client                          Backend
  │                               │
  ├─ Connect WS ─────────────────>│
  │  /ws/slots/2026-03-12         │
  │                               ├─ Accept Connection
  │                               ├─ Add to Pool
  │<────── Initial Slot Data ─────┤   {date: connections}
  │                               │
  │  {                            │
  │    type: "initial",           │
  │    date: "2026-03-12",        │
  │    timeSlots: [...],          │
  │    bookedSlots: [...]         │
  │  }                            │
  │                               │
```

### 2. Booking Event

```
Client A          Backend          Client B          Client C
  │                 │                 │                 │
  ├─ POST /api/appointments ──────>  │                 │
  │  {                               │                 │
  │    date: "2026-03-12",           │                 │
  │    time: "10:00"                 │                 │
  │  }                               │                 │
  │                                  │                 │
  │<─── Success Response ────────────┤                 │
  │                                  │                 │
  │                                  ├─ Broadcast to   │
  │                                  │   "2026-03-12"  │
  │                                  │                 │
  │<────── slot_booked ──────────────┤                 │
  │                                  │                 │
  │                                  ├─────────────────>│
  │                                  │   slot_booked   │
  │                                  │                 │
  │                                  │   (Not sent to  │
  │                                  │    Client C -   │
  │                                  │    different    │
  │                                  │    date)        │
  │                                  │                 │
```

### 3. Keep-alive (Ping/Pong)

```
Client                          Backend
  │                               │
  ├─────── "ping" ───────────────>│
  │  (every 30 seconds)           │
  │                               │
  │<────── {"type":"pong"} ───────┤
  │                               │
  │  (Connection stays alive)     │
  │                               │
```

### 4. Cancellation Event

```
Client A          Backend          Client B
  │                 │                 │
  ├─ PATCH /api/appointments/{id} ──>│
  │  { status: "cancelled" }         │
  │                                  │
  │<─── Success ─────────────────────┤
  │                                  │
  │                                  ├─ Broadcast
  │                                  │
  │<────── slot_cancelled ───────────┤
  │                                  │
  │                                  ├─────────────────>│
  │                                  │  slot_cancelled │
  │                                  │                 │
```

## Data Structures

### ConnectionManager State

```python
{
  "2026-03-12": {
    <WebSocket object at 0x123456>,
    <WebSocket object at 0x123789>,
    <WebSocket object at 0x123abc>
  },
  "2026-03-13": {
    <WebSocket object at 0x123def>
  },
  "2026-03-14": {
    <WebSocket object at 0x123ghi>,
    <WebSocket object at 0x123jkl>
  }
}
```

### WebSocket Messages

#### Initial Data
```json
{
  "type": "initial",
  "date": "2026-03-12",
  "timeSlots": [
    {
      "period": "morning",
      "label": "Ertalab 09:00 – 12:00",
      "slots": [
        {"time": "09:00", "booked": false},
        {"time": "10:00", "booked": true},
        {"time": "11:00", "booked": false}
      ]
    }
  ],
  "bookedSlots": ["10:00", "14:00"]
}
```

#### Slot Booked
```json
{
  "type": "slot_booked",
  "date": "2026-03-12",
  "time": "10:00",
  "availableSlots": ["10:00", "14:00", "15:00"]
}
```

#### Slot Cancelled
```json
{
  "type": "slot_cancelled",
  "date": "2026-03-12",
  "time": "10:00",
  "availableSlots": ["14:00", "15:00"]
}
```

## Scalability Architecture (Production)

```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer (Nginx)                     │
│                 WebSocket + HTTP Load Balancing              │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│  Backend 1    │ │  Backend 2    │ │  Backend 3    │
│  FastAPI      │ │  FastAPI      │ │  FastAPI      │
│  + WebSocket  │ │  + WebSocket  │ │  + WebSocket  │
└───────┬───────┘ └───────┬───────┘ └───────┬───────┘
        │                 │                 │
        └─────────────────┼─────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  Redis Pub/Sub│
                  │               │
                  │  Channel:     │
                  │  slots:*      │
                  │               │
                  │  Messages:    │
                  │  • slot_booked│
                  │  • slot_free  │
                  └───────┬───────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  PostgreSQL   │
                  │  Database     │
                  │               │
                  │  Tables:      │
                  │  • appointments
                  │  • patients   │
                  │  • reviews    │
                  └───────────────┘
```

## Component Responsibilities

### Frontend (Browser)
- Connect to WebSocket for selected date
- Display initial slot availability
- Listen for real-time updates
- Update UI with animations
- Handle reconnection
- Send keep-alive pings

### Backend (FastAPI)
- Accept WebSocket connections
- Manage connection pool per date
- Process appointment bookings
- Broadcast updates to relevant clients
- Handle disconnections
- Respond to pings
- Validate data

### ConnectionManager
- Store active connections by date
- Add/remove connections
- Broadcast messages to date-specific clients
- Clean up disconnected clients
- Track connection statistics

### Data Storage
- Store appointment records
- Track booking status
- Provide slot availability
- Persist patient data

## Performance Characteristics

| Metric              | Value            |
|---------------------|------------------|
| Connection Setup    | ~50ms            |
| Message Latency     | <10ms (local)    |
| Memory/Connection   | ~10KB            |
| Max Connections     | 10,000+ (single) |
| Bandwidth (idle)    | ~100 bytes/min   |
| Bandwidth (update)  | ~200 bytes       |
| CPU Usage           | <1% (100 clients)|

## Error Handling

```
┌──────────────────────────────────────────────────────────┐
│                    Error Scenarios                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Network Error        → Auto-reconnect after 3s          │
│  Server Restart       → Clients reconnect automatically  │
│  Connection Timeout   → Keep-alive ping every 30s        │
│  Client Disconnect    → Clean up from pool immediately   │
│  Invalid Message      → Log error, continue listening    │
│  Broadcast Failure    → Remove dead connection           │
│  Database Error       → Return error, don't broadcast    │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Security Layers

```
┌──────────────────────────────────────────────────────────┐
│  Layer 1: Connection Authentication                       │
│  → Validate Telegram init_data on WebSocket connect      │
│                                                           │
│  Layer 2: Rate Limiting                                   │
│  → Max 10 connections per IP per minute                   │
│                                                           │
│  Layer 3: Message Validation                              │
│  → Validate all incoming JSON messages                    │
│                                                           │
│  Layer 4: Authorization                                   │
│  → Users can only cancel their own appointments          │
│                                                           │
│  Layer 5: Data Isolation                                  │
│  → Clients only receive updates for their selected date  │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Monitoring Points

```
┌────────────────────────────────────────────────────────┐
│  Metrics to Monitor                                     │
├────────────────────────────────────────────────────────┤
│  • Active connections per date                         │
│  • Total active connections                            │
│  • Messages sent per second                            │
│  • Connection establishment rate                       │
│  • Disconnection rate                                  │
│  • Average message latency                             │
│  • Error rate                                          │
│  • Memory usage                                        │
│  • CPU usage                                           │
└────────────────────────────────────────────────────────┘

Endpoint: GET /api/health/websocket
Returns:
{
  "status": "healthy",
  "active_dates": 15,
  "total_connections": 247,
  "timestamp": "2026-03-10T08:40:25Z"
}
```

---

This architecture enables **instant synchronization** across all clients viewing the same date, providing a modern, responsive booking experience while maintaining scalability and reliability.
