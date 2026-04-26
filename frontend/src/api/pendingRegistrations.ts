import { get, post } from './http'
import type { PageResult } from '../components/admin-table'

export type PendingUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
}

export const fetchPendingRegistrations = async (
  params: Record<string, unknown> = {},
): Promise<PageResult<PendingUser>> => {
  const { current, pageSize, ...rest } = params
  const data = await get<PendingUser[] | { count?: number; results?: PendingUser[] }>(
    '/api/v1/pending-registrations/',
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

export const approveRegistration = async (id: number): Promise<void> => {
  await post(`/api/v1/pending-registrations/${id}/approve/`)
}

export const rejectRegistration = async (id: number): Promise<void> => {
  await post(`/api/v1/pending-registrations/${id}/reject/`)
}
