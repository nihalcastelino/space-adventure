import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: false, // Allow port to auto-increment if 5174 is taken
    host: 'localhost', // Explicitly set host
    hmr: {
      // Use same port for HMR
      protocol: 'ws',
      host: 'localhost'
      // Port will automatically match server port
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

