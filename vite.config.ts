import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/git-buddy-e0e620b0/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
