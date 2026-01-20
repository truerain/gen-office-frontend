// packages/datagrid/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { fileURLToPath } from 'node:url' 

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
      name: 'GenOfficeCrudgrid',
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
        '@gen-office/ui',
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
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),  // ✅ ESM 방식
    }
  }
});