import { createI18n } from 'vue-i18n'

// Import translation files
import en from './locales/en.json'
import es from './locales/es.json'
import fr from './locales/fr.json'
import de from './locales/de.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'

// Supported languages configuration
export const supportedLanguages = {
  en: { name: 'English', flag: '🇺🇸', dir: 'ltr' },
  es: { name: 'Español', flag: '🇪🇸', dir: 'ltr' },
  fr: { name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  de: { name: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  ja: { name: '日本語', flag: '🇯🇵', dir: 'ltr' },
  zh: { name: '中文', flag: '🇨🇳', dir: 'ltr' }
}

// Detect user's preferred language
export const detectUserLanguage = () => {
  // Check localStorage first
  const saved = localStorage.getItem('user_language')
  if (saved && supportedLanguages[saved]) {
    return saved
  }
  
  // Check browser language
  const browserLang = navigator.language?.split('-')[0]
  if (browserLang && supportedLanguages[browserLang]) {
    return browserLang
  }
  
  // Default to English
  return 'en'
}

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: detectUserLanguage(),
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en,
    es,
    fr,
    de,
    ja,
    zh
  }
})

export default i18n