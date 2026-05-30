import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode, command}) => {
  const env = loadEnv(mode, '.', '');
  // Prefer a real environment variable (e.g. the GEMINI_API_KEY secret in CI),
  // falling back to a value from a local .env file for dev.
  const geminiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
  return {
    // Relative paths so the build works under a GitHub Pages subpath
    // (e.g. /GoogleDeepMind/) while dev keeps serving from root.
    base: command === 'build' ? './' : '/',
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
