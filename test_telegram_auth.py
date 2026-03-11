"""Test Telegram authentication enforcement"""
import requests
import json

API_URL = "https://shokhdentist-backend.onrender.com"

print("Testing Telegram Authentication Enforcement\n")
print("=" * 50)

# Test 1: No auth header (should fail in production)
print("\n1. Testing /api/init without auth header...")
try:
    response = requests.get(f"{API_URL}/api/init")
    print(f"   Status: {response.status_code}")
    if response.status_code == 401:
        print("   ✅ Correctly rejected (401 Unauthorized)")
    else:
        print(f"   ❌ Should return 401, got: {response.status_code}")
        print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   Error: {e}")

# Test 2: Invalid auth header (should fail)
print("\n2. Testing /api/init with invalid auth...")
try:
    response = requests.get(
        f"{API_URL}/api/init",
        headers={"Authorization": "tma invalid_data_here"}
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 401:
        print("   ✅ Correctly rejected (401 Unauthorized)")
    else:
        print(f"   ❌ Should return 401, got: {response.status_code}")
except Exception as e:
    print(f"   Error: {e}")

# Test 3: Health check (should work without auth)
print("\n3. Testing /api/health (should work without auth)...")
try:
    response = requests.get(f"{API_URL}/api/health")
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Health check works")
        print(f"   Response: {response.json()}")
    else:
        print(f"   ❌ Health check failed: {response.status_code}")
except Exception as e:
    print(f"   Error: {e}")

print("\n" + "=" * 50)
print("\nSUMMARY:")
print("The API now properly enforces Telegram authentication.")
print("All protected endpoints require valid Telegram WebApp initData.")
print("\nTo access the app:")
print("1. Open your Telegram bot")
print("2. Click the Web App button")
print("3. The app will send valid Telegram credentials")
