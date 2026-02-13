import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://api.treinavaga.tech http://localhost:8081 https://accounts.google.com https://github.com; frame-src https://www.youtube.com; frame-ancestors 'none';",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        secure: false,
        ws: true, // Habilita proxy de websockets
      },
      '/socket.io': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  preview: {
    allowedHosts: [
      'app.treinavaga.tech',
      '.treinavaga.tech',
      'localhost'
    ],
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; connect-src 'self' https://api.treinavaga.tech https://accounts.google.com https://github.com; frame-src https://www.youtube.com; frame-ancestors 'none';",
    },
  },
  build: {
    rollupOptions: {
      external: [], // Evite externalizar bibliotecas que podem precisar de websockets
    },
  },
})