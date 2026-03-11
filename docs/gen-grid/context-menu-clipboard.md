# GenGrid Context Menu + Clipboard

관련 문서
- `docs/gen-grid/range-selection.md`
- `docs/gen-grid/layout-contract.md`

## 현재 구현 요약 (코드 기준)
- 우클릭 컨텍스트 메뉴 오픈
  - `packages/gen-grid/src/components/base/GenGridBase.tsx`
  - 그리드 루트의 `onContextMenu`에서 셀(`td[data-rowid][data-colid]`)만 허용하고 `preventDefault()` 후 메뉴 좌표를 상태로 저장
- 메뉴 컴포넌트
  - `packages/gen-grid/src/components/base/GenGridContextMenu.tsx`
  - 메뉴 항목: `Copy`, `Copy with Header`, `Paste`
  - 메뉴 하단 통계: `Sum`, `Avg`, `n=count` (읽기 전용)
- 메뉴 닫힘 처리
  - `packages/gen-grid/src/components/base/GenGridBase.tsx`
  - 외부 클릭, 스크롤, 리사이즈, `Escape`에서 닫힘
- 클립보드 동작
  - `packages/gen-grid/src/features/range-selection/useClipboardActions.ts`
  - 범위 계산은 `resolveRangeBounds()` 재사용
  - Copy: 선택 범위를 TSV로 직렬화
  - Copy with Header: 선택 컬럼 헤더 + 데이터 TSV
  - Paste: `selectedRange.anchor` 우선, 없으면 `activeCell` 기준으로 매핑
- 범위 계산 유틸
  - `packages/gen-grid/src/features/range-selection/clipboard.ts`
  - `resolveRangeBounds()`가 row/col 최소-최대와 대상 `columnIds` 계산

## 구현 상세

### 1) Context Menu Open
- 우클릭 대상이 편집 가능한 입력 요소(`input/select/textarea/button/[contenteditable=true]`)면 메뉴를 띄우지 않음
- 셀 우클릭일 때만 메뉴 좌표(`clientX/clientY`)를 기록

### 2) Copy
- 입력: `selectedRange`
- 출력: TSV (`\t`, `\n`)
- 셀 값 추출 시 `columnDef.meta.exportValue`가 있으면 우선 사용

### 3) Copy with Header
- 1행: 선택 컬럼 헤더
- 이후: 선택 데이터
- 헤더 텍스트는 문자열/숫자 헤더면 그 값을 쓰고, 아니면 `column.id` fallback

### 4) Paste
- 시작 셀: `selectedRange.anchor` 또는 `activeCell`
- 파서: TSV/CSV 텍스트를 2차원 배열로 변환
- 매핑: 시작 셀 기준 우측/하단으로 확장
- 편집 불가 셀 및 시스템 컬럼(`__select__`, `__rowNumber__`, `__row_status__`)은 skip

### 5) Range Stats (Sum/Avg)
- 계산 위치: `GenGridBase.tsx`에서 계산 후 `GenGridContextMenu`로 전달
- 범위 계산: `resolveRangeBounds(table, selectedRange)` 재사용
- 계산 조건
  - 대상: 현재 선택 범위 내 셀
  - 숫자 판정: `typeof value === 'number' && Number.isFinite(value)`
  - 문자열 숫자 파싱은 하지 않음(예: `"1,000"` 미집계)
- 결과
  - `sum`: 숫자 셀 합계
  - `avg`: 숫자 셀 평균 (`sum / count`)
  - `count`: 집계에 포함된 숫자 셀 개수
- 표시 규칙
  - `count === 0`이면 `Sum: -`, `Avg: -`
  - `n={count}` 보조 표시
- 성능
  - `contextMenu`가 열려 있을 때만 `useMemo`로 계산
  - 의존성: `contextMenu`, `selectedRange`, `rows`, `table`

## 현재 한계 및 유의사항
- 우클릭 시 선택 범위(`selectedRange`)를 변경하지 않음
  - 즉, 우클릭한 셀이 기존 선택 범위 밖이어도 기존 범위를 기준으로 Copy/통계가 계산될 수 있음
- 큰 범위에서 메뉴를 열면 통계 계산 비용이 발생할 수 있음(메뉴 닫힘 상태에서는 계산하지 않음)

## 검증 체크리스트 (구현 반영)
- [x] 선택 범위가 있을 때만 Sum/Avg 표시됨
- [x] 숫자가 아닌 값은 집계에서 제외됨
- [x] 우클릭 위치와 무관하게 현재 선택 범위 기준으로 계산됨
- [x] Copy/Paste 기존 동작 회귀 없음
