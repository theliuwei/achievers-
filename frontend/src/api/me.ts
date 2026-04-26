import { get, patch, post } from './http'

export const DEFAULT_AVATAR_URL = '/media/avatars/user_1_0e182097306c475e8954887f52a1ef34.png'

export type MeResponse = {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  gender?: '' | 'male' | 'female' | 'other'
  phone?: string
  permission_codes: string[]
  is_staff: boolean
  is_superuser: boolean
}

export type MeUpdatePayload = Pick<
  MeResponse,
  'email' | 'first_name' | 'last_name' | 'avatar_url' | 'gender' | 'phone'
>

export const fetchMe = async (): Promise<MeResponse> => {
  const d = await get<MeResponse>('/api/v1/me/')
  return {
    ...d,
    permission_codes: Array.isArray(d.permission_codes) ? d.permission_codes : [],
  }
}

export const updateMe = async (payload: Partial<MeUpdatePayload>): Promise<MeResponse> => {
  const d = await patch<MeResponse, Partial<MeUpdatePayload>>('/api/v1/me/', payload)
  return {
    ...d,
    permission_codes: Array.isArray(d.permission_codes) ? d.permission_codes : [],
  }
}

export const uploadAvatar = async (file: File): Promise<MeResponse> => {
  const formData = new FormData()
  formData.append('avatar', file)
  const d = await post<MeResponse, FormData>('/api/v1/me/avatar/', formData)
  return {
    ...d,
    permission_codes: Array.isArray(d.permission_codes) ? d.permission_codes : [],
  }
}

export const changePassword = async (payload: {
  old_password: string
  new_password: string
}): Promise<{ detail: string }> => {
  return post('/api/v1/me/password/', payload)
}
