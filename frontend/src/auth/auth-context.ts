import { createContext } from 'react'

const ACCESS_KEY = 'achievers_access'
const REFRESH_KEY = 'achievers_refresh'

export { ACCESS_KEY, REFRESH_KEY }

export type AuthContextValue = {
  access: string | null
  /** null 表示尚未拉取或已登出；拉取失败则为 [] */
  permissionCodes: string[] | null
  setTokens: (tokens: { access: string; refresh: string }) => void
  logout: () => void
  /** 是否具备某权限码；超管为 *；未加载完成前为 false */
  hasPermission: (code: string) => boolean
}

export const AuthContext = createContext<AuthContextValue | null>(null)
