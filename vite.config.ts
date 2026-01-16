import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Hỗ trợ cả API_KEY (GitHub Secrets) và GEMINI_API_KEY
  const geminiKey = env.API_KEY || env.GEMINI_API_KEY || process.env.API_KEY || process.env.GEMINI_API_KEY

  return {
    // Custom domain: dùng '/' thay vì '/repo-name/'
    base: '/',

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    plugins: [react()],

    define: {
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  }
})
