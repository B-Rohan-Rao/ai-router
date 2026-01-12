import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Hardcoded backend URL
const BACKEND_URL = 'http://44.223.69.157:3001';

console.log('🔧 Vite Config - Backend URL:', BACKEND_URL);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
});
