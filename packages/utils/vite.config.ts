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
      // Keep runtime deps external (no React in this package)
      external: ['clsx']
    }
  }
});