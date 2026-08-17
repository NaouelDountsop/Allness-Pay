import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    // La logique de session manipule `sessionStorage` et `window.location` :
    // elle a besoin d'un environnement navigateur.
    environment: 'jsdom',
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // Decoupage manuel : les bibliotheques stables restent en cache dans le
        // navigateur et ne sont pas retelechargees a chaque livraison.
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
        },
      },
    },
  },
});
