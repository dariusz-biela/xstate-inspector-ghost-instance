import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow remote preview hosts (CodeSandbox *.csb.app, etc.) to reach the dev server.
    // Vite 5.4+ otherwise blocks any non-localhost host via server.allowedHosts.
    allowedHosts: true,
  },
});
