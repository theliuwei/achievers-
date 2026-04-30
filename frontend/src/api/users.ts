import { createEntityApi, type PageResult } from '../components/admin-table'
import { get } from './http'

export interface UserRoleBrief {
  id: number
  code: string
  name: string
  is_active: boolean
  is_system: boolean
}

export interface UserRow {
  id: number
  created_at?: string
  updated_at?: string
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_staff: boolean
  is_superuser: boolean
  user_kind: 'platform' | 'tenant'
  default_tenant: number | null
  default_tenant_display?: string | null
  roles: UserRoleBrief[]
}

export interface UserPayload extends Record<string, unknown> {
  username: string
  email: string
  password?: string
  first_name?: string
  last_name?: string
  is_active: boolean
  is_staff: boolean
  user_kind: 'platform' | 'tenant'
  default_tenant?: number | null
  role_ids?: number[]
}

export const userApi = createEntityApi<UserRow, UserPayload>('/api/v1/accounts/')

export const fetchUsers = async (params: Record<string, unknown>): Promise<PageResult<UserRow>> => {
  const { current, pageSize, ...rest } = params
  const data = await get<UserRow[] | { count: number; results: UserRow[] }>('/api/v1/accounts/', {
    params: {
      ...rest,
      page: current,
      page_size: pageSize,
    },
  })
  if (Array.isArray(data)) {
    return { data, total: data.length }
  }
  return { data: data.results ?? [], total: data.count ?? 0 }
}
