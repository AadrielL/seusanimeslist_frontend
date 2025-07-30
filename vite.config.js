import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Todas as requisições que começam com '/api' serão redirecionadas para http://localhost:8081
      '/api': {
        target: 'http://localhost:8081', // A porta do seu backend Spring Boot
        changeOrigin: true, // Necessário para reescrever o host de origem
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove o '/api' da URL ao enviar para o backend
      },
    },
  },
});