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
      name: 'GenOfficeUtils',
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      // 외부에서 제공될 라이브러리는 번들에 포함하지 않음
      external: ['react', 'react-dom', 'react/jsx-runtime'], 
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime'
        }
      }
    }
  }
});