import { createContext, useContext } from 'react'

export type AppThemeValue = {
  /** 当前主色，已规范为 #rrggbb */
  primaryColor: string
  setPrimaryColor: (hex: string) => void
  /** 清除本地存储并恢复为环境变量/默认主色 */
  resetPrimaryColor: () => void
  /** 根据 ConfigProvider 算法（含无本地记录时跟随系统）得到当前是否为暗黑模式 */
  isDark: boolean
  /** 将明/暗选择写入 localStorage 并应用 */
  setColorScheme: (mode: 'light' | 'dark') => void
}

export const AppThemeContext = createContext<AppThemeValue | null>(null)

export const useAppTheme = (): AppThemeValue => {
  const v = useContext(AppThemeContext)
  if (v == null) {
    throw new Error('useAppTheme must be used within AppThemeProvider')
  }
  return v
}
