/// <reference types="vitest/config" />
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  server: {
    proxy: {
      '/sessions': { target: 'http://localhost:8000', changeOrigin: true },
      '/chat': { target: 'http://localhost:8000', changeOrigin: true },
      '/chat/stream': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
