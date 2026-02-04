Row Grouping - Active Row Spec

Active Row 정의

Active Row = 현재 activeCell이 속한 row
식별값: row.id (TanStack row model의 row.id를 그대로 사용)
타입: string | null
파생식: activeRowId = activeCell?.rowId ?? null
단일 활성만 허용 (multi‑active 없음)
Row Grouping 고려 정의

Group Header Row도 “Active Row”가 될 수 있어야 함
방법: 그룹 헤더를 클릭/포커스할 때 activeCell을 그 row의 “대표 컬럼”으로 설정
대표 컬럼 규칙은 1차로 firstVisibleColumnId로 통일하면 기존 activeCell 흐름과 100% 호환
즉, 별도 “row-only focus” 상태는 만들지 않음
적용 범위 (1차)

상태: 신규 상태는 만들지 않고 activeCell에서 파생
렌더링: <tr>에 data-active-row="true" 또는 class 추가
UX: Row Highlight만 적용 (시각적 강조)
인터랙션: Row grouping 토글(접기/펼치기) 시 activeRow 기준으로 동작하도록 연결
스크롤: 기존 activeCell 스크롤 로직 유지 (Row 기준 스크롤은 이번 범위 밖)
비범위 (나중 단계)

Row Selection과의 연동
멀티 Active Row
Row-level edit mode
ARIA/접근성 확장
Active Row 영속 저장/복원
관련 파일(구현 시 손댈 곳)






Active Row
- Definition: Active Row is the row that contains the current active cell.
- Type: activeRowId = activeCell?.rowId ?? null
- Group Header Row is allowed to be Active Row.

Representative Column (anchor for activeCell)
- Purpose: map row-level activation to the existing activeCell model (rowId + columnId).
- Rule:
  1) Use row-status column if present and visible: ROW_STATUS_COLUMN_ID ("__row_status__")
  2) Else use group column if grouping is enabled for that row
  3) Else use first visible column

Notes
- If representative column is missing (e.g., row-status disabled), fallback to next rule.
- Do not introduce a separate "row-only focus" state; keep activeCell as the single source of truth.




### Row Grouping 구현 방향 요약(현재 기준: Active Row 옵션 추가 완료, Group Header Row는 Active Row 허용)

### 1. 목표
TanStack Table의 grouping model을 사용해 Row Grouping 구현
Group Header Row 클릭 시 Active Row로 동작 (대표컬럼 규칙 적용)
기존 editing/selection/virtualization 흐름과 충돌 없이 동작

### 2. 핵심 설계
데이터 모델: TanStack grouping state 사용 (table.getState().grouping)
Row 구조: table.getRowModel().rows 안에 그룹 row가 포함됨
Group Header Row: 일반 row 렌더링 전에 삽입하거나, row.getIsGrouped()인 row에 대해 별도 렌더

### 3. Active Row 연결 (정책 확정)
대표컬럼 규칙:
__row_status__ (row-status)
grouping column
first visible column
setActiveRow(rowId) 사용 (이미 useActiveCellNavigation에 있음)

### 4. 렌더링 방식 (선택 필요)

A안: GenGridBody/GenGridVirtualBody 내부에서 group row를 분기 렌더
B안: 별도 GenGridGroupRow 컴포넌트 생성 후 삽입
권장: B안 (구조 명확, header row 레이아웃 관리 쉬움)
5. Group Header Row UI

기본 컬럼 레이아웃:
첫 컬럼에 펼침/접힘 버튼 + group label
나머지 컬럼은 빈 셀 or aggregated value
row.getToggleExpandedHandler() 사용 (TanStack 제공)
row.getIsExpanded() 표시
6. 집계/표시 규칙

columnDef.aggregationFn 사용 가능
cell.getIsAggregated() / cell.getIsPlaceholder() 처리
placeholder cell은 empty 처리 (span 유지)
7. Virtualization 고려

virtual body에서 group row 포함한 rows 기준으로 동일하게 virtualization 적용
row height 고정이면 그대로, header row 높이 다르면 별도 처리 필요
8. 스코프/비범위

스코프: expand/collapse, header row 표시, active row 연동
비범위: drag-grouping, multi-level header styling, server-side grouping


A안(BODY 내 분기) vs B안(별도 컴포넌트)
Group Header Row layout(단일 셀 colspan vs 컬럼별 셀)
Aggregated 값 표시할 컬럼 범위
원하면 위 3가지만 결정하면 바로 구현 플로우로 들어갈게요.




TanStack grouping/expanded state 연결 (enableGrouping, grouping, expanded)
Body/VirtualBody에서 row.getIsGrouped() 분기 렌더
Group Header Row UI (토글 + 라벨 + 카운트)
최소 스타일 추가
변경 파일

GenGrid.types.ts
useGenGridTable.ts
GenGridBody.tsx
GenGridVirtualBody.tsx
GenGridBody.module.css
사용 방법 (핵심)
<GenGrid
  enableGrouping
  grouping={['dept']}          // 그룹 기준 컬럼 id
  onGroupingChange={setGrouping}
  expanded={{}}                // 필요시 외부 제어
  onExpandedChange={setExpanded}
  columns={[
    {
      accessorKey: 'amount',
      aggregationFn: 'sum',
      aggregatedCell: ({ getValue }) => `합계: ${getValue()}`,
    },
  ]}
/>
aggregationFn / aggregatedCell은 columns에서 정의
Group Header Row에서 cell.getIsAggregated()일 때 위 값을 출력
다음 할 일 (선택)
그룹 토글 아이콘/디자인 개선 (현재 >/v)
Grouped cell 기본 텍스트 포맷 커스터마이즈
Row Selection/Row Status와 그룹 헤더의 상호작용 정의