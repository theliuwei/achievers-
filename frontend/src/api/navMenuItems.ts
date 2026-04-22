import { parseApiError } from './errors'
import { apiFetch } from './http'

export type NavMenuItemRow = {
  id: number
  parent: number | null
  title: string
  path: string
  icon: string
  permission_code: string
  sort_order: number
  is_active: boolean
}

export const fetchNavMenuItems = async (): Promise<NavMenuItemRow[]> => {
  const res = await apiFetch('/api/v1/nav-menu-items/')
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(parseApiError(data))
  }
  if (Array.isArray(data)) {
    return data
  }
  const paged = data as { results?: NavMenuItemRow[] }
  return paged.results ?? []
}
