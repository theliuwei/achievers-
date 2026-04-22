import { parseApiError } from './errors'
import { apiFetch } from './http'

export type MeResponse = {
  id: number
  username: string
  email: string
  permission_codes: string[]
  is_staff: boolean
  is_superuser: boolean
}

export const fetchMe = async (): Promise<MeResponse> => {
  const res = await apiFetch('/api/v1/me/')
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(parseApiError(data))
  }
  const d = data as MeResponse
  return {
    ...d,
    permission_codes: Array.isArray(d.permission_codes) ? d.permission_codes : [],
  }
}
