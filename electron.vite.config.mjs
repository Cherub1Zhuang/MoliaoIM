import { resolve } from 'path'
import path from 'path'
import { defineConfig } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vitePluginSvgsIcons from 'vite-plugin-svgs-icons'
import Components from 'unplugin-vue-components/vite'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
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
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false // css in js
          })
        ]
      })
    ],
    // vite.config.js
    server: {
      proxy: {
        '/api': {
          target: 'http://47.121.185.229:8888',
          // target: 'https://3yn85bg65540.vicp.fun',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
