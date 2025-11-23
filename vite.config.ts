import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Stringify the API key so it is replaced as a string literal in the client code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env as an empty object for libraries that might access it directly
      // This prevents "process is not defined" errors while still allowing the specific key replacement above
      'process.env': {},
    },
    server: {
      port: 3000,
      open: true,
    },
  };
});