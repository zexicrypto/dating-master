import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const generateText = async (data) => {
  const response = await api.post('/api/generate/text', data)
  return response.data
}

export const generateImage = async (data) => {
  const response = await api.post('/api/generate/image', data)
  return response.data
}

export const getPersonas = async () => {
  const response = await api.get('/api/personas')
  return response.data
}

export const getScenes = async () => {
  const response = await api.get('/api/scenes')
  return response.data
}

export default api
