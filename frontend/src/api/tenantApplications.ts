import { get, post } from './http'
import type { PageResult } from '../components/admin-table'

export type TenantApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface TenantApplicationRow {
  id: number
  created_at?: string
  updated_at?: string
  company_name: string
  company_code: string
  company_address: string
  contact_name: string
  contact_phone: string
  contact_email: string
  admin_username: string
  admin_email: string
  admin_first_name: string
  admin_last_name: string
  admin_phone: string
  requested_max_members: number
  requested_storage_quota_mb: number
  status: TenantApplicationStatus
  reviewed_by: number | null
  reviewed_at: string | null
  reject_reason: string
  tenant: number | null
}

export interface TenantApplicationPayload {
  company_name: string
  company_code: string
  company_address?: string
  contact_name?: string
  contact_phone?: string
  contact_email?: string
  admin_username: string
  admin_email: string
  admin_first_name?: string
  admin_last_name?: string
  admin_phone?: string
  admin_password: string
  requested_max_members: number
  requested_storage_quota_mb: number
}

export const createTenantApplication = async (
  values: TenantApplicationPayload,
): Promise<TenantApplicationRow> => post('/api/v1/tenant-applications/', values)

export const fetchTenantApplications = async (
  params: Record<string, unknown> = {},
): Promise<PageResult<TenantApplicationRow>> => {
  const { current, pageSize, ...rest } = params
  const data = await get<TenantApplicationRow[] | { count?: number; results?: TenantApplicationRow[] }>(
    '/api/v1/tenant-applications/',
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
  const rows = data.results ?? []
  return { data: rows, total: data.count ?? rows.length }
}

export const approveTenantApplication = async (id: number): Promise<void> => {
  await post(`/api/v1/tenant-applications/${id}/approve/`)
}

export const rejectTenantApplication = async (id: number, reject_reason = ''): Promise<void> => {
  await post(`/api/v1/tenant-applications/${id}/reject/`, { reject_reason })
}
