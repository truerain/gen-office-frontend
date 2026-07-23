# UI 구현 로그

## 2026-07-22

### TreeView 연결선 가로선 시작 위치 보정

- `connectorVariant=line`에서 가로선이 세로선보다 앞에서 시작하지 않도록 시작 위치를 세로선 위치에 맞췄습니다.
- 관련 파일: `packages/ui/src/core/Tree/Tree.module.css`

## 2026-07-22

### TreeView 고정 펼침 및 연결선 옵션 추가

- `Tree`/`TreeView`에 `expansionMode=fixed-expanded` 옵션을 추가해 노드별 펼침/접힘 버튼 없이 로드된 노드를 항상 펼칠 수 있게 했습니다.
- `connectorVariant=line` 옵션을 추가해 fixed expanded 모드에서 버튼 자리 대신 노드 연결선을 표시할 수 있게 했습니다.
- 기본값은 기존 collapsible 동작을 유지하도록 설정했습니다.
- Storybook에서 기본 접힘/펼침, 고정 펼침 연결선, 고정 펼침 무연결선 상태를 확인할 수 있는 스토리를 추가했습니다.
- 관련 파일: `packages/ui/src/core/Tree/Tree.types.ts`, `packages/ui/src/core/Tree/Tree.tsx`, `packages/ui/src/core/Tree/Tree.module.css`, `packages/ui/src/composed/TreeView/TreeView.tsx`, `packages/ui/src/composed/TreeView/TreeView.stories.tsx`

## 2026-07-07

### MaskedInput 컴포넌트 구현

- 고정 패턴 mask 입력을 위한 `MaskedInput` composed 컴포넌트를 추가했습니다.
- `0`, `A`, `*` 기본 토큰을 지원하는 경량 mask 엔진과 `onValueChange` API를 구현했습니다.
- Storybook 예제와 UI 패키지 export를 추가했습니다.
- 관련 파일: `packages/ui/src/composed/MaskedInput/*`, `packages/ui/src/index.ts`, `packages/ui/docs/implementation-log.md`

## 2026-07-05

### MaskedInput 구현 계획 문서 추가

- `packages/ui`에 mask 입력을 공통 컴포넌트로 추가하기 위한 계획 문서를 작성했습니다.
- 기존 `Input`에 mask prop을 직접 추가하지 않고 `composed/MaskedInput`으로 분리하는 방향을 기록했습니다.
- API 초안, mask 엔진 선택지, GenDataGrid 연계 방향, 테스트 계획을 정리했습니다.
- 관련 파일: `packages/ui/docs/masked-input-plan.md`, `packages/ui/docs/implementation-log.md`

## 2026-06-15

### 로그 관리 시작

- 패키지 구현 로그를 생성했습니다.
- 앞으로 이 패키지의 소스, API, 동작, 문서 변경 사항은 이 파일에 기록합니다.
