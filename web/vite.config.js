import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Mọi request /api/* được chuyển tiếp sang server Node chạy ở cổng 3000
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
