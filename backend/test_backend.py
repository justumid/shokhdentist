"""
Production Backend Test Suite
Run: pytest test_backend.py -v
"""
import pytest
import sys
sys.path.insert(0, '.')

from fastapi.testclient import TestClient
from main import app
import json

client = TestClient(app)

# Test data
TEST_USER_ID = "999888777"
TEST_PATIENT_DATA = {
    "fullName": "Test Patient",
    "phone": "+998901234567",
    "birthDate": "1990-01-15",
    "diabet": False,
    "heart": False,
    "bp": False,
    "toothpain": True,
    "gumbleed": False,
    "photoConsent": True
}

def get_dev_headers():
    """Get headers for dev mode testing"""
    return {"X-Dev-User-Id": TEST_USER_ID}

class TestHealthAndInit:
    def test_health_check(self):
        """Test health endpoint"""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "websocket" in data
    
    def test_init_endpoint(self):
        """Test app initialization"""
        response = client.get("/api/init", headers=get_dev_headers())
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "user" in data

class TestPatientState:
    def test_get_patient_state_empty(self):
        """Test getting patient state for new user"""
        response = client.get("/api/patient/state", headers=get_dev_headers())
        assert response.status_code == 200
        data = response.json()
        assert "patientState" in data
        assert "progress" in data
    
    def test_save_patient_state(self):
        """Test saving patient state"""
        response = client.post(
            "/api/patient/state",
            headers=get_dev_headers(),
            json=TEST_PATIENT_DATA
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "progress" in data

class TestAppointments:
    def test_create_free_appointment(self):
        """Test creating free consultation appointment"""
        response = client.post(
            "/api/appointments",
            headers=get_dev_headers(),
            json={
                "patientData": TEST_PATIENT_DATA,
                "type": "free",
                "selectedSlot": None
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["status"] == "reviewing"
    
    def test_get_user_appointments(self):
        """Test getting user appointments"""
        response = client.get("/api/appointments", headers=get_dev_headers())
        assert response.status_code == 200
        data = response.json()
        assert "appointments" in data
        assert isinstance(data["appointments"], list)
    
    def test_create_appointment_validation_error(self):
        """Test validation when required fields missing"""
        response = client.post(
            "/api/appointments",
            headers=get_dev_headers(),
            json={
                "patientData": {"fullName": "Test"},  # Missing required fields
                "type": "free"
            }
        )
        assert response.status_code in [400, 422]

class TestSlots:
    def test_get_available_slots(self):
        """Test getting available slots"""
        response = client.get("/api/slots/available?date=2026-04-01")
        assert response.status_code == 200
        data = response.json()
        assert "timeSlots" in data
        assert "dates" in data
        assert len(data["timeSlots"]) == 3  # Morning, afternoon, evening

class TestReviews:
    def test_get_reviews(self):
        """Test getting reviews"""
        response = client.get("/api/reviews")
        assert response.status_code == 200
        data = response.json()
        assert "reviews" in data
    
    def test_create_review(self):
        """Test creating review"""
        response = client.post(
            "/api/reviews",
            headers=get_dev_headers(),
            json={
                "name": "Test User",
                "rating": 5,
                "tags": ["Mehribon shifokorlar"],
                "text": "Excellent service!"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert "id" in data

class TestStaticData:
    def test_get_services(self):
        """Test services catalog"""
        response = client.get("/api/services")
        assert response.status_code == 200
        data = response.json()
        assert "categories" in data
        assert len(data["categories"]) == 4
    
    def test_get_team(self):
        """Test team members"""
        response = client.get("/api/team")
        assert response.status_code == 200
        data = response.json()
        assert "team" in data
        assert len(data["team"]) >= 4
    
    def test_get_faq(self):
        """Test FAQ items"""
        response = client.get("/api/faq")
        assert response.status_code == 200
        data = response.json()
        assert "faq" in data
        assert len(data["faq"]) >= 20

class TestAdminEndpoints:
    def test_admin_without_auth(self):
        """Test admin endpoint requires authentication"""
        response = client.get("/api/admin/appointments")
        assert response.status_code == 401
    
    def test_admin_with_wrong_credentials(self):
        """Test admin endpoint with wrong credentials"""
        response = client.get(
            "/api/admin/appointments",
            auth=("wrong", "credentials")
        )
        assert response.status_code == 401

class TestWebSocket:
    def test_websocket_connection(self):
        """Test WebSocket connection"""
        with client.websocket_connect("/ws/slots/2026-04-01") as websocket:
            data = websocket.receive_json()
            assert data["type"] == "initial"
            assert "timeSlots" in data
            assert data["date"] == "2026-04-01"
            
            # Test ping/pong
            websocket.send_text("ping")
            pong = websocket.receive_json()
            assert pong["type"] == "pong"

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
