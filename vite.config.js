import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: false, // Allow port to auto-increment if 3000 is taken
    host: 'localhost', // Explicitly set host
    hmr: {
      // Don't specify port - Vite will automatically use the same port as the server
      // This handles auto-increment (3000 -> 3001) automatically
      protocol: 'ws',
      host: 'localhost',
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom']
        }
      }
    }
  }
});

