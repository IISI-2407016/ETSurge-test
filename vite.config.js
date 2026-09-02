import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import pkg from './package.json' with { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  base: '/app',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    }
  },
    server: {
      port: 8906,
      open: true
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
    // e2e/ 目錄為 Playwright 專用測試（npm run test:e2e），排除避免 Vitest 誤收集
    exclude: ['**/node_modules/**', '**/e2e/**'],
  }
})
