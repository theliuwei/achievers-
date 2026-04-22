import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

type RequireAuthProps = {
  children: ReactNode
}

/** 未登录时跳转登录页，并带上来源路径便于登录后回跳 */
export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { access } = useAuth()
  const location = useLocation()

  if (!access) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
