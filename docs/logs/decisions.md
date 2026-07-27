# 결정 로그

리포지토리 수준의 아키텍처, 패키지 경계, 기술 선택 결정을 기록합니다.

- **Showcase 앱 전용:** `apps/showcase/docs/logs/decisions.md`
- 최신 항목을 위에 추가합니다.

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

