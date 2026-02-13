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
    },
  },
  build: {
    rollupOptions: {
      external: [], // Evite externalizar bibliotecas que podem precisar de websockets
    },
  },
})