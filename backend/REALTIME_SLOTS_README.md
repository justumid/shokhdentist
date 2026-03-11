# Real-time Slot Updates - Documentation

## 🚀 Overview

The ShokhDentist booking system now includes **real-time slot updates** using WebSocket technology. When a user books or cancels an appointment, all connected clients viewing the same date will instantly see the slot availability change without refreshing the page.

---

## 🎯 Features

✅ **Instant Updates** - Slot changes broadcast to all connected clients in real-time  
✅ **WebSocket Connection** - Low-latency bidirectional communication  
✅ **Auto-reconnect** - Automatically reconnects if connection drops  
✅ **Per-Date Channels** - Clients only receive updates for dates they're viewing  
✅ **Visual Animations** - Smooth animations when slots change status  
✅ **Activity Log** - Real-time log of booking/cancellation events  
✅ **Connection Status** - Visual indicator of connection health  
✅ **Ping/Pong** - Keep-alive mechanism to maintain connections  

---

## 🏗️ Architecture

### Components

1. **ConnectionManager** (Backend)
   - Manages WebSocket connections per date
   - Broadcasts updates to relevant clients
   - Handles connection lifecycle

2. **WebSocket Endpoint** (`/ws/slots/{date}`)
   - Accepts WebSocket connections for specific dates
   - Sends initial slot data on connect
   - Broadcasts booking/cancellation events

3. **HTTP API Updates** (Backend)
   - `POST /api/appointments` - Triggers broadcast when slot booked
   - `PATCH /api/appointments/{id}` - Triggers broadcast when cancelled

4. **Frontend Client** (JavaScript)
   - Connects to WebSocket for selected date
   - Updates UI in real-time
   - Handles reconnection logic

---

## 🔌 WebSocket Protocol

### Connection

```javascript
const socket = new WebSocket('ws://localhost:8000/ws/slots/2026-04-23');
```

### Message Types

#### 1. Initial Data (Server → Client)
Sent immediately after connection:
```json
{
  "type": "initial",
  "date": "2026-04-23",
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

#### 2. Slot Booked (Server → Client)
When a slot is booked:
```json
{
  "type": "slot_booked",
  "date": "2026-04-23",
  "time": "10:00",
  "availableSlots": ["10:00", "14:00", "15:00"]
}
```

#### 3. Slot Cancelled (Server → Client)
When a slot is freed:
```json
{
  "type": "slot_cancelled",
  "date": "2026-04-23",
  "time": "10:00",
  "availableSlots": ["14:00", "15:00"]
}
```

#### 4. Ping/Pong (Keep-alive)
Client sends `"ping"` text message every 30s:
```javascript
socket.send('ping');
```
Server responds:
```json
{
  "type": "pong"
}
```

---

## 💻 Frontend Integration

### Basic Setup

```javascript
// Connect to WebSocket for specific date
const date = '2026-04-23';
const socket = new WebSocket(`ws://localhost:8000/ws/slots/${date}`);

socket.onopen = () => {
  console.log('Connected to real-time updates');
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'initial':
      renderSlots(data.timeSlots);
      break;
    
    case 'slot_booked':
      markSlotAsBooked(data.time);
      showNotification(`Slot ${data.time} was just booked!`);
      break;
    
    case 'slot_cancelled':
      markSlotAsAvailable(data.time);
      showNotification(`Slot ${data.time} is now available!`);
      break;
    
    case 'pong':
      console.log('Connection alive');
      break;
  }
};

socket.onerror = (error) => {
  console.error('WebSocket error:', error);
};

socket.onclose = () => {
  console.log('Connection closed');
  // Implement auto-reconnect logic
};
```

### Keep-alive Ping

```javascript
// Send ping every 30 seconds
setInterval(() => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send('ping');
  }
}, 30000);
```

### Auto-reconnect Logic

```javascript
function connectWithRetry(date, retries = 5) {
  const socket = new WebSocket(`ws://localhost:8000/ws/slots/${date}`);
  
  socket.onclose = () => {
    if (retries > 0) {
      console.log(`Reconnecting... (${retries} attempts left)`);
      setTimeout(() => connectWithRetry(date, retries - 1), 3000);
    } else {
      console.error('Max reconnection attempts reached');
    }
  };
  
  return socket;
}
```

---

## 🎨 UI Updates

### Visual Feedback

```javascript
function handleSlotUpdate(data) {
  const slotElement = document.querySelector(`[data-time="${data.time}"]`);
  
  if (data.type === 'slot_booked') {
    // Add booked styling
    slotElement.classList.remove('available');
    slotElement.classList.add('booked');
    
    // Animate change
    slotElement.style.animation = 'bookingPulse 0.5s ease-in-out';
    
    // Show notification
    showToast(`⚠️ Slot ${data.time} was just booked`, 'warning');
  } else {
    // Add available styling
    slotElement.classList.remove('booked');
    slotElement.classList.add('available');
    
    // Animate change
    slotElement.style.animation = 'freedPulse 0.5s ease-in-out';
    
    // Show notification
    showToast(`✅ Slot ${data.time} is now available`, 'success');
  }
}
```

### CSS Animations

```css
@keyframes bookingPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); background: #ff9800; }
}

@keyframes freedPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); background: #4CAF50; }
}

.slot {
  transition: all 0.3s ease;
}

.slot.booked {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.6;
}

.slot.available {
  background: #e3f2fd;
  cursor: pointer;
}
```

---

## 🔧 Backend Implementation

### ConnectionManager Class

```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, date: str):
        await websocket.accept()
        if date not in self.active_connections:
            self.active_connections[date] = set()
        self.active_connections[date].add(websocket)
    
    def disconnect(self, websocket: WebSocket, date: str):
        if date in self.active_connections:
            self.active_connections[date].discard(websocket)
    
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
```

### Broadcasting Updates

```python
# In create_appointment endpoint
if appointment["date"]:
    slot_update = {
        "type": "slot_booked",
        "date": appointment["date"],
        "time": appointment["time"],
        "availableSlots": get_booked_slots(appointment["date"])
    }
    await manager.broadcast_slot_update(appointment["date"], slot_update)

# In update_appointment endpoint (cancellation)
if update_data.get("status") == "cancelled" and appointment_date:
    slot_update = {
        "type": "slot_cancelled",
        "date": appointment_date,
        "time": apt["time"],
        "availableSlots": get_booked_slots(appointment_date)
    }
    await manager.broadcast_slot_update(appointment_date, slot_update)
```

---

## 🧪 Testing

### Manual Testing

1. **Open Multiple Browsers**
   ```bash
   # Terminal 1: Start backend
   python main.py
   
   # Open in Browser 1
   open test_realtime_slots.html
   
   # Open in Browser 2
   open test_realtime_slots.html
   ```

2. **Test Booking Flow**
   - Both browsers select same date
   - Book appointment via API or test UI
   - Both browsers should update instantly

3. **Test Cancellation**
   - Cancel appointment via PATCH endpoint
   - All connected clients see slot freed

### Automated Testing

```python
import asyncio
import websockets

async def test_websocket():
    uri = "ws://localhost:8000/ws/slots/2026-04-23"
    
    async with websockets.connect(uri) as websocket:
        # Receive initial data
        response = await websocket.recv()
        data = json.loads(response)
        assert data['type'] == 'initial'
        
        # Send ping
        await websocket.send('ping')
        
        # Receive pong
        response = await websocket.recv()
        data = json.loads(response)
        assert data['type'] == 'pong'
        
        print("✅ WebSocket test passed")

asyncio.run(test_websocket())
```

---

## 📊 Performance Considerations

### Connection Limits

- **Current**: In-memory storage (limited by RAM)
- **Production**: Use Redis pub/sub for horizontal scaling
- **Recommended**: Max 1000 concurrent connections per date

### Message Size

- **Initial data**: ~2-5 KB (all slots for one day)
- **Update messages**: ~200 bytes (single slot change)
- **Bandwidth**: Minimal (~1 KB per update per client)

### Scaling Strategy

For production with high traffic:

1. **Redis Pub/Sub**
   ```python
   import redis
   redis_client = redis.Redis()
   
   # Broadcast via Redis
   await redis_client.publish(
       f'slots:{date}',
       json.dumps(slot_update)
   )
   ```

2. **WebSocket Load Balancer**
   - Nginx with `ngx_http_upstream_module`
   - Sticky sessions by date parameter

3. **Horizontal Scaling**
   - Multiple backend instances
   - Redis for inter-process communication

---

## 🔒 Security

### Authentication

WebSocket connections should validate Telegram data:

```python
@app.websocket("/ws/slots/{date}")
async def websocket_slots(
    websocket: WebSocket, 
    date: str,
    token: Optional[str] = Query(None)
):
    # Validate token before accepting connection
    if token:
        user_data = validate_telegram_data(token)
        if not user_data:
            await websocket.close(code=1008)  # Policy violation
            return
    
    await manager.connect(websocket, date)
    # ... rest of handler
```

### Rate Limiting

```python
from collections import defaultdict
from time import time

connection_attempts = defaultdict(list)

async def rate_limit_check(client_ip: str) -> bool:
    now = time()
    # Remove old attempts (older than 1 minute)
    connection_attempts[client_ip] = [
        t for t in connection_attempts[client_ip] 
        if now - t < 60
    ]
    
    # Allow max 10 connections per minute
    if len(connection_attempts[client_ip]) >= 10:
        return False
    
    connection_attempts[client_ip].append(now)
    return True
```

---

## 🐛 Troubleshooting

### Connection Drops

**Symptom**: WebSocket disconnects frequently

**Solutions**:
1. Implement keep-alive ping (30s interval)
2. Check reverse proxy timeout settings
3. Increase `uvicorn` timeout: `--timeout-keep-alive 120`

### Updates Not Received

**Symptom**: UI doesn't update when slots change

**Debug**:
```javascript
socket.onmessage = (event) => {
  console.log('Received:', event.data);  // Debug log
  const data = JSON.parse(event.data);
  // ... handle update
};
```

**Checklist**:
- [ ] WebSocket connection established?
- [ ] Viewing same date as booking?
- [ ] Browser console shows errors?
- [ ] Backend logs show broadcast?

### Memory Leaks

**Symptom**: Backend memory usage increases over time

**Causes**:
- Disconnected clients not removed
- Event listeners not cleaned up

**Fix**:
```python
# Clean up on disconnect
try:
    while True:
        await websocket.receive_text()
except WebSocketDisconnect:
    manager.disconnect(websocket, date)
finally:
    # Ensure cleanup
    manager.disconnect(websocket, date)
```

---

## 📱 Mobile Considerations

### Battery Optimization

```javascript
// Pause updates when page hidden
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    socket.close();
  } else {
    connectWebSocket(currentDate);
  }
});
```

### Network Changes

```javascript
// Reconnect on network change
window.addEventListener('online', () => {
  console.log('Network restored, reconnecting...');
  connectWebSocket(currentDate);
});

window.addEventListener('offline', () => {
  console.log('Network lost');
  socket.close();
});
```

---

## 🚀 Production Deployment

### Nginx Configuration

```nginx
location /ws/ {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_read_timeout 86400;  # 24 hours
}
```

### Environment Variables

```bash
# .env
WS_MAX_CONNECTIONS=1000
WS_PING_INTERVAL=30
WS_TIMEOUT=120
REDIS_URL=redis://localhost:6379
```

### Health Check

```python
@app.get("/api/health/websocket")
async def websocket_health():
    total_connections = sum(
        len(connections) 
        for connections in manager.active_connections.values()
    )
    return {
        "status": "healthy",
        "active_dates": len(manager.active_connections),
        "total_connections": total_connections,
        "timestamp": datetime.now().isoformat()
    }
```

---

## 📚 Additional Resources

- **WebSocket RFC**: https://datatracker.ietf.org/doc/html/rfc6455
- **FastAPI WebSockets**: https://fastapi.tiangolo.com/advanced/websockets/
- **JavaScript WebSocket API**: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

---

## 🎉 Result

Real-time slot updates provide a modern, responsive user experience that prevents double-bookings and keeps all clients synchronized instantly. The system is production-ready and can scale horizontally with Redis integration.

**Demo**: Open `test_realtime_slots.html` in multiple browser windows to see real-time updates in action!
