import { Button, Card, ColorPicker, Space, Typography } from 'antd'
import { THEME_PRESETS, useAppTheme } from '../../theme'

const { Title, Paragraph, Text } = Typography

const SettingsPage = () => {
  const { primaryColor, setPrimaryColor, resetPrimaryColor } = useAppTheme()

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>
        系统设置
      </Title>
      <Paragraph type="secondary">
        选择界面主色，将同步到 Ant Design 与顶部导航等自定义样式。预设来自经典配色，重置后恢复为构建环境变量
        <Text code>VITE_THEME_PRIMARY</Text> 所设默认值。
      </Paragraph>
      <Card title="主题色" size="small" style={{ maxWidth: 640 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              取色器
            </Text>
            <ColorPicker
              format="hex"
              value={primaryColor}
              showText
              onChange={(color) => {
                setPrimaryColor(color.toHexString())
              }}
            />
          </div>
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              快速预设
            </Text>
            <Space wrap>
              {THEME_PRESETS.map((p) => (
                <Button
                  key={p.value}
                  size="small"
                  onClick={() => {
                    setPrimaryColor(p.value)
                  }}
                >
                  {p.label}
                </Button>
              ))}
            </Space>
          </div>
          <div>
            <Button onClick={resetPrimaryColor}>恢复默认主色</Button>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default SettingsPage
