# Actuals 당기 그룹 컬럼 접기 구현 계획

## 1. 목표
- `ActualsPage`의 그리드에서 1단 헤더 `당기`에 토글 버튼을 제공한다.
- 토글 ON/OFF로 `m01~m12` 월별 컬럼 표시를 제어한다.
- 접힌 상태에서는 `당기 > 합계(currActAmt)`만 남는다.
- `요약보기/월별상세보기` 라디오와 충돌 없이 동작한다.

## 2. 현재 상태 요약
- 현재 컬럼은 `createActualsColumns(viewMode)`로 생성한다.
- `summary` 모드: `당기(currActAmt)` 단일 컬럼.
- `monthly-detail` 모드: `당기` 그룹(`합계 + m01~m12`) 컬럼.
- 아직 헤더 클릭/토글로 월별 컬럼을 접는 기능은 없다.

## 3. 요구 동작 정의
- `monthly-detail` 모드에서만 1단 `당기` 헤더에 토글 버튼을 노출한다.
- 토글 기본값은 `펼침(true)`으로 둔다.
- `접힘(false)` 상태는 `m01~m12`만 숨기고 `currActAmt`는 유지한다.
- `summary` 모드에서는 이미 월별 컬럼이 없으므로 토글 UI를 숨긴다.
- 라디오를 `summary -> monthly-detail`로 변경할 때는 마지막 토글 상태를 유지한다.

## 4. 설계

### 4.1 상태 모델
- `ActualsPage`에 `isMonthlyExpanded: boolean` 상태를 추가한다.
- 기본값 `true`.

### 4.2 컬럼 생성 계약 변경
- `createActualsColumns(viewMode, options?)` 형태로 확장한다.
- `options` 예시:
  - `monthlyExpanded: boolean`
  - `onToggleMonthlyExpanded?: () => void`
- `monthly-detail`일 때:
  - 그룹 헤더 `당기`에 토글 버튼 렌더링.
  - `monthlyExpanded === false`면 `m01~m12` 정의를 제외.
- `summary`일 때:
  - 기존 단일 `당기(currActAmt)` 유지.

### 4.3 헤더 UI
- TanStack `ColumnDef.header`를 문자열 대신 렌더 함수로 지정한다.
- 헤더 구성:
  - 텍스트: `당기`
  - 버튼: 접힘/펼침 아이콘 또는 텍스트(`접기/펼치기`)
- 접근성:
  - `button` 사용.
  - `aria-label`, `aria-expanded` 제공.

### 4.4 UI 스타일
- `ActualsColumns.tsx` 내 inline style 최소 사용 또는 페이지 CSS 모듈에 클래스 추가.
- 헤더 높이/정렬을 깨지 않도록 작은 버튼(아이콘형) 사용.
- ActionBar/레이아웃 가드와 무관하지만 헤더 높이 변형은 피한다.

## 5. 영향 범위
- 주요 변경 파일
  - `apps/demo/src/pages/co/actuals/ActualsColumns.tsx`
  - `apps/demo/src/pages/co/actuals/ActualsPage.tsx`
  - 필요 시 `apps/demo/src/pages/co/actuals/ActualsPage.module.css`
- 변경하지 않는 범위
  - `gen-grid`, `gen-grid-crud` 공통 패키지 로직
  - API 모델/요청 스펙

## 6. 구현 단계
1. `ActualsPage`에 `isMonthlyExpanded` 상태 추가.
2. `createActualsColumns` 시그니처 확장.
3. `monthly-detail` 그룹 헤더를 렌더 함수로 전환하고 토글 버튼 추가.
4. `monthlyExpanded` 값에 따라 `m01~m12` 컬럼 포함/제외.
5. `summary` 모드에서 토글 버튼 비노출 확인.
6. `tsc -b`로 타입 검증.

## 7. 테스트 체크리스트
- 기본 진입 시 `summary`에서 `당기` 단일 컬럼 노출.
- 라디오를 `monthly-detail`로 바꾸면 `합계 + m01~m12` 노출.
- `당기` 토글 클릭 시 `m01~m12` 숨김, `합계` 유지.
- 다시 클릭 시 `m01~m12` 복원.
- 라디오 전환 후에도 토글 상태 유지 확인.
- 컬럼 고정/스크롤/정렬 기본 동작 이상 없음.
- 타입체크 통과:
  - `pnpm --filter @gen-office/demo exec tsc -b --pretty false`

## 8. 리스크 및 대응
- 리스크: 그룹 헤더 버튼 클릭이 정렬/드래그와 충돌 가능.
- 대응: 버튼 클릭 이벤트에서 `stopPropagation` 처리.
- 리스크: 컬럼 재생성 시 사용자 컬럼 너비 상태 초기화 가능.
- 대응: 컬럼 `id` 안정적으로 유지.

## 9. 완료 기준(DoD)
- `monthly-detail` 모드에서 1단 `당기` 토글로 월별 컬럼 접기/펼치기가 정상 동작한다.
- `summary` 모드에서 UI가 단순하게 유지되고 이상 헤더가 없다.
- 타입체크 통과 및 기존 동작 회귀 없음.
