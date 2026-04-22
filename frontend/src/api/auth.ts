import { apiUrl } from './client'
import { parseApiError } from './errors'

export type TokenPair = {
  access: string
  refresh: string
}

const jsonHeaders = {
  'Content-Type': 'application/json',
}

export const login = async (username: string, password: string): Promise<TokenPair> => {
  const res = await fetch(apiUrl('/api/v1/auth/token/'), {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({ username, password }),
  })
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(parseApiError(data))
  }
  return data as TokenPair
}

export type RegisterPayload = {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
}

/** 公开注册成功：账号待管理员审批，无 Token */
export type RegisterSubmitted = {
  detail: string
  username: string
}

export const register = async (payload: RegisterPayload): Promise<RegisterSubmitted> => {
  const res = await fetch(apiUrl('/api/v1/auth/register/'), {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  })
  const data: unknown = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(parseApiError(data))
  }
  const d = data as { detail?: string; username?: string }
  return {
    detail: d.detail ?? '注册申请已提交',
    username: d.username ?? '',
  }
}
