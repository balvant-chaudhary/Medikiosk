// src/services/api.js
import axios from 'axios';

// Create axios instance pointing to backend
const api = axios.create({
  baseURL: '/api',          // proxied through Vite to http://localhost:5000/api
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT from localStorage ────
api.interceptors.request.use((config) => {
  let token;
  if (window.location.pathname.startsWith('/patient')) {
    token = localStorage.getItem('mk_patient_token') || localStorage.getItem('mk_token');
  } else {
    token = localStorage.getItem('mk_token') || localStorage.getItem('mk_patient_token');
  }
  
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: handle 401 globally ────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired or invalid — clear storage and redirect to login
      localStorage.removeItem('mk_token');
      localStorage.removeItem('mk_user');
      if (!window.location.pathname.includes('/doctor/login')) {
        window.location.href = '/doctor/login';
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth API ─────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  me:       ()     => api.get('/auth/me'),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// ── Patient API (Phase 8) ─────────────────────────────────
export const patientAPI = {
  create:  (data) => api.post('/patients', data),
  getById: (id)   => api.get(`/patients/${id}`),
  update:  (id, data) => api.put(`/patients/${id}`, data),
};

// ── Consent API (Phase 8) ─────────────────────────────────
export const consentAPI = {
  create:        (data)      => api.post('/consents', data),
  getByPatient:  (patientId) => api.get(`/consents/${patientId}`),
};

// ── Interview API (Phase 9) ───────────────────────────────
export const interviewAPI = {
  create:      (data)        => api.post('/interviews', data),
  answer:      (id, data)    => api.post(`/interviews/${id}/answer`, data),
  getById:     (id)          => api.get(`/interviews/${id}`),
  getNext:     (id)          => api.get(`/interviews/${id}/next`),
  complete:    (id)          => api.post(`/interviews/${id}/complete`),
};

// ── Document API (Phase 12) ────────────────────────────────
export const documentAPI = {
  upload:       (formData)    => api.post('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000 // OCR can take longer, give it 30s
  }),
  getById:      (id)          => api.get(`/documents/${id}`),
  getByPatient: (patientId)   => api.get(`/patients/${patientId}/documents`),
};

// ── AI API (Phase 10) ────────────────────────────────────
export const aiAPI = {
  nextQuestion:    (data) => api.post('/ai/next-question', data),
  extract:         (data) => api.post('/ai/extract', data),
  generateSummary: (data) => api.post('/ai/generate-summary', data),
  redFlags:        (data) => api.post('/ai/red-flags', data),
};

// ── Doctor API (Phase 15) ────────────────────────────────
export const doctorAPI = {
  getQueue:          ()          => api.get('/doctor/queue'),
  getPatient:        (id)        => api.get(`/doctor/patients/${id}`),
  updateSummary:     (id, data)  => api.put(`/doctor/summaries/${id}`, data),
  addNote:           (data)      => api.post('/doctor/notes', data),
};

// ── Admin API (Phase 14) ────────────────────────────────
export const adminAPI = {
  getStats:    () => api.get('/admin/stats'),
  getWorkload: () => api.get('/admin/workload'),
};

export default api;
