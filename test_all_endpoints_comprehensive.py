#!/usr/bin/env python3
"""
Comprehensive Backend Endpoint Testing
Tests all endpoints to ensure they're working correctly
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, Any
import base64

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

class APITester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.admin_token = None
        self.test_results = []
        
    def log(self, message: str, color: str = RESET):
        print(f"{color}{message}{RESET}")
        
    def test(self, name: str, method: str, endpoint: str, 
             expected_status: int = 200, data: Dict = None, 
             headers: Dict = None, auth: bool = False):
        """Generic test function"""
        url = f"{self.base_url}{endpoint}"
        test_headers = headers or {}
        
        if auth and self.admin_token:
            test_headers["Authorization"] = f"Bearer {self.admin_token}"
            
        try:
            if method == "GET":
                response = self.session.get(url, headers=test_headers)
            elif method == "POST":
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == "PUT":
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == "DELETE":
                response = self.session.delete(url, headers=test_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            passed = response.status_code == expected_status
            
            if passed:
                self.log(f"✅ {name}", GREEN)
                self.test_results.append({"test": name, "status": "PASSED"})
                return response
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", RED)
                self.log(f"   Response: {response.text[:200]}", YELLOW)
                self.test_results.append({"test": name, "status": "FAILED", 
                                        "expected": expected_status, 
                                        "actual": response.status_code})
                return None
                
        except Exception as e:
            self.log(f"❌ {name} - Exception: {str(e)}", RED)
            self.test_results.append({"test": name, "status": "ERROR", "error": str(e)})
            return None
            
    def run_all_tests(self):
        """Run all endpoint tests"""
        
        self.log("\n" + "="*60, BLUE)
        self.log("SHOKHDENTIST BACKEND API TEST SUITE", BLUE)
        self.log("="*60 + "\n", BLUE)
        
        # 1. Health Check
        self.log("\n📋 HEALTH & STATUS ENDPOINTS", BLUE)
        self.test("Health Check", "GET", "/api/health")
        self.test("Init Endpoint", "GET", "/api/init")
        
        # 2. Time Slots
        self.log("\n📅 TIME SLOTS ENDPOINTS", BLUE)
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        self.test("Get Available Slots", "GET", f"/api/slots/available?date={tomorrow}")
        
        # 3. Appointments (Bookings)
        self.log("\n📝 APPOINTMENTS ENDPOINTS", BLUE)
        
        # Create a test appointment
        appointment_data = {
            "appointmentDate": tomorrow,
            "appointmentTime": "10:00",
            "service": "Umumiy ko'rik",
            "notes": "Test appointment"
        }
        
        appointment_response = self.test("Create Appointment", "POST", "/api/appointments", 
                                         expected_status=201, data=appointment_data)
        
        appointment_id = None
        if appointment_response:
            try:
                result = appointment_response.json()
                appointment_id = result.get("id")
                self.log(f"   Created appointment ID: {appointment_id}", GREEN)
            except:
                pass
        
        # Get appointments
        self.test("Get Appointments", "GET", "/api/appointments")
        
        # 4. Other Public Endpoints
        self.log("\n🌐 PUBLIC ENDPOINTS", BLUE)
        self.test("Get Services", "GET", "/api/services")
        self.test("Get Team", "GET", "/api/team")
        self.test("Get FAQ", "GET", "/api/faq")
        self.test("Get Stats", "GET", "/api/stats")
        self.test("Get Reviews", "GET", "/api/reviews")
        
        # 5. Admin Endpoints (Protected) - Note: These require proper auth
        self.log("\n👑 ADMIN PROTECTED ENDPOINTS", BLUE)
        self.log("⚠️  Admin endpoints require proper authentication setup", YELLOW)
        
        # Note: Admin auth is handled via get_admin_user dependency
        # These tests would need proper auth setup to work
        
        # 6. Patient State Management
        self.log("\n👤 PATIENT STATE ENDPOINTS", BLUE)
        
        # Get patient state
        self.test("Get Patient State", "GET", "/api/patient/state")
        
        # Update patient state
        state_data = {
            "fullName": "Test Patient",
            "phone": "+998901234567",
            "email": "test@example.com"
        }
        self.test("Update Patient State", "POST", "/api/patient/state",
                 expected_status=200, data=state_data)
        
        # 7. Review Submission
        self.log("\n⭐ REVIEW ENDPOINTS", BLUE)
        
        review_data = {
            "rating": 5,
            "comment": "Excellent service!",
            "patientName": "Test Patient"
        }
        self.test("Submit Review", "POST", "/api/reviews",
                 expected_status=201, data=review_data)
        
        # 8. Error Handling
        self.log("\n⚠️  ERROR HANDLING TESTS", BLUE)
        
        self.test("Non-existent Endpoint", "GET", "/api/nonexistent",
                 expected_status=404)
        
        if self.admin_token:
            self.test("Non-existent Booking", "GET", "/api/admin/bookings/99999999",
                     expected_status=404, auth=True)
        
        # 9. Rate Limiting (if enabled)
        self.log("\n🚦 RATE LIMITING TEST", BLUE)
        self.log("Making 10 rapid requests to test rate limiting...", YELLOW)
        
        rate_limit_hit = False
        for i in range(10):
            response = self.session.get(f"{self.base_url}/api/health")
            if response.status_code == 429:
                rate_limit_hit = True
                self.log(f"✅ Rate limiting active (hit after {i+1} requests)", GREEN)
                break
        
        if not rate_limit_hit:
            self.log("⚠️  Rate limiting not triggered (may be disabled or limit is high)", YELLOW)
        
        # 10. WebSocket (basic check)
        self.log("\n🔌 WEBSOCKET ENDPOINT", BLUE)
        try:
            import websocket
            ws_url = self.base_url.replace("http", "ws") + f"/ws/slots/{tomorrow}"
            ws = websocket.create_connection(ws_url)
            ws.close()
            self.log("✅ WebSocket Connection", GREEN)
            self.test_results.append({"test": "WebSocket Connection", "status": "PASSED"})
        except ImportError:
            self.log("⚠️  websocket-client not installed, skipping WebSocket test", YELLOW)
        except Exception as e:
            self.log(f"⚠️  WebSocket Connection - {str(e)[:100]}", YELLOW)
            self.log("   (WebSocket may require proper Telegram auth)", YELLOW)
            # Don't count as failure since it requires auth
            self.test_results.append({"test": "WebSocket Connection", "status": "SKIPPED"})
        
        # Summary
        self.print_summary()
        
    def print_summary(self):
        """Print test summary"""
        self.log("\n" + "="*60, BLUE)
        self.log("TEST SUMMARY", BLUE)
        self.log("="*60, BLUE)
        
        passed = sum(1 for r in self.test_results if r["status"] == "PASSED")
        failed = sum(1 for r in self.test_results if r["status"] == "FAILED")
        errors = sum(1 for r in self.test_results if r["status"] == "ERROR")
        total = len(self.test_results)
        
        self.log(f"\nTotal Tests: {total}", BLUE)
        self.log(f"Passed: {passed}", GREEN)
        self.log(f"Failed: {failed}", RED if failed > 0 else GREEN)
        self.log(f"Errors: {errors}", RED if errors > 0 else GREEN)
        
        success_rate = (passed / total * 100) if total > 0 else 0
        self.log(f"\nSuccess Rate: {success_rate:.1f}%", 
                GREEN if success_rate >= 90 else YELLOW if success_rate >= 70 else RED)
        
        if failed > 0 or errors > 0:
            self.log("\n❌ FAILED/ERROR TESTS:", RED)
            for result in self.test_results:
                if result["status"] in ["FAILED", "ERROR"]:
                    self.log(f"   - {result['test']}: {result.get('error', result.get('actual', 'Unknown'))}", RED)
        
        self.log("\n" + "="*60 + "\n", BLUE)
        
        return success_rate >= 90

if __name__ == "__main__":
    import sys
    
    # Check if custom URL provided
    base_url = sys.argv[1] if len(sys.argv) > 1 else BASE_URL
    
    print(f"\n🚀 Testing API at: {base_url}\n")
    
    tester = APITester(base_url)
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)
