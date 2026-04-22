/**
 * 导航菜单：数据结构与可见性均由后端（NavMenuItem + RBAC）决定，前端只请求并渲染。
 */
import { parseApiError } from './errors'
import { apiFetch } from './http'

export type NavMenuNode = {
  key: string
  title: string
  icon: string
  path: string
  children?: NavMenuNode[]
}

export const fetchNavMenu = async (): Promise<NavMenuNode[]> => {
  const res = await apiFetch('/api/v1/me/nav-menu/')
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(parseApiError(data))
  }
  return data as NavMenuNode[]
}
