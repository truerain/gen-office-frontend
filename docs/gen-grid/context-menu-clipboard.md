# GenGrid Context Menu + Clipboard 설계

관련 문서
- `docs/gen-grid/range-selection.md`
- `docs/gen-grid/layout-contract.md`

## 목적
- `GridSelection` 상태를 기준으로 마우스 우클릭 컨텍스트 메뉴를 제공한다.
- 메뉴 액션으로 `Copy`, `Copy with Header`, `Paste`를 지원한다.
- 편집/포커스/가상스크롤 경로(일반 Body + Virtual Body)에서 동작 일관성을 유지한다.

## 범위
- 대상 컴포넌트:
  - `packages/gen-grid/src/components/layout/GenGridBody.tsx`
  - `packages/gen-grid/src/components/layout/GenGridVirtualBody.tsx`
  - `packages/gen-grid/src/components/layout/GenGridCell.tsx`
  - `packages/gen-grid/src/features/range-selection/useRangeSelection.ts`
- 비대상:
  - 브라우저 기본 컨텍스트 메뉴 커스터마이징 외 기능
  - TanStack Table 내부 확장(라이브러리 포크)

## 정책 (확정)
1. 우클릭 시 선택 범위는 변경하지 않는다.
- 현재 `selectedRange`를 유지한다.
- 활성 셀(`activeCell`)도 기본적으로 유지한다.

2. Paste 대상 제약
- `readonly` 페이지/컬럼/셀은 건너뛴다.
- `non-editable` 셀은 건너뛴다.
- 시스템 컬럼(`selection`, `rowNumber`)은 건너뛴다.

3. Copy with Header 기준
- `selectedRange`의 컬럼 범위를 기준으로 헤더를 생성한다.
- 화면에 보이는 순서(visible leaf column order)를 따른다.

## TanStack Table 지원 범위
- TanStack Table은 headless table state/row model 엔진이다.
- `Context Menu`, `Clipboard Copy/Paste`는 내장 기능이 아니다.
- 따라서 본 기능은 GenGrid 레이어에서 이벤트/직렬화/업데이트를 직접 구현해야 한다.

## 동작 정의

### 1) Context Menu Open
- 이벤트: 셀(`td`)의 `onContextMenu`
- 동작:
  - `preventDefault()`로 브라우저 기본 메뉴를 막는다.
  - 현재 `selectedRange`가 없으면 메뉴는 disabled 상태를 노출한다.
  - 메뉴 위치는 마우스 좌표(clientX/clientY) 기준으로 표시한다.

### 2) Copy
- 입력: 현재 `selectedRange`
- 출력: TSV 문자열 (`\t`, `\n`)
- 값 직렬화:
  - column meta의 `exportValue`가 있으면 우선 사용
  - 없으면 셀 원시값을 문자열로 변환
- 빈 선택(`selectedRange == null`)이면 no-op

### 3) Copy with Header
- 출력 포맷:
  - 1행: 선택 컬럼 헤더 TSV
  - 2행 이후: 선택 셀 데이터 TSV
- 헤더 소스:
  - 선택 범위에 포함된 visible leaf column의 `columnDef.header` 텍스트
  - 텍스트 변환이 불가능하면 `column.id` fallback

### 4) Paste
- 입력: Clipboard TSV/CSV 텍스트
- 시작점:
  - `selectedRange`가 있으면 anchor 셀
  - 없으면 `activeCell`
  - 둘 다 없으면 no-op
- 매핑:
  - 입력 2D 배열을 시작점부터 우하향으로 매핑
  - 그리드 경계 밖은 버린다.
  - 대상 셀이 정책상 비편집 대상이면 skip
- 업데이트:
  - 현재 구조에서는 셀 단위 `updateCell` 호출
  - 추후 성능 필요 시 batch API 도입 검토

## 이벤트/상태 연계 포인트

1. 핸들러 병합 지점
- `GenGridBody.tsx`의 `mergedProps`
- `GenGridVirtualBody.tsx`의 `mergedProps`
- 여기에 `onContextMenu`를 공통 merge로 추가해야 일반/가상 경로가 동일해진다.

2. Range selection 훅
- `useRangeSelection.ts`는 좌클릭 드래그만 다루므로 우클릭 정책(현재 선택 유지)과 충돌 없음
- 단, 우클릭 시 강제 선택 변경 로직을 추가하지 않도록 주의

3. 편집 상태 충돌
- `GenGridCell.tsx`의 editor blur commit 로직이 있으므로
- 메뉴 오픈 시 의도치 않은 commit 발생 여부를 회귀 테스트로 확인 필요

## UI 구성 권장
- `@gen-office/ui`의 `DropdownMenu` 사용
- 메뉴 항목:
  - `Copy`
  - `Copy with Header`
  - `Paste`
- disabled 조건:
  - Copy 계열: 선택 범위 없음
  - Paste: 시작 셀 없음 또는 읽기 전용 컨텍스트

## 예외/에러 처리
- Clipboard API 권한 실패 시:
  - 조용한 실패(no throw) + 개발 모드 로그
- 파싱 실패(비정상 텍스트) 시:
  - no-op
- 전부 skip되는 Paste:
  - 데이터 변경 없음

## 성능 고려
- 대량 Paste 시 셀 단위 업데이트는 렌더/dirty 이벤트가 많아질 수 있다.
- 필요하면 다음 단계로 `applyCells([{rowId,columnId,value}...])` 형태의 batch 업데이트를 검토한다.

## 테스트 체크리스트
- [ ] 일반 Body에서 우클릭 메뉴가 뜬다.
- [ ] Virtual Body에서 우클릭 메뉴가 뜬다.
- [ ] 우클릭해도 선택 범위가 유지된다.
- [ ] Copy가 선택 범위를 TSV로 복사한다.
- [ ] Copy with Header가 선택 컬럼 헤더 + 데이터를 복사한다.
- [ ] Paste가 시작점 기준으로 매핑된다.
- [ ] readonly/non-editable/system column이 skip된다.
- [ ] 편집 중 우클릭 시 의도치 않은 값 커밋이 없다.
- [ ] 트리/그룹/핀 컬럼 환경에서 동작이 깨지지 않는다.

## 단계별 구현 순서
1. 상태/메뉴 스켈레톤 추가
- context menu open state, anchor position, target cell context

2. 이벤트 연결
- Body/VirtualBody `mergedProps`에 `onContextMenu` 병합

3. Copy/Copy with Header 구현
- range -> 2D matrix -> TSV serializer

4. Paste 구현
- clipboard text parser -> 대상 셀 매핑 -> updateCell 적용

5. 회귀 테스트
- 일반/가상/편집/readonly/system column 케이스 검증