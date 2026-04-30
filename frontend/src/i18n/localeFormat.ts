import type { SupportedLanguage } from './index'

export type SupportedCurrency =
  | 'USD'
  | 'CNY'
  | 'EUR'
  | 'RUB'
  | 'IDR'
  | 'VND'
  | 'THB'
  | 'PHP'
  | 'PLN'
  | 'GBP'

const intlLocaleByLanguage: Record<SupportedLanguage, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  id: 'id-ID',
  vi: 'vi-VN',
  ru: 'ru-RU',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES',
  it: 'it-IT',
  pt: 'pt-PT',
  pl: 'pl-PL',
  nl: 'nl-NL',
  th: 'th-TH',
}

const isDateInputEmpty = (input: Date | string | number | null | undefined) =>
  input === null || input === undefined || input === ''

const normalizeDateInput = (input: Date | string | number): Date => {
  if (input instanceof Date) {
    return input
  }
  return new Date(input)
}

const datePatternByLanguage: Record<SupportedLanguage, 'mdy' | 'zh' | 'dmyDot' | 'dmySlash'> = {
  en: 'mdy',
  zh: 'zh',
  ru: 'dmyDot',
  de: 'dmyDot',
  fr: 'dmyDot',
  it: 'dmyDot',
  nl: 'dmyDot',
  pl: 'dmyDot',
  es: 'dmySlash',
  pt: 'dmySlash',
  vi: 'dmySlash',
  id: 'dmySlash',
  th: 'dmySlash',
}

const pad2 = (value: number) => String(value).padStart(2, '0')

const renderDateByPattern = (date: Date, pattern: 'mdy' | 'zh' | 'dmyDot' | 'dmySlash') => {
  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())

  if (pattern === 'zh') return `${year}年${month}月${day}日`
  if (pattern === 'mdy') return `${month}/${day}/${year}`
  if (pattern === 'dmyDot') return `${day}.${month}.${year}`
  return `${day}/${month}/${year}`
}

const toSafeNumber = (value: number | string) => {
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export const resolveSupportedLanguage = (language: string): SupportedLanguage => {
  const normalized = language.toLowerCase()
  if (normalized.startsWith('zh')) return 'zh'
  if (normalized.startsWith('id')) return 'id'
  if (normalized.startsWith('vi')) return 'vi'
  if (normalized.startsWith('ru')) return 'ru'
  if (normalized.startsWith('de')) return 'de'
  if (normalized.startsWith('fr')) return 'fr'
  if (normalized.startsWith('es')) return 'es'
  if (normalized.startsWith('it')) return 'it'
  if (normalized.startsWith('pt')) return 'pt'
  if (normalized.startsWith('pl')) return 'pl'
  if (normalized.startsWith('nl')) return 'nl'
  if (normalized.startsWith('th')) return 'th'
  return 'en'
}

export const resolveIntlLocale = (language: string) =>
  intlLocaleByLanguage[resolveSupportedLanguage(language)]

export const formatLocalizedDate = (
  input: Date | string | number | null | undefined,
  language: string,
): string => {
  if (isDateInputEmpty(input)) return ''
  const date = normalizeDateInput(input as Date | string | number)
  if (Number.isNaN(date.getTime())) return ''
  const supportedLanguage = resolveSupportedLanguage(language)
  return renderDateByPattern(date, datePatternByLanguage[supportedLanguage])
}

export const formatLocalizedNumber = (
  value: number | string,
  language: string,
  options?: Intl.NumberFormatOptions,
): string => {
  return new Intl.NumberFormat(resolveIntlLocale(language), options).format(toSafeNumber(value))
}

export const formatLocalizedCurrency = (
  value: number | string,
  currency: SupportedCurrency,
  language: string,
  options?: Omit<Intl.NumberFormatOptions, 'style' | 'currency'>,
): string => {
  return new Intl.NumberFormat(resolveIntlLocale(language), {
    style: 'currency',
    currency,
    ...options,
  }).format(toSafeNumber(value))
}
