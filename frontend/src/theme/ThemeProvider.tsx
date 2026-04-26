import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { AppThemeContext, type AppThemeValue } from './app-theme-context'
import {
  COLOR_SCHEME_STORAGE_KEY,
  THEME_STORAGE_KEY,
  readStoredColorScheme,
  normalizePrimaryHex,
  readEnvPrimary,
  readStoredPrimary,
} from './tokens'

const setRootPrimary = (hex: string) => {
  document.documentElement.style.setProperty('--app-color-primary', hex)
}

const getSystemIsDark = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
  const [primaryColor, setPrimaryState] = useState(() => readStoredPrimary() ?? readEnvPrimary())
  const [userColorScheme, setUserColorScheme] = useState<'light' | 'dark' | null>(
    () => readStoredColorScheme(),
  )
  const [systemIsDark, setSystemIsDark] = useState(getSystemIsDark)

  const isDark = userColorScheme != null ? userColorScheme === 'dark' : systemIsDark

  useEffect(() => {
    setRootPrimary(primaryColor)
  }, [primaryColor])

  useEffect(() => {
    if (userColorScheme != null) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemIsDark(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [userColorScheme])

  const setPrimaryColor = useCallback((hex: string) => {
    const n = normalizePrimaryHex(hex)
    if (n == null) return
    setPrimaryState(n)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, n)
    } catch {
      // ignore quota / private mode
    }
  }, [])

  const resetPrimaryColor = useCallback(() => {
    try {
      localStorage.removeItem(THEME_STORAGE_KEY)
    } catch {
      // ignore
    }
    setPrimaryState(readEnvPrimary())
  }, [])

  const setColorScheme = useCallback((mode: 'light' | 'dark') => {
    setUserColorScheme(mode)
    try {
      localStorage.setItem(COLOR_SCHEME_STORAGE_KEY, mode)
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo<AppThemeValue>(
    () => ({
      primaryColor,
      setPrimaryColor,
      resetPrimaryColor,
      isDark,
      setColorScheme,
    }),
    [isDark, primaryColor, resetPrimaryColor, setColorScheme, setPrimaryColor],
  )

  return (
    <AppThemeContext.Provider value={value}>
      <ConfigProvider
        locale={zhCN}
        theme={{
          algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
          token: {
            colorPrimary: primaryColor,
            fontFamily:
              "'Inter', 'Source Han Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </AppThemeContext.Provider>
  )
}
