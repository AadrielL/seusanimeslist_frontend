import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || 'http://localhost:8081';

  const proxyConfig = {
    '/api': {
      target: apiUrl,
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  };

  if (mode === 'production') {
    // Em produção, o proxy não é usado, então a URL do backend será o valor da VITE_API_URL
    return defineConfig({
      plugins: [react()],
      build: {
        outDir: 'dist',
      },
      // Adicione a URL do backend como uma constante global para o frontend
      define: {
        'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      },
    });
  }

  // Em desenvolvimento, use a configuração de proxy
  return defineConfig({
    plugins: [react()],
    root: './',
    build: {
      outDir: 'dist',
    },
    server: {
      proxy: proxyConfig,
    },
  });
};