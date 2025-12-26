import './assets/main.css'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import svgIcon from 'virtual:svg-icon'
import router from './router'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import i18n from './i18n'
import VueVirtualScroller from 'vue-virtual-scroller'


const app = createApp(App)
app.component('Icon', svgIcon)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(VueVirtualScroller)
app.mount('#app')
