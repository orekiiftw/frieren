import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medchain_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('medchain_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth API ────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
}

// ─── Records API ─────────────────────────────────────
export const recordsAPI = {
  upload: (data) => api.post('/records/upload', data),
  getRecords: (patientAddress) => api.get(`/records/${patientAddress}`),
  downloadRecord: (patientAddress, index) =>
    api.get(`/records/${patientAddress}/${index}/download`),
}

// ─── Access Control API ──────────────────────────────
export const accessAPI = {
  grant: (doctorAddress) => api.post('/access/grant', { doctorAddress }),
  revoke: (doctorAddress) => api.post('/access/revoke', { doctorAddress }),
  check: (patientAddress) => api.get(`/access/check/${patientAddress}`),
}

// ─── AI API ──────────────────────────────────────────
export const aiAPI = {
  chat: (message, conversationHistory = []) =>
    api.post('/ai/chat', { message, conversationHistory }),
  predict: (patientData, predictionType) =>
    api.post('/ai/predict', { patientData, predictionType }),
}

// ─── Imaging API ─────────────────────────────────────
export const imagingAPI = {
  analyze: (formData) =>
    api.post('/imaging/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getHistory: () => api.get('/imaging/history'),
}

export default api
