import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Listen on all interfaces so cloud previews (CodeSandbox etc.) detect the port,
    // and allow their remote hosts (Vite 5.4+ blocks non-localhost hosts otherwise).
    host: true,
    allowedHosts: true,
  },
});
