import i18n from '../i18n'
import { post } from './http'

export type TokenPair = {
  access: string
  refresh: string
}

export const login = async (username: string, password: string): Promise<TokenPair> => {
  return post<TokenPair>('/api/v1/auth/token/', { username, password })
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
  const data = await post<Partial<RegisterSubmitted>, RegisterPayload>(
    '/api/v1/auth/register/',
    payload,
  )
  const d = data as { detail?: string; username?: string }
  return {
    detail: d.detail ?? i18n.t('common:register.messages.submitted'),
    username: d.username ?? '',
  }
}
