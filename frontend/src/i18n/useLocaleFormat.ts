import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  formatLocalizedCurrency,
  formatLocalizedDate,
  formatLocalizedNumber,
  resolveIntlLocale,
  resolveSupportedLanguage,
  type SupportedCurrency,
} from './localeFormat'

export const useLocaleFormat = () => {
  const { i18n } = useTranslation()
  const language = i18n.resolvedLanguage || i18n.language

  return useMemo(
    () => ({
      language: resolveSupportedLanguage(language),
      intlLocale: resolveIntlLocale(language),
      formatDate: (input: Date | string | number | null | undefined) =>
        formatLocalizedDate(input, language),
      formatNumber: (value: number | string, options?: Intl.NumberFormatOptions) =>
        formatLocalizedNumber(value, language, options),
      formatCurrency: (
        value: number | string,
        currency: SupportedCurrency,
        options?: Omit<Intl.NumberFormatOptions, 'style' | 'currency'>,
      ) => formatLocalizedCurrency(value, currency, language, options),
    }),
    [language],
  )
}
