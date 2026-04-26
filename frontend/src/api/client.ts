export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

/** 请求 Django API 的路径（开发环境默认相对路径，经 Vite 代理） */
export const apiUrl = (path: string): string => {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${p}`
}
