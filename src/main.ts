import './assets/main.css'
import 'element-plus/dist/index.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { css as font_css1 } from '../public/font/Gotham-Medium.ttf'
document.body.style.fontFamily = `"${font_css1.family}"`

import { drag_transform_length, drag_transform_scale } from './utils/conf'
import { binStorage } from './utils/binstorage'
await binStorage.init()

const app = createApp(App)
app.use(router)
app.directive('drag', {
  mounted(el: HTMLElement, binding) {
    if (typeof binding.value != 'function')
      return
    const left = binding.modifiers.left || ! binding.modifiers.right
    let start_e: TouchEvent | MouseEvent | null = null
    let reach_peak = false
    const start = (e: TouchEvent | MouseEvent) => {
      if (e.target != el)
        return undefined
      start_e = e
      reach_peak = false
    }
    const f = (x: number, a: number = drag_transform_length, b: number = drag_transform_length) => {
      const k = b / (2 * (a ** 2 + a)),
        x1 = Math.abs(drag_transform_scale * x)
      return (k * x1 ** 2 + k * x1) * (x < 0 ? - 1 : 1)
    }
    const move = (e: TouchEvent | MouseEvent) => {
      if (! start_e)
        return
      const offset = f(
        (start_e as any).touches
          ? (e as TouchEvent).touches[0].clientX - (start_e as TouchEvent).touches[0].clientX
          : (e as MouseEvent).screenX - (start_e as MouseEvent).screenX
      )
      if (left ? offset >= 0 : offset <= 0)
        return
      const px = Math.min(
        Math.abs(offset),
        drag_transform_length
      )
      reach_peak = px >= drag_transform_length
      el.style.transform = `translateX(${left ? - px : px}px)`
    }
    const end = () => {
      if (start_e) {
        el.style.transform = ''
        if (reach_peak)
          binding.value(start_e)
        start_e = null
        reach_peak = false
      }
    }
    const conf: AddEventListenerOptions  = {
      passive: false
    }
    el.addEventListener('touchstart', start, conf)
    el.addEventListener('mousedown', start, conf)
    el.addEventListener('touchmove', move, conf)
    el.addEventListener('mousemove', move, conf)
    el.addEventListener('click', end, conf)
    el.addEventListener('touchend', end, conf)
    el.addEventListener('touchcancel', end, conf)
    el.addEventListener('mouseup', end, conf)
  }
})
app.mount('#app')
