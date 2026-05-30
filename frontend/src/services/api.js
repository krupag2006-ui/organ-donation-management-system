import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error.response?.data || error);
  }
);

export const authAPI = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
  profile: () => api.get('/auth/profile'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
};

export const donorAPI = {
  list: () => api.get('/donors'),
  create: (payload) => api.post('/donors', payload),
  update: (id, payload) => api.put(`/donors/${id}`, payload),
  remove: (id) => api.delete(`/donors/${id}`),
};

export const recipientAPI = {
  list: () => api.get('/recipients'),
  create: (payload) => api.post('/recipients', payload),
  update: (id, payload) => api.put(`/recipients/${id}`, payload),
  remove: (id) => api.delete(`/recipients/${id}`),
};

export const hospitalAPI = {
  list: () => api.get('/hospitals'),
  create: (payload) => api.post('/hospitals', payload),
  update: (id, payload) => api.put(`/hospitals/${id}`, payload),
  remove: (id) => api.delete(`/hospitals/${id}`),
};

export const transplantRequestAPI = {
  list: () => api.get('/transplant-requests'),
  create: (payload) => api.post('/transplant-requests', payload),
  update: (id, payload) => api.put(`/transplant-requests/${id}`, payload),
  updateStatus: (id, payload) => api.patch(`/transplant-requests/${id}/status`, payload),
  remove: (id) => api.delete(`/transplant-requests/${id}`),
};

export default api;
