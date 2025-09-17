import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // --- تمت إضافة هذا القسم لإجبار Vite على معالجة SCSS ---
  css: {
    preprocessorOptions: {
      scss: {
        // يمكنك إضافة إعدادات إضافية هنا في المستقبل إذا احتجت
      },
    },
  },
})

