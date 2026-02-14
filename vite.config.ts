
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  // 将根目录设为公共资源目录，以便 ylyt.png 能在预览和部署中被直接作为静态资源访问
  publicDir: '.' 
});
