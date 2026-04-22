import { apiUrl } from './client'

const ACCESS_KEY = 'achievers_access'

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_KEY)

/** 带 Bearer 的 fetch（用于需登录的 API） */
export const apiFetch = (path: string, init: RequestInit = {}): Promise<Response> => {
  const token = getAccessToken()
  const headers = new Headers(init.headers)
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  return fetch(apiUrl(path), { ...init, headers })
}
