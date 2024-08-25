import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Font from 'vite-plugin-font'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    Font.vite({
      scanFiles: ['src/**/*.{vue,ts,tsx,js,jsx}']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: 'Lookim',
        short_name: 'Lookim',
        description: 'A cool app made for Lookim.',
        theme_color: '#ffffff',
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({url}) => url.host == location.host,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'default-cache',
            }
          },
        ],
        cleanupOutdatedCaches: false,
        skipWaiting: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },

      selfDestroying: false,
    })
  ],
})
