// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Adicione a configuração de 'root' e 'build' para garantir que o build funcione
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      // Esta configuração é apenas para desenvolvimento local
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});