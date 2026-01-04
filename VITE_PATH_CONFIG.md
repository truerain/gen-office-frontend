# Vite Config 경로 설정 가이드

## 문제 상황

```typescript
// ❌ TypeScript 오류 발생
import path from 'path'
//     ^^^^ Cannot find name 'path'.ts(2304)
```

## 원인

`tsconfig.node.json`에 `verbatimModuleSyntax: true` 설정이 있을 때, CommonJS 스타일 import는 사용할 수 없습니다.

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": true,  // ← 엄격한 ESM 모드
    "types": ["node"]
  }
}
```

## 해결 방법

### ✅ 방법 1: ESM 네이티브 방식 (권장)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
    },
  },
})
```

**장점:**
- ✅ TypeScript 오류 없음
- ✅ ESM 표준 준수
- ✅ 미래 지향적 (Node.js 최신 표준)
- ✅ `verbatimModuleSyntax` 호환

### ✅ 방법 2: Type-only import

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type * as path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**단점:**
- ⚠️ `__dirname`이 ESM에서는 undefined
- ⚠️ 추가 polyfill 필요

### ❌ 방법 3: verbatimModuleSyntax 비활성화 (비추천)

```json
{
  "compilerOptions": {
    "verbatimModuleSyntax": false,  // ❌ 권장하지 않음
  }
}
```

**단점:**
- ❌ TypeScript의 엄격한 타입 체크 무력화
- ❌ 잠재적 런타임 오류 가능성

## ESM vs CommonJS

### CommonJS (구 방식)

```typescript
// CommonJS 스타일
import path from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

resolve: {
  alias: {
    '@': path.resolve(__dirname, './src')
  }
}
```

**문제점:**
- `__dirname`이 ESM에서 기본 제공되지 않음
- `verbatimModuleSyntax: true`와 충돌

### ESM (신 방식) ✅

```typescript
// ESM 네이티브 방식
import { fileURLToPath } from 'node:url'

resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url))
  }
}
```

**장점:**
- ESM 표준 준수
- 추가 설정 불필요
- TypeScript 완벽 호환

## 상세 설명

### `fileURLToPath`란?

```typescript
import { fileURLToPath } from 'node:url'

// URL 객체를 파일 시스템 경로로 변환
fileURLToPath(new URL('./src', import.meta.url))
// → /Users/username/project/apps/demo/src
```

### `import.meta.url`이란?

```typescript
// vite.config.ts의 위치
import.meta.url
// → file:///Users/username/project/apps/demo/vite.config.ts

// 현재 파일 기준 상대 경로
new URL('./src', import.meta.url)
// → file:///Users/username/project/apps/demo/src
```

### `new URL()`이란?

```javascript
// 기본 URL + 상대 경로 → 절대 URL
new URL('./src', 'file:///Users/username/project/apps/demo/vite.config.ts')
// → file:///Users/username/project/apps/demo/src
```

## 비교표

| 항목 | CommonJS | ESM |
|------|----------|-----|
| import 방식 | `import path from 'path'` | `import { fileURLToPath } from 'node:url'` |
| 경로 기준 | `__dirname` | `import.meta.url` |
| 경로 변환 | `path.resolve()` | `fileURLToPath(new URL())` |
| TypeScript 호환 | ⚠️ 설정 필요 | ✅ 완벽 호환 |
| 미래 지향성 | ❌ 레거시 | ✅ 표준 |

## 실전 예시

### 단일 alias

```typescript
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

### 다중 alias

```typescript
import { fileURLToPath } from 'node:url'

const resolve = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve('./src'),
      '@/components': resolve('./src/components'),
      '@/pages': resolve('./src/pages'),
      '@/store': resolve('./src/store'),
    },
  },
})
```

### 헬퍼 함수 활용

```typescript
import { fileURLToPath } from 'node:url'

function createAlias(paths: Record<string, string>) {
  return Object.entries(paths).reduce((acc, [key, path]) => {
    acc[key] = fileURLToPath(new URL(path, import.meta.url))
    return acc
  }, {} as Record<string, string>)
}

export default defineConfig({
  resolve: {
    alias: createAlias({
      '@': './src',
      '@/components': './src/components',
      '@/pages': './src/pages',
    }),
  },
})
```

## 트러블슈팅

### Q: `Cannot find module 'node:url'` 오류

**A:** Node.js 버전이 너무 낮습니다. Node.js 14.18.0 이상이 필요합니다.

```bash
node --version  # v18.0.0 이상 권장
```

### Q: `@types/node`가 없다는 오류

**A:** devDependencies에 추가하세요.

```bash
pnpm add -D @types/node
```

```json
{
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### Q: TypeScript에서 여전히 오류 발생

**A:** `tsconfig.node.json`을 확인하세요.

```json
{
  "compilerOptions": {
    "types": ["node"],  // ← 필수
    "module": "ESNext",
    "moduleResolution": "bundler"
  },
  "include": ["vite.config.ts"]  // ← 필수
}
```

### Q: 빌드 시 경로를 찾지 못함

**A:** alias가 제대로 설정되었는지 확인하세요.

```typescript
// 경로가 정확한지 확인
console.log(fileURLToPath(new URL('./src', import.meta.url)))
// → /Users/username/project/apps/demo/src
```

## 결론

### ✅ 권장 설정

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@/pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@/store': fileURLToPath(new URL('./src/store', import.meta.url)),
      '@/config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@/mocks': fileURLToPath(new URL('./src/mocks', import.meta.url)),
      '@/features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@/styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@/assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
    },
  },
})
```

**이유:**
- ✅ TypeScript 오류 없음
- ✅ ESM 표준 준수
- ✅ 미래 지향적
- ✅ `verbatimModuleSyntax` 호환
- ✅ Node.js 최신 버전 권장 사항

**이제 타입 오류 없이 절대 경로를 사용할 수 있습니다!** 🎉
