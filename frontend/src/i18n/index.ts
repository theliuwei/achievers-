import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import deCommon from '../../locales/de/common.json'
import enCommon from '../../locales/en/common.json'
import esCommon from '../../locales/es/common.json'
import frCommon from '../../locales/fr/common.json'
import idCommon from '../../locales/id/common.json'
import itCommon from '../../locales/it/common.json'
import nlCommon from '../../locales/nl/common.json'
import plCommon from '../../locales/pl/common.json'
import ptCommon from '../../locales/pt/common.json'
import ruCommon from '../../locales/ru/common.json'
import thCommon from '../../locales/th/common.json'
import viCommon from '../../locales/vi/common.json'
import zhCommon from '../../locales/zh/common.json'

export const supportedLanguages = [
  'en',
  'zh',
  'id',
  'vi',
  'ru',
  'de',
  'fr',
  'es',
  'it',
  'pt',
  'pl',
  'nl',
  'th',
] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

const resources = {
  en: {
    common: enCommon,
  },
  zh: {
    common: zhCommon,
  },
  id: {
    common: idCommon,
  },
  vi: {
    common: viCommon,
  },
  ru: {
    common: ruCommon,
  },
  de: {
    common: deCommon,
  },
  fr: {
    common: frCommon,
  },
  es: {
    common: esCommon,
  },
  it: {
    common: itCommon,
  },
  pt: {
    common: ptCommon,
  },
  pl: {
    common: plCommon,
  },
  nl: {
    common: nlCommon,
  },
  th: {
    common: thCommon,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common'],
    supportedLngs: [...supportedLanguages],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'querystring', 'navigator'],
      lookupQuerystring: 'lng',
      lookupLocalStorage: 'app-language',
      caches: ['localStorage'],
    },
  })

export default i18n
