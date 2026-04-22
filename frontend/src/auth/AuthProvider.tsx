import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { fetchMe } from '../api/me'
import { ACCESS_KEY, AuthContext, REFRESH_KEY } from './auth-context'

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [access, setAccess] = useState<string | null>(() =>
    localStorage.getItem(ACCESS_KEY),
  )
  const [permissionCodes, setPermissionCodes] = useState<string[] | null>(null)

  useEffect(() => {
    if (!access) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 登出时立即清空权限，避免旧角色闪现
      setPermissionCodes(null)
      return
    }
    let alive = true
    void (async () => {
      try {
        const me = await fetchMe()
        if (!alive) {
          return
        }
        setPermissionCodes(me.permission_codes)
      } catch {
        if (alive) {
          setPermissionCodes([])
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [access])

  const setTokens = (tokens: { access: string; refresh: string }) => {
    localStorage.setItem(ACCESS_KEY, tokens.access)
    localStorage.setItem(REFRESH_KEY, tokens.refresh)
    setAccess(tokens.access)
  }

  const logout = () => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setAccess(null)
    setPermissionCodes(null)
  }

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
      permissionCodes,
      setTokens,
      logout,
      hasPermission,
    }),
    [access, permissionCodes, hasPermission],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
