import { defineConfig } from 'vite'
import react from '@vitejs/git-buddy-e0e620b0'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/dash-react/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
