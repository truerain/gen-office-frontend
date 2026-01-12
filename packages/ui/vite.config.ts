// packages/primitive/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({ 
      insertTypesEntry: true
     }) // TypeScript 타입을 추출하여 dist에 생성
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GenOfficePrimitives',
      formats: ['es'],
      fileName: 'index'
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime', 
        '@radix-ui/react-slot',
        '@gen-office/theme',
        '@gen-office/utils',
       'lucide-react'
       ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        },
        assetFileNames: (assetInfo) => {
          // Vite lib build에서 CSS가 style.css로 떨어지는 경우 index.css로 고정
          if (assetInfo.name === 'style.css') return 'index.css'
          return assetInfo.name ?? '[name][extname]'
        },
      }
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
});