import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(rootDir, '..');

/** Lightweight dev server for the 3D pack ring (native WebView + local testing). */
export default defineConfig({
  root: rootDir,
  publicDir: path.join(appRoot, 'public'),
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PACK_RING_PORT ?? 3000),
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.join(appRoot, 'src'),
    },
  },
  optimizeDeps: {
    include: ['three', '@react-three/fiber', '@react-three/drei', 'gsap'],
  },
});
