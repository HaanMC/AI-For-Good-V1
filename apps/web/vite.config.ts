import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  if (command === 'build') {
    // eslint-disable-next-line no-console
    console.info(
      `[build] VITE_API_BASE_URL=${process.env.VITE_API_BASE_URL ?? '(missing)'}`
    )
  }

  return {
    // Custom domain: dùng '/' thay vì '/repo-name/'
    base: '/',

    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': 'http://localhost:8080',
      },
    },

    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  }
})
