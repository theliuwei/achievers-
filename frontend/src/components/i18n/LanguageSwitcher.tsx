import { GlobalOutlined } from '@ant-design/icons'
import { Select, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import type { SupportedLanguage } from '../../i18n'
import { supportedLanguages } from '../../i18n'

const toOption = (value: SupportedLanguage, t: (key: string) => string) => ({
  value,
  label: t(`languages.${value}`),
})

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation('common')
  const current = (supportedLanguages.find((lng) => i18n.resolvedLanguage?.startsWith(lng)) ??
    'en') as SupportedLanguage

  return (
    <Space size={6}>
      <GlobalOutlined />
      <Typography.Text>{t('language')}</Typography.Text>
      <Select<SupportedLanguage>
        size="small"
        value={current}
        style={{ width: 132 }}
        options={supportedLanguages.map((lng) => toOption(lng, t))}
        onChange={(nextLang) => {
          void i18n.changeLanguage(nextLang)
        }}
      />
    </Space>
  )
}
