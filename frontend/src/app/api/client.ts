// API Client for backend integration
// This connects the existing frontend to the production backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Get Telegram Web App init data
function getTelegramInitData(): string {
  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
    return (window as any).Telegram.WebApp.initData;
  }
  return '';
}

// Check if running inside Telegram
function isTelegramWebApp(): boolean {
  // Must have Telegram WebApp SDK loaded AND have initData
  const hasTelegram = typeof window !== 'undefined' && !!(window as any).Telegram?.WebApp;
  if (!hasTelegram) return false;
  
  const initData = (window as any).Telegram?.WebApp?.initData;
  // initData must be present and non-empty (not just empty string)
  return !!(initData && initData.length > 0);
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
      // No authentication - will be rejected by backend in production
      throw new Error('This app must be opened from Telegram');
    }
    
    return headers;
  }
  
  private async request<T>(method: string, path: string, data?: any): Promise<T> {
    try {
      const options: RequestInit = {
        method,
        headers: this.getHeaders(),
      };
      
      if (data) {
        options.body = JSON.stringify(data);
      }
      
      const response = await fetch(`${this.baseUrl}${path}`, options);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(error.error || error.detail || `Request failed: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`API Error [${method} ${path}]:`, error);
      throw error;
    }
  }
  
  get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }
  
  post<T>(path: string, data: any): Promise<T> {
    return this.request<T>('POST', path, data);
  }
  
  patch<T>(path: string, data: any): Promise<T> {
    return this.request<T>('PATCH', path, data);
  }
}

export const apiClient = new ApiClient();

// WebSocket client for real-time slot updates
export class SlotWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  constructor(
    private date: string,
    private onUpdate: (data: any) => void,
    private onConnectionChange?: (connected: boolean) => void
  ) {}
  
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = import.meta.env.VITE_WS_URL || API_BASE_URL.replace('http://', '').replace('https://', '');
    const wsUrl = `${protocol}//${host}/ws/slots/${this.date}`;
    
    console.log(`[WebSocket] Connecting to ${wsUrl}`);
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log(`[WebSocket] Connected for date ${this.date}`);
      this.reconnectAttempts = 0;
      this.onConnectionChange?.(true);
      this.startHeartbeat();
    };
    
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type !== 'pong') {
        console.log('[WebSocket] Message:', data);
        this.onUpdate(data);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      this.onConnectionChange?.(false);
    };
    
    this.ws.onclose = () => {
      console.log('[WebSocket] Closed');
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
    }, 30000);
  }
  
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }
    if (this.reconnectTimer) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
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
}

// API methods
export const api = {
  isTelegramWebApp,
  init: () => apiClient.get<{ success: boolean; user: any; isAdmin: boolean }>('/api/init'),
  getPatientState: () => apiClient.get<{ patientState: any; progress: any }>('/api/patient/state'),
  savePatientState: (data: any) => apiClient.post<{ success: boolean }>('/api/patient/state', data),
  createAppointment: (data: any) => apiClient.post<{ id: string; message: string }>('/api/appointments', data),
  getAppointments: () => apiClient.get<{ appointments: any[] }>('/api/appointments'),
  cancelAppointment: (id: string) => apiClient.patch<{ success: boolean }>(`/api/appointments/${id}`, { status: 'cancelled' }),
  getAvailableSlots: (date: string) => apiClient.get<{ dates: string[]; timeSlots: any[] }>(`/api/slots/available?date=${date}`),
  getReviews: (params?: any) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get<{ reviews: any[] }>(`/api/reviews${query ? '?' + query : ''}`);
  },
  createReview: (data: any) => apiClient.post<{ id: string; message: string }>('/api/reviews', data),
  health: () => apiClient.get<{ status: string }>('/api/health'),
};

export default api;
