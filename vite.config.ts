import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/admin': 'http://localhost:3000',
      '/socket.io': {
        target: 'ws://localhost:3000',
        ws: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
