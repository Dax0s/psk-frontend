import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

const savedLanguage = localStorage.getItem('i18nextLng') || 'lt'

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: savedLanguage,
    load: 'currentOnly',
    fallbackLng: {
      default: ['lt'],
    },
    debug: import.meta.env.MODE === 'development',
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
  })

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng)
})

export default i18n
