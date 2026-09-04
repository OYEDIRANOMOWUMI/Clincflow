const localApiFallback = 'http://localhost:3700/api'
const productionApiFallback = 'https://server-fiv-chi-32.vercel.app/api'
import axios from 'axios'
import { clearSession, getLoginPathForRole, getSession, setAuthNotice } from './auth.js'

export const API_URL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
  (import.meta.env.PROD ? productionApiFallback : localApiFallback)

export const getAuthHeaders = () => {
  try {
    const session = JSON.parse(localStorage.getItem('clinicflow_auth_session') || 'null')
    const token = session?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const session = getSession()
  if (session?.token) config.headers = { ...config.headers, Authorization: `Bearer ${session.token}` }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      const session = getSession()
      if (session?.token === 'demo-token') return Promise.reject(error)
      clearSession()
      window.location.assign('/login')
    }
    return Promise.reject(error)
  }
)

const handleAuthFailure = (response) => {
  if (response?.status !== 401 || response?.data?.code !== 'TOKEN_EXPIRED') return
  const role = getSession()?.role
  clearSession()
  setAuthNotice('Your session expired. Please log in again.')
  window.location.assign(getLoginPathForRole(role))
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    handleAuthFailure(error.response)
    return Promise.reject(error)
  }
)

export const apiFetch = async (url, options = {}) => {
  const response = await fetch(url, options)
  if (response.status === 401) {
    const data = await response.clone().json().catch(() => null)
    handleAuthFailure({ status: response.status, data })
  }
  return response
}

export const patientRecordApi = {
  list: async () => {
    const response = await apiFetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return response.json()
  },
  update: async (patientId, payload) => {
    const response = await apiFetch(`${API_URL}/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    })
    return response.json()
  },
  delete: async (patientId) => {
    const response = await apiFetch(`${API_URL}/patients/${patientId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return response.json()
  }
}

export const patientApi = {
  list: () => api.get('/patients'),
  volume: () => api.get('/patients/stats/volume'),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`)
}

export const adminApi = {
  listStaff: () => api.get('/admin/staff'),
  listPatients: () => api.get('/admin/patients'),
  createStaff: (data) => api.post('/user/staff', data),
  createPatient: (data) => api.post('/user/hospital-patient', data)
}

export default api
