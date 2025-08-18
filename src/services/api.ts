import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: any) =>
    api.post('/auth/register', userData),
  
  resetPassword: (data: { username: string; oldPassword: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  
  getCurrentUser: () =>
    api.get('/auth/me'),
  
  logout: () =>
    api.post('/auth/logout'),
};

// Permits API
export const permitsAPI = {
  getAll: (params?: any) =>
    api.get('/permits', { params }),
  
  getById: (id: string) =>
    api.get(`/permits/${id}`),
  
  create: (permitData: any) =>
    api.post('/permits', permitData),
  
  update: (id: string, permitData: any) =>
    api.put(`/permits/${id}`, permitData),
  
  close: (id: string) =>
    api.patch(`/permits/${id}/close`),
  
  reopen: (id: string) =>
    api.patch(`/permits/${id}/reopen`),
  
  delete: (id: string) =>
    api.delete(`/permits/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () =>
    api.get('/users'),
  
  create: (userData: any) =>
    api.post('/users', userData),
  
  update: (id: string, userData: any) =>
    api.put(`/users/${id}`, userData),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
  
  getRolePermissions: () =>
    api.get('/users/role-permissions'),
  
  updateRolePermissions: (role: string, permissions: any) =>
    api.put(`/users/role-permissions/${role}`, { permissions }),
};

// Activity API
export const activityAPI = {
  getAll: (params?: any) =>
    api.get('/activity', { params }),
  
  getActions: () =>
    api.get('/activity/actions'),
};

// Statistics API
export const statisticsAPI = {
  get: () =>
    api.get('/statistics'),
};

export default api;