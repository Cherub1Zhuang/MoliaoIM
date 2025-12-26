import { resolve } from 'path'
import path from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vitePluginSvgsIcons from 'vite-plugin-svgs-icons'
export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      tailwindcss(),
      vueDevTools(),
      vitePluginSvgsIcons({
        dir: path.resolve(__dirname, 'src', 'renderer', 'src', 'assets', 'icons')
      })
    ],
    // vite.config.js
    server: {
      proxy: {
        '/api': {
          target: 'http://47.121.185.229:8888',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
