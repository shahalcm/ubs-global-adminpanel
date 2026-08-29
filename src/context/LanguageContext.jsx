import React, { createContext, useContext, useState, useEffect } from 'react'

export const RTL_LANGUAGES = ['ar', 'ur', 'fa', 'he']

export const LANGUAGE_OPTIONS = [
  { code: 'en', flag: '🇬🇧', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', flag: '🇸🇦', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'hi', flag: '🇮🇳', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
  { code: 'ml', flag: '🇮🇳', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr' },
  { code: 'fr', flag: '🇫🇷', name: 'French', nativeName: 'Français', dir: 'ltr' },
  { code: 'es', flag: '🇪🇸', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
  { code: 'de', flag: '🇩🇪', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'zh', flag: '🇨🇳', name: 'Chinese', nativeName: '中文', dir: 'ltr' },
  { code: 'ja', flag: '🇯🇵', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
  { code: 'ur', flag: '🇵🇰', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'tr', flag: '🇹🇷', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
  { code: 'ru', flag: '🇷🇺', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
  { code: 'ko', flag: '🇰🇷', name: 'Korean', nativeName: '한국어', dir: 'ltr' },
  { code: 'pt', flag: '🇵🇹', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
  { code: 'it', flag: '🇮🇹', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
  { code: 'nl', flag: '🇳🇱', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
  { code: 'bn', flag: '🇧🇩', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
  { code: 'ta', flag: '🇮🇳', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
  { code: 'te', flag: '🇮🇳', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
  { code: 'kn', flag: '🇮🇳', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr' },
  { code: 'mr', flag: '🇮🇳', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
  { code: 'gu', flag: '🇮🇳', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
  { code: 'pa', flag: '🇮🇳', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
  { code: 'id', flag: '🇮🇩', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
  { code: 'th', flag: '🇹🇭', name: 'Thai', nativeName: 'ไทย', dir: 'ltr' },
  { code: 'vi', flag: '🇻🇳', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
  { code: 'pl', flag: '🇵🇱', name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
  { code: 'sv', flag: '🇸🇪', name: 'Swedish', nativeName: 'Svenska', dir: 'ltr' },
  { code: 'no', flag: '🇳🇴', name: 'Norwegian', nativeName: 'Norsk', dir: 'ltr' },
  { code: 'da', flag: '🇩🇰', name: 'Danish', nativeName: 'Dansk', dir: 'ltr' },
  { code: 'fi', flag: '🇫🇮', name: 'Finnish', nativeName: 'Suomi', dir: 'ltr' },
  { code: 'el', flag: '🇬🇷', name: 'Greek', nativeName: 'Ελληνικά', dir: 'ltr' },
  { code: 'he', flag: '🇮🇱', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
  { code: 'fa', flag: '🇮🇷', name: 'Persian', nativeName: 'فارسی', dir: 'rtl' },
]

const LanguageContext = createContext(null)

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')
  const [translations, setTranslations] = useState({})
  const [loading, setLoading] = useState(true)

  const isRTL = RTL_LANGUAGES.includes(language)

  const loadTranslations = async (langCode) => {
    try {
      const module = await import(`../locales/${langCode}.json`)
      setTranslations(module.default || module)
    } catch (error) {
      console.warn(`Could not load locale ${langCode}, falling back to en:`, error)
      try {
        const fallback = await import('../locales/en.json')
        setTranslations(fallback.default || fallback)
      } catch (err) {
        setTranslations({})
      }
    }
  }

  useEffect(() => {
    const savedLang = localStorage.getItem('ubs_admin_language') || 'en'
    setLanguage(savedLang)
    loadTranslations(savedLang).finally(() => setLoading(false))

    if (typeof document !== 'undefined') {
      document.documentElement.dir = RTL_LANGUAGES.includes(savedLang) ? 'rtl' : 'ltr'
      document.documentElement.lang = savedLang
    }
  }, [])

  const changeLanguage = async (langCode) => {
    setLoading(true)
    setLanguage(langCode)
    localStorage.setItem('ubs_admin_language', langCode)

    if (typeof document !== 'undefined') {
      document.documentElement.dir = RTL_LANGUAGES.includes(langCode) ? 'rtl' : 'ltr'
      document.documentElement.lang = langCode
    }

    await loadTranslations(langCode)
    setLoading(false)
  }

  const t = (key) => {
    if (!key) return ''
    const trimmed = String(key).trim()
    if (!trimmed) return key
    return translations[trimmed] || key
  }

  return (
    <LanguageContext.Provider value={{ language, isRTL, t, changeLanguage, loading, languages: LANGUAGE_OPTIONS }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useTranslation = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
}
