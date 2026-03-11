"""API client helper for frontend integration"""

# TypeScript/JavaScript client example for frontend

API_CLIENT_EXAMPLE = """
// frontend/src/api/client.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get Telegram Web App init data
function getTelegramInitData(): string {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp.initData;
  }
  return '';
}

// API client with automatic auth
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
      // Dev mode
      headers['X-Dev-User-Id'] = '12345678';
    }
    
    return headers;
  }
  
  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    return response.json();
  }
  
  async post<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    return response.json();
  }
  
  async patch<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw await this.handleError(response);
    }
    
    return response.json();
  }
  
  private async handleError(response: Response): Promise<Error> {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const error = await response.json();
      return new Error(error.error || error.detail || 'Request failed');
    }
    return new Error(`Request failed: ${response.statusText}`);
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// WebSocket helper
export class SlotWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  
  constructor(
    private date: string,
    private onUpdate: (data: any) => void,
    private onError?: (error: Error) => void
  ) {}
  
  connect() {
    const wsUrl = API_BASE_URL.replace('http', 'ws') + `/ws/slots/${this.date}`;
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log(`WebSocket connected for date ${this.date}`);
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.onUpdate(data);
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.onError?.(new Error('WebSocket connection error'));
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket closed, reconnecting...');
      this.stopHeartbeat();
      this.reconnect();
    };
  }
  
  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send('ping');
      }
    }, 30000); // Every 30 seconds
  }
  
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  private reconnect() {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 3000); // Reconnect after 3 seconds
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
}

// API Methods
export const api = {
  // Initialization
  init: () => apiClient.get('/api/init'),
  
  // Patient state
  getPatientState: () => apiClient.get('/api/patient/state'),
  savePatientState: (data: any) => apiClient.post('/api/patient/state', data),
  
  // Appointments
  createAppointment: (data: any) => apiClient.post('/api/appointments', data),
  getAppointments: () => apiClient.get('/api/appointments'),
  cancelAppointment: (id: string) => 
    apiClient.patch(`/api/appointments/${id}`, { status: 'cancelled' }),
  
  // Slots
  getAvailableSlots: (date: string) => 
    apiClient.get(`/api/slots/available?date=${date}`),
  
  // Reviews
  getReviews: (params?: { tag?: string; rating?: number; sort?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiClient.get(`/api/reviews?${query}`);
  },
  createReview: (data: any) => apiClient.post('/api/reviews', data),
  
  // Static data
  getServices: () => apiClient.get('/api/services'),
  getTeam: () => apiClient.get('/api/team'),
  getFaq: () => apiClient.get('/api/faq'),
  getStats: () => apiClient.get('/api/stats'),
  
  // Health
  health: () => apiClient.get('/api/health'),
};

export default api;
"""

USAGE_EXAMPLE = """
// Usage in React component

import { useEffect, useState } from 'react';
import api, { SlotWebSocket } from './api/client';

function AppointmentPage() {
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('2026-03-12');
  
  // Fetch initial slots
  useEffect(() => {
    api.getAvailableSlots(selectedDate).then(data => {
      setSlots(data.timeSlots);
    });
  }, [selectedDate]);
  
  // WebSocket for real-time updates
  useEffect(() => {
    const ws = new SlotWebSocket(
      selectedDate,
      (data) => {
        if (data.type === 'slot_booked' || data.type === 'slot_cancelled') {
          // Update UI with new slot availability
          setSlots(prevSlots => updateSlotAvailability(prevSlots, data));
        }
      },
      (error) => console.error('WebSocket error:', error)
    );
    
    ws.connect();
    
    return () => ws.disconnect();
  }, [selectedDate]);
  
  // Book appointment
  const handleBooking = async (slot) => {
    try {
      const patientData = await api.getPatientState();
      
      await api.createAppointment({
        patientData: patientData.patientState,
        type: 'paid',
        selectedSlot: { date: selectedDate, time: slot.time }
      });
      
      alert('Appointment booked!');
    } catch (error) {
      alert(error.message);
    }
  };
  
  return (
    <div>
      {/* Your UI here */}
    </div>
  );
}
"""

if __name__ == "__main__":
    print("=== API Client Helper ===\n")
    print(API_CLIENT_EXAMPLE)
    print("\n=== Usage Example ===\n")
    print(USAGE_EXAMPLE)
