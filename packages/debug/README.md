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

useDebugState('Primitives.inputValue', inputValue, {
  enabled: import.meta.env.DEV,
});

const renders = useRenderCount('PrimitivesPage', {
  enabled: import.meta.env.DEV,
  log: true,
});

useWhyRender('PrimitivesPage', { inputValue, checked }, {
  enabled: import.meta.env.DEV,
});
```

`enabled`를 생략하면 Vite `import.meta.env`를 읽습니다. env를 해석할 수 없으면 **기본은 `false`(꺼짐)** 입니다.  
앱에서 빌드 모드별로 제어하려면 `VITE_DEBUG` 등을 두고 넘기면 됩니다.

```ts
enabled: import.meta.env.VITE_DEBUG === 'true'
```

개발 시 `package.json`의 `development` export로 소스가 해석될 수 있습니다. 빌드된 `dist`만 쓰면 `DEV`가 인라인될 수 있으니, 앱에서 `enabled`를 명시하는 편이 안전합니다.

## 범위 밖

Dialog UI, 데이터셋 DataGrid 뷰어, 그리드 CRUD 내부 디버그 등은  
[docs/debug/debug-tooling-backlog.md](../../docs/debug/debug-tooling-backlog.md)를 참고합니다.
