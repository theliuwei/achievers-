import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ConfigProvider, theme } from 'antd'
import deDE from 'antd/locale/de_DE'
import enUS from 'antd/locale/en_US'
import esES from 'antd/locale/es_ES'
import frFR from 'antd/locale/fr_FR'
import idID from 'antd/locale/id_ID'
import itIT from 'antd/locale/it_IT'
import nlNL from 'antd/locale/nl_NL'
import plPL from 'antd/locale/pl_PL'
import ptPT from 'antd/locale/pt_PT'
import ruRU from 'antd/locale/ru_RU'
import thTH from 'antd/locale/th_TH'
import viVN from 'antd/locale/vi_VN'
import zhCN from 'antd/locale/zh_CN'
import i18n from '../i18n'
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
  const [language, setLanguage] = useState(i18n.resolvedLanguage || i18n.language || 'en')

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

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLanguage(lng)
    }
    i18n.on('languageChanged', handleLanguageChange)
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [])

  const antdLocale = useMemo(() => {
    if (language.startsWith('en')) return enUS
    if (language.startsWith('id')) return idID
    if (language.startsWith('vi')) return viVN
    if (language.startsWith('ru')) return ruRU
    if (language.startsWith('de')) return deDE
    if (language.startsWith('fr')) return frFR
    if (language.startsWith('es')) return esES
    if (language.startsWith('it')) return itIT
    if (language.startsWith('pt')) return ptPT
    if (language.startsWith('pl')) return plPL
    if (language.startsWith('nl')) return nlNL
    if (language.startsWith('th')) return thTH
    return zhCN
  }, [language])

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
        locale={antdLocale}
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
