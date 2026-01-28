import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  
  build: {
    minify: 'terser', // Terser ka istemal karke JS minification
    terserOptions: {
      compress: {
        drop_console: true, // Production mein console logs ko hata de
        // Additional options to remove whitespace
        pure_funcs: ['console.log'], // Console log ko remove kare
      },
      format: {
        comments: false, // Comments ko remove kare
      },
      mangle: true, // Variable names ko shorten kare
      toplevel: true, // Top-level variable names ko bhi shorten kare
    },
    cssCodeSplit: true, // CSS ko alag file mein split kare
  },
});