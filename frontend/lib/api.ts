import { awsConfig } from '../config/aws';
import { AuthService } from '../services/authService';

const API_URL = awsConfig.apiEndpoint;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    const token = await AuthService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Failed to get auth token:', error);
  }

  return headers;
}

async function apiCall(endpoint: string, options: RequestOptions = {}) {
  const url = `${API_URL}${endpoint}`;
  const authHeaders = await getAuthHeader();

  const headers: Record<string, string> = {
    ...authHeaders,
    ...options.headers,
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`);
  }

  return data;
}

export const api = {
  apiCall,

  // Activities endpoints
  getActivities: () => apiCall('/api/activities'),
  getUserActivities: (_userId: string) =>
    apiCall('/api/activities/me'),
  createActivity: (activity: any) =>
    apiCall('/api/activities', { method: 'POST', body: activity }),
  getActivity: (id: string) => apiCall(`/api/activities/${id}`),
  updateActivity: (id: string, activity: any) =>
    apiCall(`/api/activities/${id}`, { method: 'PUT', body: activity }),
  deleteActivity: (id: string) =>
    apiCall(`/api/activities/${id}`, { method: 'DELETE' }),

  // Authentication endpoints
  signup: (email: string, password: string) =>
    apiCall('/api/auth/signup', { method: 'POST', body: { email, password } }),
  login: (email: string, password: string) =>
    apiCall('/api/auth/login', { method: 'POST', body: { email, password } }),

  // Token handling
  getToken: () => localStorage.getItem('token'),
  setToken: (token: string) => localStorage.setItem('token', token),
  clearToken: () => localStorage.removeItem('token'),

  // Health check
  health: () => apiCall('/api/health'),
};

