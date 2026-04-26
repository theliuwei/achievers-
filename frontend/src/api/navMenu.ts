/**
 * 导航菜单：数据结构与可见性均由后端（NavMenuItem + RBAC）决定，前端只请求并渲染。
 */
import { get } from './http'

export type NavMenuNode = {
  key: string
  title: string
  icon: string
  path: string
  children?: NavMenuNode[]
}

export const fetchNavMenu = async (): Promise<NavMenuNode[]> => {
  return get<NavMenuNode[]>('/api/v1/me/nav-menu/')
}
