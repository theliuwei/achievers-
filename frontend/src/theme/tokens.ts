/** Ant Design 默认主色，与未配置 VITE_THEME_PRIMARY 时一致 */
export const DEFAULT_PRIMARY = '#1677ff'

export const THEME_STORAGE_KEY = 'achievers-theme-primary'

/** 明/暗色偏好：'light' | 'dark'；未写入时由系统 prefers-color-scheme 决定 */
export const COLOR_SCHEME_STORAGE_KEY = 'achievers-color-scheme'

export const THEME_PRESETS: { label: string; value: string }[] = [
  { label: '拂晓蓝', value: '#1890ff' },
  { label: '天蓝', value: '#1677ff' },
  { label: '薄暮', value: '#f5222d' },
  { label: '火山', value: '#fa541c' },
  { label: '日暮', value: '#fa8c16' },
  { label: '明青', value: '#13c2c2' },
  { label: '极光绿', value: '#52c41a' },
  { label: '极客蓝', value: '#2f54eb' },
  { label: '酱紫', value: '#722ed1' },
]

const HEX_3_6 = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * 规范化为小写 #rrggbb；非法输入返回 null。
 * 支持 #RGB、#RRGGBB、带或不带前导 #。
 */
export const normalizePrimaryHex = (raw: string | null | undefined): string | null => {
  if (raw == null) return null
  const s = String(raw).trim()
  if (!s) return null
  const withHash = s.startsWith('#') ? s : `#${s}`
  if (!HEX_3_6.test(withHash)) return null
  const body = withHash.slice(1).toLowerCase()
  if (body.length === 3) {
    const [r, g, b] = body.split('')
    return `#${r}${r}${g}${g}${b}${b}`
  }
  return `#${body}`
}

export const isValidPrimaryHex = (value: string): boolean => normalizePrimaryHex(value) != null

/** 自构建时环境变量 VITE_THEME_PRIMARY 读取并规范化，无效则回退 DEFAULT_PRIMARY */
export const readEnvPrimary = (): string => normalizePrimaryHex(import.meta.env.VITE_THEME_PRIMARY) ?? DEFAULT_PRIMARY

/** 自 localStorage 读取并规范化，不存在或非法则 null */
export const readStoredPrimary = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    return raw ? normalizePrimaryHex(raw) : null
  } catch {
    return null
  }
}

export type StoredColorScheme = 'light' | 'dark'

export const readStoredColorScheme = (): StoredColorScheme | null => {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(COLOR_SCHEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark') return raw
  } catch {
    // ignore
  }
  return null
}
