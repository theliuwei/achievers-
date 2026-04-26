import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { ACCESS_KEY, AUTH_EXPIRED_EVENT, REFRESH_KEY } from '../auth/auth-context'
import { API_BASE_URL } from './client'
import { parseApiError } from './errors'

export const getAccessToken = (): string | null => localStorage.getItem(ACCESS_KEY)
export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_KEY)

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

export class ApiRequestError extends Error {
  status?: number
  data?: unknown

  constructor(message: string, status?: number, data?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.data = data
  }
}

export const http = axios.create({
  baseURL: API_BASE_URL || undefined,
  timeout: 30000,
  headers: {
    Accept: 'application/json',
  },
})

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    const status = error.response?.status
    const data = error.response?.data
    if (status === 401) {
      clearAuthTokens()
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
    }
    throw new ApiRequestError(
      data ? parseApiError(data) : error.message || '请求失败，请稍后重试',
      status,
      data,
    )
  },
)

export const request = async <T = unknown>(config: AxiosRequestConfig): Promise<T> => {
  const response = await http.request<T>(config)
  return response.data
}

export const get = <T = unknown>(
  url: string,
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>,
) => request<T>({ ...config, url, method: 'GET' })

export const post = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: Omit<AxiosRequestConfig<D>, 'url' | 'method' | 'data'>,
) => request<T>({ ...config, url, data, method: 'POST' })

export const put = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: Omit<AxiosRequestConfig<D>, 'url' | 'method' | 'data'>,
) => request<T>({ ...config, url, data, method: 'PUT' })

export const patch = <T = unknown, D = unknown>(
  url: string,
  data?: D,
  config?: Omit<AxiosRequestConfig<D>, 'url' | 'method' | 'data'>,
) => request<T>({ ...config, url, data, method: 'PATCH' })

export const del = <T = unknown>(
  url: string,
  config?: Omit<AxiosRequestConfig, 'url' | 'method'>,
) => request<T>({ ...config, url, method: 'DELETE' })
