import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig({
  base: '/app',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString())
  },
  build: {
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
  }
})
