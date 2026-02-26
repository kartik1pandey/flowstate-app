/**
 * Updated API Client for Express Backend with JWT Authentication
 * This replaces the old NextAuth-based API calls
 */

import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:5000';

// Token management
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const tokenManager = {
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  removeToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  },

  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
};

// Create axios instance for backend API
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] Unauthorized - clearing token');
      tokenManager.removeToken();
      // Redirect to login if needed
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        window.location.href = '/auth/signin';
      }
    }
    console.error('[API] Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
    });
    return Promise.reject(error);
  }
);

// Create axios instance for ML API
const mlClient: AxiosInstance = axios.create({
  baseURL: ML_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authentication API
export const authAPI = {
  register: async (data: { email: string; password: string; name: string }) => {
    const response = await apiClient.post('/api/auth/register', data);
    if (response.data.token) {
      tokenManager.setToken(response.data.token);
      tokenManager.setUser(response.data.user);
    }
    return response.data;
  },

  signin: async (data: { email: string; password: string }) => {
    const response = await apiClient.post('/api/auth/signin', data);
    if (response.data.token) {
      tokenManager.setToken(response.data.token);
      tokenManager.setUser(response.data.user);
    }
    return response.data;
  },

  signout: () => {
    tokenManager.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  getUserProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await apiClient.patch('/api/auth/profile', data);
    if (response.data.user) {
      tokenManager.setUser(response.data.user);
    }
    return response.data;
  },

  updateUserProfile: async (data: any) => {
    const response = await apiClient.patch('/api/auth/profile', data);
    if (response.data.user) {
      tokenManager.setUser(response.data.user);
    }
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return !!tokenManager.getToken();
  },

  getCurrentUser: () => {
    return tokenManager.getUser();
  },
};

// Sessions API
export const sessionsAPI = {
  getAll: async (params?: { limit?: number; skip?: number }) => {
    const response = await apiClient.get('/api/sessions', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/api/sessions/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/api/sessions', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await apiClient.patch(`/api/sessions/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/api/sessions/${id}`);
    return response.data;
  },
};

// Interventions API
export const interventionsAPI = {
  getAll: async (params?: { limit?: number; sessionId?: string }) => {
    const response = await apiClient.get('/api/interventions', { params });
    return response.data;
  },

  create: async (data: any) => {
    const response = await apiClient.post('/api/interventions', data);
    return response.data;
  },

  update: async (id: string, data: { completed?: boolean; effectiveness?: number }) => {
    const response = await apiClient.patch(`/api/interventions/${id}`, data);
    return response.data;
  },
};

// Analytics API
export const analyticsAPI = {
  get: async (period: 'week' | 'month' | 'year' | 'all' = 'week') => {
    const response = await apiClient.get('/api/analytics', { params: { period } });
    return response.data;
  },
};

// Settings API
export const settingsAPI = {
  get: async () => {
    const response = await apiClient.get('/api/settings');
    return response.data;
  },

  update: async (data: any) => {
    const response = await apiClient.patch('/api/settings', data);
    return response.data;
  },
};

// Spotify API
export const spotifyAPI = {
  getAuthUrl: async () => {
    const response = await apiClient.get('/api/spotify/auth');
    return response.data;
  },

  getTopTracks: async (params?: { time_range?: string; limit?: number }) => {
    const response = await apiClient.get('/api/spotify/top-tracks', { params });
    return response.data;
  },

  getRecommendations: async (params: {
    mood?: string;
    activity?: string;
    energyLevel?: number;
    focus?: string;
    userMessage?: string;
    previousSongs?: string[];
    playlistLength?: number;
  }) => {
    const response = await apiClient.post('/api/spotify/recommendations', params);
    return response.data;
  },

  createPlaylist: async (data: { name: string; description?: string; trackUris: string[] }) => {
    const response = await apiClient.post('/api/spotify/create-playlist', data);
    return response.data;
  },

  playTrack: async (trackUris: string[], deviceId?: string) => {
    const response = await apiClient.post('/api/spotify/playback', {
      action: 'play',
      trackUris,
      deviceId,
    });
    return response.data;
  },

  pausePlayback: async () => {
    const response = await apiClient.post('/api/spotify/playback', { action: 'pause' });
    return response.data;
  },

  nextTrack: async () => {
    const response = await apiClient.post('/api/spotify/playback', { action: 'next' });
    return response.data;
  },

  previousTrack: async () => {
    const response = await apiClient.post('/api/spotify/playback', { action: 'previous' });
    return response.data;
  },

  getPlaybackState: async () => {
    const response = await apiClient.get('/api/spotify/playback');
    return response.data;
  },

  search: async (query: string, type: string = 'track', limit: number = 10) => {
    const response = await apiClient.get('/api/spotify/search', {
      params: { q: query, type, limit },
    });
    return response.data;
  },
};

// AI Chat API
export const aiAPI = {
  chat: async (data: { messages: any[]; type?: string; sessionData?: any; context?: string }) => {
    const response = await apiClient.post('/api/ai/chat', data);
    return response.data;
  },
};

// ML API
export const mlAPI = {
  sentiment: async (text: string) => {
    const response = await apiClient.post('/api/ml', {
      operation: 'sentiment',
      data: { text },
    });
    return response.data;
  },

  classify: async (text: string) => {
    const response = await apiClient.post('/api/ml', {
      operation: 'classify',
      data: { text },
    });
    return response.data;
  },

  predictFatigue: async (metrics: any) => {
    const response = await apiClient.post('/api/ml', {
      operation: 'predict-fatigue',
      data: { metrics },
    });
    return response.data;
  },
};

// Engagement Classification API (ML Model)
export const engagementAPI = {
  healthCheck: async () => {
    const response = await mlClient.get('/');
    return response.data;
  },

  getModelInfo: async () => {
    const response = await mlClient.get('/model/info');
    return response.data;
  },

  predictEngagement: async (imageBase64: string) => {
    const response = await mlClient.post('/predict', {
      image: imageBase64,
    });
    return response.data;
  },

  predictBatch: async (imagesBase64: string[]) => {
    const response = await mlClient.post('/predict/batch', {
      images: imagesBase64,
    });
    return response.data;
  },

  // Helper to convert canvas/video to base64
  captureFromVideo: (videoElement: HTMLVideoElement): string => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoElement, 0, 0);
      return canvas.toDataURL('image/jpeg').split(',')[1]; // Remove data:image/jpeg;base64, prefix
    }
    throw new Error('Failed to capture video frame');
  },

  // Helper to convert file to base64
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
};

// Code Execution API
export const executeAPI = {
  run: async (language: string, code: string, stdin?: string) => {
    const response = await apiClient.post('/api/execute', { language, code, stdin });
    return response.data;
  },
};

// Export the client instances for custom requests
export { apiClient, mlClient };

// Export default
export default {
  auth: authAPI,
  sessions: sessionsAPI,
  interventions: interventionsAPI,
  analytics: analyticsAPI,
  settings: settingsAPI,
  spotify: spotifyAPI,
  ai: aiAPI,
  ml: mlAPI,
  engagement: engagementAPI,
  execute: executeAPI,
  tokenManager,
};
