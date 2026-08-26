# UI 구현 로그

## 2026-08-26

### Dialog Missing Description 경고 수정

- `AlertDialog`는 `message`를 `DialogDescription`으로 연결하고, 없을 때는 `aria-describedby={undefined}`로 경고를 끈다.
- `ModalInput`도 `modalDescription`이 있으면 Description, 없으면 opt-out 한다.
- 관련 파일: `src/composed/AlertDialog/AlertDialog.tsx`, `src/composed/ModalInput/ModalInput.tsx`, `src/core/Dialog/Dialog.stories.tsx`

## 2026-08-17

### SplitLayout 퍼센트 leftWidth 초기값 수정

- `resizable`일 때 `"42%"` 같은 문자열을 숨은 컨테이너(width 0)에서 px로 바꾸면 0으로 고정됐다. 측정 전에는 CSS 값을 유지하고, 크기가 생긴 뒤에만 ResizeObserver로 한 번 px 변환한다.
- 관련 파일: `packages/ui/src/composed/SplitLayout/SplitLayout.tsx`, `SplitLayout.types.ts`

## 2026-07-27

### formatSummary Storybook 샘플 추가

- `MultiDateFormatSummary`, `MultiMonthFormatSummary`를 각각 `MultiDatePicker`/`MultiMonthPicker` props 기준으로 스토리 타입을 잡아 Controls에 `formatSummary` 프리셋 select와 `summaryThreshold`가 보이도록 했습니다.
- 관련 파일: `packages/ui/src/composed/DatePicker/DatePicker.stories.tsx`

## 2026-07-27

### Multi 선택 오버플로 라벨을 `+N more`로 변경

- 임계값 초과 시 필드 표시를 `N selected`에서 `{첫 항목} +{N} more`로 바꿨습니다. locale과 무관하게 동일 문구를 쓰고, `formatSummary(firstLabel, restCount)`로 커스텀할 수 있습니다.
- 관련 파일: `packages/ui/src/composed/DatePicker/multiSelectionDisplay.ts`, `packages/ui/src/composed/DatePicker/MultiDatePicker.types.ts`, `packages/ui/src/composed/DatePicker/MultiMonthPicker.types.ts`

## 2026-07-27

### MultiDate/MultiMonth 필드 라벨 임계값 요약

- 선택 수가 `summaryThreshold`(기본 2)를 넘으면 필드에 `N selected` 요약을 표시하고, `title`에 전체 목록을 넣어 hover로 상세를 확인하도록 바꿨습니다.
- `format`은 목록/`title` 항목 포맷에, `formatSummary`는 요약 문구 커스텀에 사용합니다. 공통 헬퍼 `multiSelectionDisplay.ts`를 추가했습니다.
- 관련 파일: `packages/ui/src/composed/DatePicker/multiSelectionDisplay.ts`, `packages/ui/src/composed/DatePicker/MultiDatePicker.tsx`, `packages/ui/src/composed/DatePicker/MultiDatePicker.types.ts`, `packages/ui/src/composed/DatePicker/MultiMonthPicker.tsx`, `packages/ui/src/composed/DatePicker/MultiMonthPicker.types.ts`

## 2026-07-27

### MultiDatePicker 추가

- 비연속 다중 일자 선택용 `MultiDatePicker`를 추가했습니다. Calendar `mode=multiple`로 토글한 뒤 확인으로 확정하고 Clear로 draft를 비울 수 있습니다.
- 빈 선택은 `undefined`로 전달하며, 일 단위 정규화·중복 제거·정렬을 적용합니다. 패널 수는 `calendarProps.numberOfMonths`로 제어합니다.
- Storybook(`MultiDate`, `MultiDateTwoMonths`)과 demo DatePicker 페이지에 예시를 추가했습니다.
- 관련 파일: `packages/ui/src/composed/DatePicker/MultiDatePicker.tsx`, `packages/ui/src/composed/DatePicker/MultiDatePicker.types.ts`, `packages/ui/src/composed/DatePicker/index.ts`, `packages/ui/src/composed/DatePicker/DatePicker.stories.tsx`, `apps/demo/src/pages/demo/datepicker/DatePickerDemoPage.tsx`

## 2026-07-24

### MultiMonthPicker 2년 헤더 1줄 정리

- `visibleYears=2`일 때 연도 범위 타이틀과 패널별 연도 라벨 중복을 제거하고, Prev/Next 사이에 각 연도를 나란히 표시하도록 바꿨습니다.
- 관련 파일: `packages/ui/src/composed/DatePicker/MultiMonthPicker.tsx`, `packages/ui/src/composed/DatePicker/DatePicker.module.css`

## 2026-07-24

### MultiMonthPicker 추가

- 비연속 다중 월 선택용 `MultiMonthPicker`를 추가했습니다. 월 토글 후 확인으로 확정하고 Clear로 draft를 비울 수 있습니다.
- `visibleYears` 옵션(1|2, 기본 1)으로 팝오버에 1년 또는 연속 2년 패널을 표시합니다.
- Storybook(`MultiMonth`, `MultiMonthTwoYears`)과 demo DatePicker 페이지에 예시를 추가했습니다.
- 관련 파일: `packages/ui/src/composed/DatePicker/MultiMonthPicker.tsx`, `packages/ui/src/composed/DatePicker/MultiMonthPicker.types.ts`, `packages/ui/src/composed/DatePicker/DatePicker.module.css`, `packages/ui/src/composed/DatePicker/index.ts`, `packages/ui/src/composed/DatePicker/DatePicker.stories.tsx`, `apps/demo/src/pages/demo/datepicker/DatePickerDemoPage.tsx`

## 2026-07-24

### DatePicker Storybook 스토리 추가

- `DatePicker`, `RangeDatePicker`, `MonthPicker`, `RangeMonthPicker` 사용 예시를 Storybook에 추가했습니다.
- 관련 파일: `packages/ui/src/composed/DatePicker/DatePicker.stories.tsx`

## 2026-07-24

### TreeView Refresh 버튼 옵션 추가

- 헤더에 Refresh 버튼을 선택적으로 표시할 수 있도록 `showRefresh` / `onRefresh` props를 추가했습니다.
- 기본값은 `showRefresh=false`이며, `onRefresh`가 있을 때만 버튼을 렌더합니다. `showControls` / `expansionMode`와 독립적으로 동작합니다.
- Storybook에 `WithRefresh` 스토리를 추가했습니다.
- 관련 파일: `packages/ui/src/composed/TreeView/TreeView.types.ts`, `packages/ui/src/composed/TreeView/TreeView.tsx`, `packages/ui/src/composed/TreeView/TreeView.stories.tsx`

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
