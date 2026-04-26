import { del, get, patch, post } from './http'
import type { PageResult } from '../components/admin-table'

export interface PermissionRow {
  id: number
  code: string
  name: string
  description: string
  sort_order: number
}

export interface RoleRow {
  id: number
  created_at?: string
  updated_at?: string
  code: string
  name: string
  description: string
  data_scope: 'own' | 'department' | 'tenant' | 'all'
  is_active: boolean
  is_system: boolean
  permissions: number[]
}

export interface RolePayload {
  code: string
  name: string
  description?: string
  data_scope: 'own' | 'department' | 'tenant' | 'all'
  is_active: boolean
  is_system: boolean
  permissions?: number[]
}

interface DrfPageResult<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface RoleListParams {
  id?: number
  current?: number
  page?: number
  pageSize?: number
  page_size?: number
  keyword?: string
  code?: string
  name?: string
  description?: string
  data_scope?: 'own' | 'department' | 'tenant' | 'all'
  is_active?: boolean
  is_system?: boolean
}

const toPageResult = <T>(data: T[] | DrfPageResult<T>): PageResult<T> => {
  if (Array.isArray(data)) {
    return { data, total: data.length }
  }
  return { data: data.results, total: data.count }
}

export const fetchRoles = async (params: RoleListParams = {}): Promise<PageResult<RoleRow>> => {
  const { current, page, pageSize, page_size, keyword, ...rest } = params
  const data = await get<RoleRow[] | DrfPageResult<RoleRow>>('/api/v1/roles/', {
    params: {
      ...rest,
      page: current ?? page,
      page_size: pageSize ?? page_size,
      search: keyword?.trim() || undefined,
    },
  })
  return toPageResult(data)
}

export const fetchPermissions = async (): Promise<PermissionRow[]> => {
  const data = await get<PermissionRow[] | DrfPageResult<PermissionRow>>('/api/v1/permissions/')
  return Array.isArray(data) ? data : data.results
}

export const createRole = (payload: RolePayload): Promise<RoleRow> =>
  post<RoleRow, RolePayload>('/api/v1/roles/', payload)

export const updateRole = (id: number, payload: RolePayload): Promise<RoleRow> =>
  patch<RoleRow, RolePayload>(`/api/v1/roles/${id}/`, payload)

export const deleteRole = (id: number): Promise<void> => del(`/api/v1/roles/${id}/`)
