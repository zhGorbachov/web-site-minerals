import axios from 'axios'

export const isMockMode = import.meta.env.VITE_MOCK === 'true'

const API_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:3001'

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const TOKEN_KEY = 'crystal-auth-token'

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof config.headers === 'object') {
      delete (config.headers as Record<string, unknown>)['Content-Type']
    }
  }
  return config
})

export function mediaUrl(path: string) {
  if (!path) return path
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path
  }
  if (path.startsWith('/media/') || path.startsWith('/uploads/')) {
    return `${API_URL}${path}`
  }
  return path
}

export function withMediaUrls<T extends { image?: string; images?: string[]; video?: string | null }>(
  item: T,
): T {
  return {
    ...item,
    image: item.image ? mediaUrl(item.image) : item.image,
    images: item.images?.map(mediaUrl),
    video: item.video ? mediaUrl(item.video) : item.video ?? undefined,
  }
}

export { API_URL }
