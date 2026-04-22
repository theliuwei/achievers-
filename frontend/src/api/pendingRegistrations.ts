import { parseApiError } from './errors'
import { apiFetch } from './http'

export type PendingUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  date_joined: string
}

export const fetchPendingRegistrations = async (): Promise<PendingUser[]> => {
  const res = await apiFetch('/api/v1/pending-registrations/')
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(parseApiError(data))
  }
  if (Array.isArray(data)) {
    return data
  }
  const paged = data as { results?: PendingUser[] }
  return paged.results ?? []
}

export const approveRegistration = async (id: number): Promise<void> => {
  const res = await apiFetch(`/api/v1/pending-registrations/${id}/approve/`, {
    method: 'POST',
  })
  if (!res.ok) {
    const data: unknown = await res.json().catch(() => ({}))
    throw new Error(parseApiError(data))
  }
}

export const rejectRegistration = async (id: number): Promise<void> => {
  const res = await apiFetch(`/api/v1/pending-registrations/${id}/reject/`, {
    method: 'POST',
  })
  if (!res.ok) {
    const data: unknown = await res.json().catch(() => ({}))
    throw new Error(parseApiError(data))
  }
}
