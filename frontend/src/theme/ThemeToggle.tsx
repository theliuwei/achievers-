import type { CSSProperties } from 'react'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Space, Switch, Typography, theme } from 'antd'
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
        aria-label={isDark ? '当前为暗黑模式，切换为明亮' : '当前为明亮模式，切换为暗黑'}
      />
      <MoonOutlined
        style={{ color: isDark ? token.colorInfo : token.colorTextQuaternary }}
        aria-hidden
      />
      <Text type="secondary" style={labelStyle}>
        {isDark ? '暗黑' : '明亮'}
      </Text>
    </Space>
  )
}
