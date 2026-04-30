import type { CSSProperties } from 'react'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Space, Switch, Typography, theme } from 'antd'
import { useTranslation } from 'react-i18next'
import { useAppTheme } from './app-theme-context'

const { useToken } = theme
const { Text } = Typography

const labelStyle: CSSProperties = {
  minWidth: 32,
  fontSize: 13,
}

type ThemeToggleProps = {
  className?: string
}

/**
 * 在任意已挂载于 AppThemeProvider 的位置使用，切换明/暗并持久化到 localStorage。
 */
export const ThemeToggle = ({ className }: ThemeToggleProps) => {
  const { isDark, setColorScheme } = useAppTheme()
  const { token } = useToken()
  const { t } = useTranslation('common')

  return (
    <Space
      size="small"
      className={className}
      align="center"
      data-testid="theme-toggle"
    >
      <SunOutlined
        style={{ color: isDark ? token.colorTextQuaternary : token.colorWarning }}
        aria-hidden
      />
      <Switch
        checked={isDark}
        onChange={(checked) => setColorScheme(checked ? 'dark' : 'light')}
        aria-label={
          isDark ? t('themeToggle.aria.darkToLight') : t('themeToggle.aria.lightToDark')
        }
      />
      <MoonOutlined
        style={{ color: isDark ? token.colorInfo : token.colorTextQuaternary }}
        aria-hidden
      />
      <Text type="secondary" style={labelStyle}>
        {isDark ? t('themeToggle.dark') : t('themeToggle.light')}
      </Text>
    </Space>
  )
}
