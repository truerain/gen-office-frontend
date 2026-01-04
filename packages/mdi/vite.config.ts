// packages/mdi/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({ 
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GenOfficeMDI',
      formats: ['es'],
      fileName: 'index'
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime', 
        '@gen-office/primitives',
        '@gen-office/theme',
        '@gen-office/utils',
        '@gen-office/design-tokens',
        'lucide-react',
        'zustand'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          zustand: 'zustand'
        }
      }
    }
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
});