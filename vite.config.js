import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'src/renderer',
  base: './', // Electron load qua file:// nên mọi đường dẫn phải tương đối
  plugins: [react()],
  build: {
    outDir: '../../dist-renderer',
    emptyOutDir: true,
  },
});
