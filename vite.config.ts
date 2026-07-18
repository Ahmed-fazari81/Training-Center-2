import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// ملاحظة: base يطابق اسم المستودع على GitHub Pages.
// عند تغيير اسم المستودع، حدّث هذا المسار ليطابق: /<repo-name>/
// إذا كان النشر على نطاق جذر المستخدم (user.github.io)، استخدم base: '/'
export default defineConfig({
  base: '/Training-Center-2/',
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
