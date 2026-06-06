// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173, // Default Vite development port
//     host: true, // Exposes the server to your local network if needed
//   },
//   resolve: {
//     alias: {
//       // Allows clean relative imports if you want to use them later
//       '@': '/src',
//     },
//   },
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    port: 5173,
    host: true,
    
    // 🔥 Proxy configuration - This fixes your issue
    proxy: {
      '/api': {
        target: 'http://localhost:5000',     // ← CHANGE THIS to your backend port
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },

  resolve: {
    alias: {
      '@': '/src',
    },
  },
});