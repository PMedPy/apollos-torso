import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import type { Language } from '../db/model'
import de from './de'
import en from './en'

/** Sprache des Geräts als Startwert, bis eine Einstellung gespeichert ist. */
export function deviceLanguage(): Language {
  return navigator.language?.toLowerCase().startsWith('de') ? 'de' : 'en'
}

void i18n.use(initReactI18next).init({
  resources: { de: { translation: de }, en: { translation: en } },
  lng: deviceLanguage(),
  fallbackLng: 'de',
  interpolation: { escapeValue: false },
})

export default i18n
