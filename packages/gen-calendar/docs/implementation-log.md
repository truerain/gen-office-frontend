<!-- packages/gen-calendar/docs/implementation-log.md
Tracks planning and implementation notes for GenCalendar.
-->

# GenCalendar 구현 로그

## 2026-07-27

### P0–P8 1차 구현 및 Phase 세분화 반영

- `@gen-office/gen-calendar` 패키지 골격을 추가하고 월간/주간 뷰, 선택, 드래그 이동/리사이즈, 기본 반복 전개를 구현했다.
- 문서 경로를 `.docs`에서 `docs`로 이전하고, 단계별 계획을 P0–P8로 세분화해 반영했다.
- demo `CalendarDemoPage`와 Storybook 스토리, 날짜/정규화/반복/주간 레이아웃 단위 테스트를 추가했다.
- 관련 파일: `packages/gen-calendar/src/**`, `packages/gen-calendar/docs/**`, `apps/demo/src/pages/demo/calendar/**`

## 2026-07-21

### 확정 결정사항 문서 반영

- 반복 일정 자체 타입 우선, 외부 시스템 어댑터 레이어, 30분 드래그 스냅, 주간 24시간 표시, 자체 구현 우선, 월간 초과 일정 콜백 제공 결정을 계획 문서와 아키텍처 문서에 반영했다.
- 월간 초과 일정 처리 의미와 `onMoreEventsClick` 콜백 후보를 계획 문서에 추가했다.
- 관련 파일: `packages/gen-calendar/.docs/calendar-concept-and-plan.md`, `packages/gen-calendar/.docs/calendar-architecture.md`, `packages/gen-calendar/.docs/implementation-log.md`

### 아키텍처 다이어그램 문서 작성

- `gen-calendar`의 컴포넌트 계층, 데이터 흐름, 편집 상호작용, 반복 일정 모델을 Mermaid 다이어그램으로 정리했다.
- 패키지가 표시와 상호작용 결과 전달에 집중하고, 저장/승인/충돌 처리는 업무 화면이 담당하는 구조를 명시했다.
- 관련 파일: `packages/gen-calendar/.docs/calendar-architecture.md`, `packages/gen-calendar/.docs/implementation-log.md`

### 1차 범위와 일정 데이터 필드 제안 반영

- 1차 범위를 월간/주간 뷰, 편집 가능 캘린더, 드래그 기간 변경, 반복 일정 허용으로 조정했다.
- 일정 데이터 기본 필드로 시간 범위, 상태, 편집 가능 여부, 반복 규칙, 반복 회차 식별자, 리소스/소유자/참석자, 확장 메타 필드를 제안했다.
- 반복 일정은 저장 모델과 표시 모델을 분리하고, 패키지 기본 전개와 서버 전개를 모두 허용하는 방향으로 정리했다.
- 관련 파일: `packages/gen-calendar/.docs/calendar-concept-and-plan.md`, `packages/gen-calendar/.docs/implementation-log.md`

### 초기 개념 및 계획 문서 작성

- `gen-calendar`를 고객별 일정관리 화면 전체가 아닌 재사용 가능한 캘린더 기반 패키지로 정의했다.
- 패키지 책임, 제외 범위, 1차 MVP, 구현 전략 후보, 단계별 계획을 정리했다.
- 월간 뷰 중심의 보수적 MVP를 우선 후보로 두고, 주간/일간 뷰와 드래그 편집은 후속 확장 항목으로 분리했다.
- 관련 파일: `packages/gen-calendar/.docs/calendar-concept-and-plan.md`, `packages/gen-calendar/.docs/implementation-log.md`
