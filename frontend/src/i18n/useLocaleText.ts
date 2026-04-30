import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { translateLegacyText } from './legacyTextMap'

export const useLocaleText = () => {
  const { i18n } = useTranslation()

  return useCallback(
    (value?: string | null) => {
      if (typeof value !== 'string') return value ?? ''
      return translateLegacyText(value, i18n.resolvedLanguage || i18n.language)
    },
    [i18n.language, i18n.resolvedLanguage],
  )
}
