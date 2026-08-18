# 결정 로그

리포지토리 수준의 아키텍처, 패키지 경계, 기술 선택 결정을 기록합니다.

- **Showcase 앱 전용:** `apps/showcase/docs/logs/decisions.md`
- 최신 항목을 위에 추가합니다.

## 2026-08-18

### GenGrid 헤더 다중 정렬은 Ctrl/Cmd

- 클라이언트 헤더 다중 정렬 수정 키는 TanStack 기본 Shift가 아니라 Ctrl(Windows) / Cmd(macOS)다.
- 정렬 순번은 헤더에 항상 두지 않고, 정렬 컬럼이 2개 이상일 때만 아이콘 옆에 표시한다.
- 관련 파일: `packages/gen-grid/src/core/table/useGenGridTable.ts`, `GenGridHeader.tsx`

## 2026-08-14

### 사업계획 PlanScope Demo 용어와 2탭 UX

- Actual / Pooled / PlanScope 용어를 demo에 적용한다. Actual은 실적 조합으로 생성된 라인, Pooled는 묶인 계획 단위, PlanScope는 Member가 아닌 Actual과 Pooled의 합집합이다.
- 새 Pooled 생성은 Actual 선선택(탭 1)만 담당하고, Pooled 선선택 후 Member 관리(탭 2)는 별도 탭으로 분리한다. 탭 1 팝업에서 신규/호환 Pooled를 고르고, 탭 2에서는 Member 추가 팝업으로 Non-Member Actual을 편입한다.
- 계획 금액 입력은 이 데모 범위 밖이며, 기존 사업계획 입력 Demo와 연동하지 않는다.
- 관련 파일: `apps/demo/src/pages/demo/plan-scope/**`, `docs/logs/work-log.md`

## 2026-08-12

### 사업계획 입력 화면은 1행 2줄 셀 레이아웃

- 실적/계획을 2개의 `<tr>`로 나누면 체크박스·행상태·선택·dirty가 계정 단위와 어긋난다. 이 화면은 계정 1행을 유지한다.
- 월 칸은 위=실적(읽기), 아래=계획+비율(계획만 커스텀 에디터)로 표시한다. 엑셀 2줄 출력은 기본 그리드 내보내기에 맞추지 않고 별도 커스텀으로 둔다.
- 관련 파일: `apps/demo/src/pages/demo/plan-vs-actual/**`

### rowspan 구간 ActiveRowHighlight 확장 — 보류

- 사업계획 2행 화면에서 계정코드 등 rowspan 셀을 active하면 실적(앵커) 행만 highlight되고 계획(covered) 행은 빠지는 문제가 있다.
- 같은 span 구간의 모든 행에 ActiveRowHighlight를 퍼뜨리는 안은 가능하지만, 기본 동작으로 채택하지는 않는다. 병합되지 않은 컬럼(월 금액)은 물리 행 단위 highlight가 맞고, span 단위 highlight를 기본값으로 두면 선택 범위가 커진다.
- 반영 여부는 이후 재검토한다. 재검토 시 확인할 것: span 컬럼 active 시에만 확장할지, 논리 레코드(계정) 단위로 항상 묶을지, `getRowStyle` 인라인 배경과의 우선순위.
- 관련 파일: `docs/gen-grid/row-spanning.md`, `packages/gen-grid/src/components/layout/rowSpanModel.ts`, `apps/demo/src/pages/demo/plan-vs-actual/PlanVsActualDemoPage.tsx`

## 2026-08-06

### demo MDI ↔ Browser History 연동

- demo에서 브라우저 Back을 MDI 활성화(MRU) 스택과 연동하는 방향을 채택한다. Back은 탭 전환이며 탭을 닫지 않는다.
- 논리 스택을 소스 오브 트루스로 두고, 브라우저 History는 신호로만 쓴다. close 시 History 중간 삭제는 불가하므로 논리 스택에서만 제거하고 popstate에서 스킵한다.
- Home을 히스토리 바닥으로 두어 Home만 남으면 Back 시 앱 밖으로 나간다. Showcase MVP(History 미사용)와 분기하며 flag로 off 한다.
- `@gen-office/mdi`는 v1에서 변경하지 않고 demo bridge로 구현한다.
- 관련 파일: `docs/mdi-history-bridge.md`, `docs/logs/decisions.md`

### @gen-office/debug 패키지와 MVP 범위

- 페이지 상태 확인·리렌더 확인용 foundation 패키지 `@gen-office/debug`를 추가한다.
- MVP API는 관찰형 `useDebugState`, `useRenderCount`, `useWhyRender`다. useState 대체형·Dialog UI는 채택하지 않는다.
- 데이터셋 DataGrid 조회, 덤프 헬퍼, DevTools 표준 장착, gen-grid-crud 내부 opt-in 등은 구현하지 않고 `docs/debug/debug-tooling-backlog.md`에 남겨 재검토한다.
- 관련 파일: `packages/debug/**`, `docs/debug/debug-tooling-backlog.md`, `docs/logs/decisions.md`

## 2026-07-28

### 서버 페이징용 Server-Side Sort DnD 승격

- Sort 다이얼로그는 단일 컬럼 목록 + 선택 행 DnD 우선순위를 기본 UX로 한다.
- 스타일은 theme 토큰을 사용하고, 앱 커스터마이징은 토큰 override를 우선한다.
- 관련 파일: `docs/gen-grid/server-side-sort-architecture.md`, `packages/gen-grid-crud/src/components/CrudServerSortDialog.tsx`

### 서버 페이징용 Server-Side Sort 아키텍처

- 서버 페이징 화면의 정렬 대안은 ActionBar Sort 팝오버 + 소비자 refetch로 정의한다.
- 기능 활성 시 기존 헤더 클라이언트 정렬은 비활성(`enableSorting: false`)한다.
- 구현은 demo 검증 → gen-grid 최소 스위치 → gen-grid-crud built-in 승격 순으로 진행한다.
- 관련 파일: `docs/gen-grid/server-side-sort-architecture.md`

## 2026-07-27

### GenCalendar Phase 세분화 및 문서 경로

- 1차 목표 범위(월/주/편집/반복)는 유지하고 구현 단위를 P0–P8로 세분화한다.
- 패키지 문서는 구현 착수와 함께 `.docs`에서 `docs`로 이전한다.
- 연동은 Storybook 스토리와 `apps/demo` Calendar Demo를 우선하고, 월간 초과 일정 예제는 우측 패널로 제공한다.
- 관련 파일: `packages/gen-calendar/docs/calendar-concept-and-plan.md`, `docs/logs/decisions.md`

## 2026-06-19 - Showcase 결정 로그 분리

결정:

Showcase 관련 결정은 `apps/showcase/docs/logs/decisions.md`로 이전·분리합니다. 본 파일은 frontend monorepo 전역 결정만 기록합니다.

이유:

Showcase(수주·공개 데모)는 배포·URL·무로그인 등 앱 전용 정책이 많아, repo 전역 decisions와 섞이면 범위가 불명확해집니다.

영향:

- Showcase 구현·배포 결정 → `apps/showcase/docs/logs/decisions.md`
- 패키지 경계·AGENTS·gen-datagrid 등 → 본 파일

## 2026-06-15 - 로그는 최신 항목을 위에 작성

결정:

로그 파일은 역순으로 관리하고, 새 항목은 파일 앞쪽에 추가합니다. 같은 날짜 섹션 안에서도 최신 작업을 위에 작성합니다.

이유:

AI 코딩 작업은 최근 맥락을 빠르게 확인하는 것이 중요합니다. 최신 로그를 위에 두면 이어서 작업하거나 충돌을 해결할 때 필요한 정보를 더 빨리 찾을 수 있습니다.

영향:

- `docs/logs/work-log.md`는 최신 날짜와 최신 항목이 위로 오도록 관리합니다.
- `docs/logs/decisions.md`도 최신 결정이 위로 오도록 관리합니다.
- 각 패키지·앱(showcase 등)의 결정·구현 로그도 같은 방식으로 작성합니다.
- `AGENTS.md`의 작업 로그 규칙에 이 정렬 기준을 명시합니다.

## 2026-06-15 - 문서 로그 관리 시작

결정:

파일을 변경하는 모든 작업은 문서 로그를 남깁니다.

이유:

GenOffice는 AI 코딩 도구를 적극적으로 활용해 개발합니다. 문서 로그를 남기면 구현 맥락, 패키지 결정, 문서 변경 이력을 채팅 기록 밖에서도 확인할 수 있습니다.

영향:

- 리포지토리 수준 변경은 `docs/logs/work-log.md`에 기록합니다.
- 아키텍처와 패키지 경계 결정은 `docs/logs/decisions.md`에 기록합니다.
- 앱·패키지 전용 결정은 해당 경로(예: `apps/showcase/docs/logs/decisions.md`)에 기록합니다.
- `AGENTS.md`는 AI 에이전트가 공유하는 규칙 문서로 사용합니다.

## 2026-06-15 - 로그는 한국어로 작성

결정:

작업 로그와 결정 로그는 한국어로 작성합니다.

이유:

GenOffice의 주요 개발 및 운영 문맥이 한국어로 논의되므로, 로그도 한국어로 남겨야 이후 사람이 읽고 유지보수하기 쉽습니다.

영향:

- `docs/logs/work-log.md` 항목은 한국어로 작성합니다.
- `docs/logs/decisions.md` 항목은 한국어로 작성합니다.
- 각 패키지·앱의 구현·결정 로그 항목도 한국어로 작성합니다.

## 2026-06-15 - 빌드 가이드는 실행과 트러블슈팅 전용으로 유지

결정:

`docs/01.BUILD_GUIDE.md`는 설치, 빌드, 실행, 트러블슈팅 전용 문서로 유지하고, AI 코딩 작업 규칙은 `AGENTS.md`에 둡니다.

이유:

두 문서의 역할이 섞이면 AI 작업 규칙과 사용자용 빌드 절차가 중복되고 오래된 정보가 남기 쉽습니다. 빌드 가이드는 실제 명령과 문제 해결에 집중하고, `AGENTS.md`는 에이전트 행동 규칙과 검증 원칙을 담당하는 편이 명확합니다.

영향:

- `AGENTS.md`는 검증 섹션에서 `docs/01.BUILD_GUIDE.md`를 참조합니다.
- `docs/01.BUILD_GUIDE.md`는 현재 패키지 구조와 명령어 기준으로 유지합니다.
- README의 빠른 시작은 짧은 진입점으로 유지하고 상세 절차는 빌드 가이드에 둡니다.

## 2026-06-15 - GenDataGrid 문서 구조는 현재 세분화된 경로를 따른다

결정:

`packages/gen-datagrid` 문서는 현재 구조인 `docs/log`, `docs/reference`, `docs/plan`, `docs/architecture` 경로를 기준으로 관리합니다.

이유:

다른 작업에서 `gen-datagrid` 문서가 세분화된 구조로 정리되었고, 이를 유지하는 편이 기존 진행 이력과 충돌하지 않습니다. 예전 경로인 `packages/gen-datagrid/docs/implementation-log.md`를 다시 만들면 로그가 중복됩니다.

영향:

- 구현 로그는 `packages/gen-datagrid/docs/log/implementation-log.md`에 기록합니다.
- API 문서는 `packages/gen-datagrid/docs/reference/` 아래에 둡니다.
- 계획과 게이트 문서는 `packages/gen-datagrid/docs/plan/` 아래에 둡니다.
- `AGENTS.md`의 GenDataGrid 문서 규칙도 이 경로를 기준으로 유지합니다.

## 2026-07-21

### GenCalendar 1차 구현 기본 결정

- 반복 일정은 패키지 자체 구조화 타입을 우선 사용하고, RRULE 등 외부 시스템 연동은 어댑터 레이어에서 변환합니다.
- 드래그 편집 기본 스냅 단위는 30분, 주간 뷰 기본 시간 범위는 24시간 전체로 합니다.
- 구현 전략은 자체 구현을 우선하며, 월간 초과 일정 클릭은 패키지 내장 UI보다 `onMoreEventsClick` 콜백 제공을 우선합니다.
- 관련 파일: `packages/gen-calendar/.docs/calendar-concept-and-plan.md`, `packages/gen-calendar/.docs/calendar-architecture.md`, `docs/logs/decisions.md`

### GenCalendar 패키지 아키텍처 책임 분리

- `gen-calendar`는 월간/주간 캘린더 표시, 반복 일정 전개, 드래그 편집 상호작용, 변경 콜백 전달을 담당하는 기능 패키지로 정의합니다.
- 고객별 저장, 승인, 권한, 충돌 감지, 외부 캘린더 연동은 업무 화면 또는 별도 도메인 계층에서 담당합니다.
- 이 결정은 공통 패키지가 고객별 정책을 직접 소유하지 않도록 하기 위한 것입니다.
- 관련 파일: `packages/gen-calendar/.docs/calendar-architecture.md`, `docs/logs/decisions.md`

