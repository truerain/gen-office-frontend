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
