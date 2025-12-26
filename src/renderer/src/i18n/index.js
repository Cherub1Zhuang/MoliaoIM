import { createI18n } from 'vue-i18n'
import zh from './langs/zh.json'
import en from './langs/en.json'
const messages = {
  zh,
  en
}
const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'zh',
  fallbackLocale: 'en',
  messages
})
export default i18n
