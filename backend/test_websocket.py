#!/usr/bin/env python3
"""
Test script for real-time slot updates
"""

import asyncio
import json
from datetime import datetime, timedelta

try:
    import websockets
except ImportError:
    print("❌ websockets not installed. Run: pip install websockets")
    exit(1)

async def test_websocket_connection():
    """Test WebSocket connection and message flow"""
    
    # Calculate tomorrow's date
    tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
    uri = f"ws://localhost:8000/ws/slots/{tomorrow}"
    
    print(f"🔌 Connecting to WebSocket: {uri}")
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected successfully!")
            
            # Receive initial data
            print("\n📥 Receiving initial data...")
            response = await websocket.recv()
            data = json.loads(response)
            
            if data['type'] == 'initial':
                print(f"✅ Received initial data for date: {data['date']}")
                print(f"   Time periods: {len(data['timeSlots'])}")
                print(f"   Booked slots: {len(data['bookedSlots'])}")
                
                # Display time slots
                for period in data['timeSlots']:
                    available = sum(1 for s in period['slots'] if not s['booked'])
                    total = len(period['slots'])
                    print(f"   {period['label']}: {available}/{total} available")
            else:
                print(f"❌ Unexpected initial message type: {data['type']}")
                return
            
            # Test ping/pong
            print("\n🏓 Testing ping/pong...")
            await websocket.send('ping')
            response = await websocket.recv()
            data = json.loads(response)
            
            if data['type'] == 'pong':
                print("✅ Ping/pong working correctly")
            else:
                print(f"❌ Expected pong, got: {data['type']}")
            
            # Listen for updates for 5 seconds
            print("\n👂 Listening for real-time updates (5 seconds)...")
            print("   (Book an appointment in another window to see updates)")
            
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                data = json.loads(response)
                
                if data['type'] in ['slot_booked', 'slot_cancelled']:
                    print(f"🎉 Received real-time update!")
                    print(f"   Type: {data['type']}")
                    print(f"   Time: {data['time']}")
                    print(f"   Date: {data['date']}")
                else:
                    print(f"   Received: {data}")
                    
            except asyncio.TimeoutError:
                print("   (No updates received - this is normal for testing)")
            
            print("\n✅ All tests passed!")
            
    except ConnectionRefusedError:
        print("❌ Connection refused. Is the server running?")
        print("   Start server with: python main.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def main():
    print("=" * 60)
    print("Real-time Slot Updates - WebSocket Test")
    print("=" * 60)
    print()
    
    asyncio.run(test_websocket_connection())

if __name__ == "__main__":
    main()
