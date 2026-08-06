# @gen-office/debug

페이지·컴포넌트에서 **상태 확인**과 **리렌더 확인**을 위한 얇은 DEV 지향 훅 패키지입니다.

## 설치

모노레포 workspace:

```json
"@gen-office/debug": "workspace:*"
```

## API

```ts
import {
  useDebugState,
  useRenderCount,
  useWhyRender,
} from '@gen-office/debug';

// 기존 값 관찰 (useState 대체 아님)
useDebugState('Primitives.inputValue', inputValue);

// 렌더 횟수 (Strict Mode에서는 DEV에서 더 크게 보일 수 있음)
const renders = useRenderCount('PrimitivesPage', { log: true });

// shallow deps 변화 힌트
useWhyRender('PrimitivesPage', { inputValue, checked });
```

`enabled`를 생략하면 Vite `import.meta.env`를 읽으려 시도합니다.  
앱에서 쓰는 권장 패턴:

```ts
useDebugState('x', value, { enabled: import.meta.env.DEV });
```

개발 서버에서는 `package.json`의 `development` export로 소스가 해석됩니다. 빌드된 `dist`만 쓰면 Vite가 `DEV`를 인라인할 수 있으니, 위처럼 앱에서 `enabled`를 넘기는 편이 안전합니다.
## 범위 밖

Dialog UI, 데이터셋 DataGrid 뷰어, 그리드 CRUD 내부 디버그 등은  
[docs/debug/debug-tooling-backlog.md](../../docs/debug/debug-tooling-backlog.md)를 참고합니다.
