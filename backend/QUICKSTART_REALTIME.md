# 🚀 Quick Start - Real-time Slot Updates

## Installation (One-time Setup)

```bash
cd /home/sardor/Desktop/dental-booking

# Install dependencies (includes websockets)
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env and add your BOT_TOKEN
```

## Start Server

```bash
# Start backend API (with WebSocket support)
python main.py
```

Server will start on http://localhost:8000

## Test Real-time Updates

### Option 1: Visual Demo (Recommended)

1. **Open demo page in 2 browser windows:**
   ```bash
   # Open in default browser
   open test_realtime_slots.html
   
   # Or manually navigate to:
   file:///home/sardor/Desktop/dental-booking/test_realtime_slots.html
   ```

2. **In both windows:**
   - Select the same date from dropdown
   - Watch the connection status turn green

3. **In Terminal, book a slot:**
   ```bash
   curl -X POST http://localhost:8000/api/appointments \
     -H "Content-Type: application/json" \
     -d '{
       "type": "paid",
       "patientData": {
         "fullName": "Test User",
         "phone": "+998901234567",
         "birthDate": "1990-01-01",
         "diabet": false,
         "heart": false,
         "bp": false,
         "toothpain": false,
         "gumbleed": false,
         "photoConsent": true,
         "programConsent": true
       },
       "selectedSlot": {
         "date": "2026-03-12",
         "time": "10:00"
       }
     }'
   ```

4. **Watch both browsers update instantly!** 🎉
   - Slot turns gray (booked)
   - Activity log shows booking event
   - Statistics update
   - Animation plays

### Option 2: Automated Test

```bash
# Test WebSocket connection and protocol
python test_websocket.py
```

Expected output:
```
✅ Connected successfully!
✅ Received initial data for date: 2026-03-12
✅ Ping/pong working correctly
✅ All tests passed!
```

## API Endpoints

### REST API
```bash
# Get available slots
curl "http://localhost:8000/api/slots/available?date=2026-03-12"

# Create appointment
curl -X POST http://localhost:8000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

### WebSocket
```javascript
// JavaScript client
const socket = new WebSocket('ws://localhost:8000/ws/slots/2026-03-12');

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

## Documentation

- **Full WebSocket Guide**: `REALTIME_SLOTS_README.md`
- **Implementation Details**: `REALTIME_IMPLEMENTATION_SUMMARY.md`
- **API Documentation**: `API_README.md`
- **Backend Guide**: `BACKEND_GUIDE.md`
- **Telegram Integration**: `TELEGRAM_API_README.md`

## Troubleshooting

### Server won't start
```bash
# Check if port 8000 is in use
lsof -i :8000

# Kill existing process
kill -9 <PID>

# Restart server
python main.py
```

### WebSocket won't connect
1. Make sure server is running
2. Check browser console for errors
3. Verify URL: `ws://localhost:8000/ws/slots/{date}`

### Dependencies missing
```bash
# Install all dependencies
pip install -r requirements.txt

# Or specific package
pip install websockets
```

## Features Included

✅ Real-time slot updates via WebSocket  
✅ Instant booking notifications  
✅ Automatic reconnection  
✅ Visual animations  
✅ Activity logging  
✅ Connection status indicator  
✅ Keep-alive ping/pong  
✅ Multi-client synchronization  

## Next Steps

1. **Test with multiple clients** - Open demo in 2+ windows
2. **Integrate into your frontend** - See examples in `REALTIME_SLOTS_README.md`
3. **Deploy to production** - See deployment guide in documentation
4. **Add authentication** - See security section in docs

---

**Need Help?** Check the comprehensive documentation in `REALTIME_SLOTS_README.md`
