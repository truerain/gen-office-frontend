import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    dts({ insertTypesEntry: true }) // TypeScript 타입을 추출하여 dist에 생성
  ],
  build: {
    lib: {
      // 진입점 파일 설정
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'GenOfficeTheme',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      // 외부에서 제공될 라이브러리는 번들에 포함하지 않음
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime', 
        '@gen-office/design-tokens'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        },
        assetFileNames: (assetInfo) => {
          // Vite lib build에서 CSS가 style.css로 떨어지는 경우가 많아서 index.css로 고정
          if(assetInfo.name === 'style.css') return 'index.css';
          return assetInfo.name ?? '[name][extname]';
        }
      }
    }
  }
});