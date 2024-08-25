import './assets/main.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { css as font_css1 } from '../public/font/Gotham-Medium.ttf'
document.body.style.fontFamily = `"${font_css1.family}"`

import { binStorage } from './utils/binstorage'
await binStorage.init()

const app = createApp(App)
app.use(router)
app.mount('#app')
