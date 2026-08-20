const localApiFallback = 'http://localhost:3700/api'
const productionApiFallback = 'https://clinicflow-back.vercel.app/api'

export const API_URL =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
  (import.meta.env.PROD ? productionApiFallback : localApiFallback)

export const getAuthHeaders = () => {
  try {
    const session = JSON.parse(localStorage.getItem('clinicflow_auth_session') || 'null')
    const token = session?.token
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch (error) {
    return {}
  }
}

export const patientRecordApi = {
  list: async () => {
    const response = await fetch(`${API_URL}/patients`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return response.json()
  },
  update: async (patientId, payload) => {
    const response = await fetch(`${API_URL}/patients/${patientId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    })
    return response.json()
  }
}
