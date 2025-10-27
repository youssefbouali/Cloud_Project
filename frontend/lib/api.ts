const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

function clearAuthToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

async function apiCall(endpoint: string, options: RequestOptions = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const api = {
  apiCall,

  // Auth endpoints
  signup: (email: string, password: string) =>
    apiCall('/api/auth/signup', {
      method: 'POST',
      body: { email, password },
    }),

  login: (email: string, password: string) =>
    apiCall('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    }),

  // Activities endpoints
  getActivities: () => apiCall('/api/activities'),

  getUserActivities: (userId: string) =>
    apiCall(`/api/activities/user/${userId}`),

  createActivity: (activity: any) =>
    apiCall('/api/activities', {
      method: 'POST',
      body: activity,
    }),

  getActivity: (id: string) => apiCall(`/api/activities/${id}`),

  deleteActivity: (id: string) =>
    apiCall(`/api/activities/${id}`, {
      method: 'DELETE',
    }),

  // Health check
  health: () => apiCall('/api/health'),

  // Token management
  getToken: () => getAuthToken(),
  setToken: setAuthToken,
  clearToken: clearAuthToken,
};
