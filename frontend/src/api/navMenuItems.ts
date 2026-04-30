import { createEntityApi, type PageResult } from '../components/admin-table'
import { del, get, patch, post } from './http'

export type NavMenuItemRow = {
  id: number
  parent: number | null
  parent_display?: string | null
  title: string
  path: string
  icon: string
  permission_code: string
  sort_order: number
  is_active: boolean
}

export type NavMenuItemPayload = Omit<NavMenuItemRow, 'id' | 'parent_display'>

export const navMenuItemApi = createEntityApi<NavMenuItemRow, NavMenuItemPayload>(
  '/api/v1/nav-menu-items/',
)

export const fetchNavMenuItems = async (
  params: Record<string, unknown> = {},
): Promise<PageResult<NavMenuItemRow>> => {
  const { current, pageSize, ...rest } = params
  const data = await get<NavMenuItemRow[] | { count: number; results: NavMenuItemRow[] }>(
    '/api/v1/nav-menu-items/',
    {
      params: {
        ...rest,
        page: current,
        page_size: pageSize,
      },
    },
  )
  if (Array.isArray(data)) {
    return { data, total: data.length }
  }
  return { data: data.results ?? [], total: data.count ?? 0 }
}

export const createNavMenuItem = (payload: NavMenuItemPayload): Promise<NavMenuItemRow> =>
  post('/api/v1/nav-menu-items/', payload)

export const updateNavMenuItem = (
  id: number,
  payload: NavMenuItemPayload,
): Promise<NavMenuItemRow> => patch(`/api/v1/nav-menu-items/${id}/`, payload)

export const deleteNavMenuItem = (id: number): Promise<void> =>
  del(`/api/v1/nav-menu-items/${id}/`)
