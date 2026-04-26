import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchMe, type MeResponse } from '../api/me'
import { ACCESS_KEY, AUTH_EXPIRED_EVENT, AuthContext, REFRESH_KEY } from './auth-context'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [access, setAccess] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_KEY),
  )
  const [user, setUser] = useState<MeResponse | null>(null)
  const [permissionCodes, setPermissionCodes] = useState<string[] | null>(null)

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setAccess(null)
    setUser(null)
    setPermissionCodes(null)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem(ACCESS_KEY)) {
      return null
    }
    try {
      const me = await fetchMe()
      setUser(me)
      setPermissionCodes(me.permission_codes)
      return me
    } catch {
      setUser(null)
      setPermissionCodes([])
      return null
    }
  }, [])

  useEffect(() => {
    if (!access) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 登出时立即清空权限，避免旧角色闪现
      setPermissionCodes(null)
      setUser(null)
      return
    }
    let alive = true
    void (async () => {
      const me = await refreshUser()
      if (!alive) {
        return
      }
      if (!me) {
        setPermissionCodes([])
      }
    })()
    return () => {
      alive = false
    }
  }, [access, refreshUser])

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout)
  }, [logout])

  const setTokens = useCallback((tokens: { access: string; refresh: string }) => {
    localStorage.setItem(ACCESS_KEY, tokens.access)
    localStorage.setItem(REFRESH_KEY, tokens.refresh)
    setAccess(tokens.access)
  }, [])

  const hasPermission = useCallback(
    (code: string) => {
      const codes = permissionCodes
      if (codes == null) {
        return false
      }
      return codes.includes('*') || codes.includes(code)
    },
    [permissionCodes],
  )

  const value = useMemo(
    () => ({
      access,
      user,
      permissionCodes,
      refreshUser,
      setTokens,
      logout,
      hasPermission,
    }),
    [access, user, permissionCodes, refreshUser, setTokens, logout, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
