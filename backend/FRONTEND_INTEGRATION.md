# 🔄 Frontend Integration Guide

## Overview

The backend is now fully prepared to support the frontend. This guide shows how to integrate all features.

---

## 📡 API Integration

### 1. Setup API Client

Create `frontend/src/api/client.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get Telegram init data
function getTelegramInitData(): string {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp.initData;
  }
  return '';
}

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }
  
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const initData = getTelegramInitData();
    if (initData) {
      headers['Authorization'] = `tma ${initData}`;
    } else {
      // Dev mode - use test user
      headers['X-Dev-User-Id'] = '12345678';
    }
    
    return headers;
  }
  
  async request<T>(method: string, path: string, data?: any): Promise<T> {
    const options: RequestInit = {
      method,
      headers: this.getHeaders(),
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${this.baseUrl}${path}`, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.detail || 'Request failed');
    }
    
    return response.json();
  }
  
  get<T>(path: string) {
    return this.request<T>('GET', path);
  }
  
  post<T>(path: string, data: any) {
    return this.request<T>('POST', path, data);
  }
  
  patch<T>(path: string, data: any) {
    return this.request<T>('PATCH', path, data);
  }
}

export const apiClient = new ApiClient();
```

### 2. Replace localStorage with API Calls

**Current (localStorage):**
```typescript
// ❌ Old way
const state = JSON.parse(localStorage.getItem('shokh_v2') || '{}');
localStorage.setItem('shokh_v2', JSON.stringify(state));
```

**New (API-backed):**
```typescript
// ✅ New way
import { apiClient } from './api/client';

// Load state from backend
const response = await apiClient.get('/api/patient/state');
const state = response.patientState;

// Save state to backend
await apiClient.post('/api/patient/state', patientData);
```

### 3. Integrate WebSocket for Real-time Slots

Create `frontend/src/api/websocket.ts`:

```typescript
export class SlotWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor(
    private date: string,
    private onUpdate: (data: any) => void,
    private onConnectionChange?: (connected: boolean) => void
  ) {}
  
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_URL || 'localhost:8000';
    const wsUrl = `${protocol}//${host}/ws/slots/${this.date}`;
    
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log(`✓ WebSocket connected for ${this.date}`);
      this.reconnectAttempts = 0;
      this.onConnectionChange?.(true);
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type !== 'pong') {
        console.log('WebSocket message:', data);
        this.onUpdate(data);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onConnectionChange?.(false);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.onConnectionChange?.(false);
      this.stopHeartbeat();
      this.attemptReconnect();
    };
  }
  
  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 30000); // 30 seconds
  }
  
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    if (this.reconnectTimer) return;
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }
  
  disconnect() {
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }
}
```

### 4. Use WebSocket in Components

```typescript
import { useEffect, useState } from 'react';
import { SlotWebSocket } from '../api/websocket';

function AppointmentPage() {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-04-01');
  const [connected, setConnected] = useState(false);
  
  useEffect(() => {
    // Initialize WebSocket for selected date
    const ws = new SlotWebSocket(
      selectedDate,
      (data) => {
        // Handle slot updates
        if (data.type === 'initial') {
          setSlots(data.timeSlots);
        } else if (data.type === 'slot_booked') {
          // Mark slot as booked with animation
          setSlots(prev => markSlotBooked(prev, data.time));
          showNotification(`Slot ${data.time} booked`);
        } else if (data.type === 'slot_cancelled') {
          // Mark slot as available
          setSlots(prev => markSlotAvailable(prev, data.time));
          showNotification(`Slot ${data.time} available`);
        }
      },
      (connected) => setConnected(connected)
    );
    
    ws.connect();
    
    return () => ws.disconnect();
  }, [selectedDate]);
  
  return (
    <div>
      <ConnectionIndicator connected={connected} />
      <SlotPicker slots={slots} onSelect={handleSlotSelect} />
    </div>
  );
}
```

---

## 🔄 Migration Checklist

Replace these localStorage operations with API calls:

### ✅ Patient State
```typescript
// OLD
const state = JSON.parse(localStorage.getItem('shokh_v2') || '{}');

// NEW
const { patientState } = await apiClient.get('/api/patient/state');
```

### ✅ Appointments
```typescript
// OLD
const appointments = mockAppointments;

// NEW
const { appointments } = await apiClient.get('/api/appointments');
```

### ✅ Reviews
```typescript
// OLD
const reviews = MOCK_REVIEWS;

// NEW
const { reviews } = await apiClient.get('/api/reviews?sort=newest&limit=50');
```

### ✅ Slot Availability
```typescript
// OLD
const bookedSlots = JSON.parse(localStorage.getItem('bookedSlots') || '[]');

// NEW
const { timeSlots } = await apiClient.get(`/api/slots/available?date=${date}`);
// + WebSocket for real-time updates
```

---

## 🎨 UI Integration Points

### Connection Indicator
```typescript
function ConnectionIndicator({ connected }: { connected: boolean }) {
  return (
    <div style={{
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '11px',
      background: connected ? '#E0F5F3' : '#FFF0EF',
      color: connected ? '#1FA89A' : '#C0392B'
    }}>
      {connected ? '● Online' : '○ Offline'}
    </div>
  );
}
```

### Slot Animation
```typescript
function SlotButton({ slot, onBook }: SlotButtonProps) {
  const [justBooked, setJustBooked] = useState(false);
  
  useEffect(() => {
    if (slot.booked && !justBooked) {
      setJustBooked(true);
      setTimeout(() => setJustBooked(false), 1000);
    }
  }, [slot.booked]);
  
  return (
    <button
      disabled={slot.booked}
      onClick={() => onBook(slot)}
      style={{
        transition: 'all 0.3s ease',
        transform: justBooked ? 'scale(0.95)' : 'scale(1)',
        opacity: slot.booked ? 0.5 : 1
      }}
    >
      {slot.time}
    </button>
  );
}
```

---

## 🧪 Testing Frontend Integration

### 1. Test API Connection
```typescript
// Add to App.tsx componentDidMount
useEffect(() => {
  apiClient.get('/api/health')
    .then(data => console.log('✓ Backend connected:', data))
    .catch(err => console.error('✗ Backend error:', err));
}, []);
```

### 2. Test WebSocket
```typescript
const ws = new SlotWebSocket('2026-04-01', console.log);
ws.connect();
// Check browser console for connection status
```

### 3. Test Admin Auth
```typescript
// Admin panel login
const response = await fetch('/api/admin/appointments', {
  headers: {
    'Authorization': 'Basic ' + btoa('admin:your_password')
  }
});
```

---

## 🚦 Status

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| Authentication | ✅ | ⚠️ | Backend ready, needs frontend integration |
| Patient State | ✅ | ⚠️ | API ready, replace localStorage |
| Appointments | ✅ | ⚠️ | API ready, connect to backend |
| WebSocket | ✅ | ❌ | Backend ready, needs frontend client |
| Admin Auth | ✅ | ❌ | Backend secured, add login UI |
| Real-time Updates | ✅ | ❌ | Ready to integrate |

---

## 🎯 Next Steps

1. **Create API client** (`frontend/src/api/client.ts`)
2. **Add WebSocket client** (`frontend/src/api/websocket.ts`)
3. **Replace localStorage** with API calls in components
4. **Add connection indicator** to show online/offline
5. **Add admin login** modal in admin panel
6. **Test real-time updates** with multiple browsers
7. **Add error handling** UI (toast notifications)
8. **Add loading states** during API calls

Estimated effort: **3-5 days** for complete integration

---

## ✨ Benefits After Integration

- ✅ Real-time slot updates (instant sync)
- ✅ Persistent data (survives browser refresh)
- ✅ Multi-device support (same account, different devices)
- ✅ Admin can see live bookings
- ✅ No localStorage conflicts
- ✅ Proper error handling
- ✅ Production-ready security
- ✅ Scalable to thousands of users

---

**Backend Status**: ✅ 100% Ready for Frontend
**Next**: Integrate API client in React components
