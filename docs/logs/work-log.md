# 작업 로그

이 문서는 리포지토리 수준의 소스 및 문서 변경 이력을 기록합니다.

## 2026-06-25

### 제안 평가 응답 규칙 추가

- 사용자 제안이나 질의에 대해 장점 중심으로 반응하지 않고 목적, 전제, 리스크, 대안, 유지보수 비용을 함께 검토하도록 `AGENTS.md`에 응답 평가 규칙을 추가했습니다.
- "가능함"과 "권장됨"을 구분하고, 정보가 부족한 경우 필요한 가정과 확인 사항을 먼저 밝히도록 명시했습니다.
- 관련 파일: `AGENTS.md`, `docs/logs/work-log.md`

## 2026-06-22

### AGENTS 한글 문서 편집 규칙 추가

- 한글 문서 수정 시 Windows PowerShell Get-Content/Set-Content 대신 UTF-8 Node.js 스크립트를 우선 사용하도록 규칙을 추가했습니다.
- 긴 한글 본문을 powershell.exe -Command로 전달하지 않고 Node helper script 또는 apply_patch를 사용하도록 명시했습니다.
- 관련 파일: AGENTS.md

## 2026-06-19

### Showcase decisions.md → apps/showcase/docs/logs/

- Showcase 전용 결정 로그를 `apps/showcase/docs/logs/decisions.md`로 분리했습니다.
- repo 전역 `docs/logs/decisions.md`는 monorepo 전역 결정만 유지하고, 분리 결정 항목을 추가했습니다.
- plan·AGENTS·doc-work-log 참조 경로를 갱신했습니다.

변경 영역:

- 문서 관리 체계
- Showcase 결정 로그

관련 파일:

- `apps/showcase/docs/logs/decisions.md`
- `docs/logs/decisions.md`
- `apps/showcase/docs/plan/06-gaps-and-roadmap.md`
- `apps/showcase/docs/plan/07-mvp-decisions.md`
- `apps/showcase/docs/plan/README.md`
- `AGENTS.md`
- `docs/logs/doc-work-log.md`

### Showcase MVP 의사결정 문서화

- Vercel 공개·단일 도메인·apps/showcase 빌드, URL–MDI 전 화면, Login 제거 결정을 `07-mvp-decisions.md`, `decisions.md`에 반영했습니다.

변경 영역:

- Showcase MVP 의사결정

관련 파일:

- `apps/showcase/docs/plan/07-mvp-decisions.md`
- `apps/showcase/docs/plan/06-gaps-and-roadmap.md`
- `apps/showcase/docs/plan/README.md`
- `apps/showcase/docs/logs/decisions.md`
- `docs/logs/doc-work-log.md`

### docs/logs/doc-work-log.md 추가

- 문서 전용 작업 이력을 `docs/logs/doc-work-log.md`에 분리·기록했습니다.
- Showcase plan 문서 신규 작성 및 01-positioning 설득 포인트 보강 내역을 반영했습니다.

변경 영역:

- 문서 관리 체계

관련 파일:

- `docs/logs/doc-work-log.md`
- `docs/logs/work-log.md`

### Showcase 01-positioning 설득 포인트 보강

- 레거시(Nexacro 등) 익숙함, 생산성, AI 하네스(바이브 코딩), React 대중성, 미래지향성 5축 설득 포인트를 반영했습니다.

변경 영역:

- Showcase 기획 문서

관련 파일:

- `apps/showcase/docs/plan/01-positioning-and-audience.md`
- `apps/showcase/docs/plan/README.md`
- `docs/logs/doc-work-log.md`

### apps/showcase 기획 문서 추가

- SI 원청 PM용 GenOffice Showcase(Nexacro 대체 설득 데모) 기획 문서를 `apps/showcase/docs/plan/`에 작성했습니다.
- 포지셔닝, PM 데모 시나리오 A~D, IA, Nexacro 비교, demo 연동 스펙, Gap·로드맵을 분리해 정리했습니다.

변경 영역:

- Showcase 앱 기획 (앱 스캐폴딩은 미착수)

관련 파일:

- `apps/showcase/docs/plan/README.md`
- `apps/showcase/docs/plan/01-positioning-and-audience.md`
- `apps/showcase/docs/plan/02-demo-scenarios.md`
- `apps/showcase/docs/plan/03-information-architecture.md`
- `apps/showcase/docs/plan/04-nexacro-comparison.md`
- `apps/showcase/docs/plan/05-demo-integration.md`
- `apps/showcase/docs/plan/06-gaps-and-roadmap.md`
- `docs/logs/doc-work-log.md`

## 2026-06-15

### 로그 역순 정렬 규칙 추가

- 새 로그 항목을 파일 앞쪽에 추가하도록 `AGENTS.md` 규칙을 보강했습니다.
- 로그 파일은 최신 항목이 위로 오도록 역순으로 관리합니다.
- 같은 날짜 섹션 안에서도 최신 작업을 위에 추가합니다.

변경 영역:

- 문서 관리 체계
- AI 코딩 규칙

관련 파일:

- `AGENTS.md`
- `docs/logs/work-log.md`

### 작업 로그 관리 시작

- 리포지토리 수준의 작업 로그 관리를 시작했습니다.
- 패키지별 구현 로그 파일을 추가했습니다.
- 앞으로 파일을 변경하는 작업은 반드시 문서 로그를 남기도록 `AGENTS.md` 규칙을 업데이트했습니다.

변경 영역:

- 문서 관리 체계
- AI 코딩 작업 흐름

관련 파일:

- `AGENTS.md`
- `docs/logs/work-log.md`
- `docs/logs/decisions.md`
- `packages/*/docs/implementation-log.md`

### 빌드 가이드 역할 정리

- `docs/01.BUILD_GUIDE.md`를 빌드, 실행, 트러블슈팅 전용 문서로 다시 작성했습니다.
- 오래된 패키지명과 깨진 한글 내용을 현재 워크스페이스 구조 기준으로 정리했습니다.
- `AGENTS.md`의 검증 섹션에서 빌드 가이드를 참조하도록 연결했습니다.

변경 영역:

- 문서 구조
- 빌드 및 실행 가이드
- AI 에이전트 검증 규칙

관련 파일:

- `docs/01.BUILD_GUIDE.md`
- `AGENTS.md`
- `docs/logs/work-log.md`
- `docs/logs/decisions.md`

### 로그 한국어 작성 규칙 추가

- 작업 로그와 결정 로그를 한국어로 작성하도록 `AGENTS.md` 규칙을 추가했습니다.
- 기존 로그 시작 항목을 한국어로 정리했습니다.

변경 영역:

- 문서 관리 체계
- AI 코딩 규칙

관련 파일:

- `AGENTS.md`
- `docs/logs/work-log.md`
- `docs/logs/decisions.md`
- `packages/*/docs/implementation-log.md`

### 충돌 해결 후 에이전트 규칙 보강

- 다른 작업에서 정리된 `gen-datagrid` 문서 구조를 인정하고, `AGENTS.md`의 `GenDataGrid` 문서 경로를 현재 구조에 맞췄습니다.
- 중복된 `GenDataGrid` 문서 규칙을 정리했습니다.
- 깨진 한국어 로그 내용을 읽을 수 있는 한국어로 다시 정리했습니다.

변경 영역:

- AI 에이전트 규칙
- 문서 로그
- GenDataGrid 문서 경로

관련 파일:

- `AGENTS.md`
- `docs/logs/work-log.md`
- `docs/logs/decisions.md`
- `packages/gen-datagrid/docs/log/implementation-log.md`
