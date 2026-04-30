import { Button, Card, ColorPicker, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { THEME_PRESETS, useAppTheme } from '../../theme'

const { Title, Paragraph, Text } = Typography

const SettingsPage = () => {
  const { primaryColor, setPrimaryColor, resetPrimaryColor } = useAppTheme()
  const { t } = useTranslation('common')

  return (
    <div>
      <Title level={4} style={{ marginTop: 0 }}>
        {t('settings.title')}
      </Title>
      <Paragraph type="secondary">
        {t('settings.description')}
        <Text code>VITE_THEME_PRIMARY</Text> {t('settings.descriptionSuffix')}
      </Paragraph>
      <Card title={t('settings.themeColor')} size="small" style={{ maxWidth: 640 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
              {t('settings.colorPicker')}
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
              {t('settings.quickPresets')}
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
            <Button onClick={resetPrimaryColor}>{t('settings.resetDefaultColor')}</Button>
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default SettingsPage
