# 문서 작업 로그

리포지토리 수준 **문서 추가·수정·구조 변경** 이력을 기록합니다. 소스 코드 변경은 `work-log.md`, 아키텍처 결정은 `decisions.md`(전역) 또는 `apps/showcase/docs/logs/decisions.md`(Showcase)를 참고합니다.

- 최신 항목을 위에 추가합니다.
- 같은 날짜 섹션 안에서도 최신 작업을 위에 둡니다.

## 2026-06-19

### Showcase URL — 진입 전용, History 미관리

- URL 직접 진입 시 `?page=` / `?scenario=`로 메뉴 실행, History API 미사용으로 확정했습니다.
- 양방향 URL–MDI sync·`tabs` 파라미·뒤로가기 A/B 보류 항목을 제거했습니다.

변경 영역:

- Showcase URL·MDI 정책

관련 파일:

- `apps/showcase/docs/logs/decisions.md`
- `apps/showcase/docs/plan/07-mvp-decisions.md`
- `apps/showcase/docs/plan/05-demo-integration.md`
- `apps/showcase/docs/plan/03-information-architecture.md`
- `apps/showcase/docs/plan/06-gaps-and-roadmap.md`
- `apps/showcase/docs/plan/README.md`

### Showcase decisions.md 분리

- Showcase 결정 로그 위치를 `apps/showcase/docs/logs/decisions.md`로 정리했습니다.
- repo 전역 decisions 복원 및 참조 경로 갱신.

변경 영역:

- Showcase 결정 로그·문서 참조

관련 파일:

- `apps/showcase/docs/logs/decisions.md`
- `apps/showcase/docs/logs/decisions.md`
- `AGENTS.md`
- `apps/showcase/docs/plan/README.md`

### Showcase MVP 의사결정 문서 (07-mvp-decisions)

- 배포(Vercel 공개·단일 도메인·apps/showcase 빌드), URL–MDI 전 화면, Login 제거를 확정 기록했습니다.
- 브라우저 뒤로가기 A/B안과 쉬운 용어 정리를 추가했습니다.
- `apps/showcase/docs/logs/decisions.md`, plan `06`·`README`를 동기화했습니다.

변경 영역:

- Showcase MVP 의사결정

관련 파일:

- `apps/showcase/docs/plan/07-mvp-decisions.md`
- `apps/showcase/docs/plan/README.md`
- `apps/showcase/docs/plan/06-gaps-and-roadmap.md`
- `apps/showcase/docs/logs/decisions.md`
- `docs/logs/doc-work-log.md`

### Showcase 01-positioning 설득 포인트 보강

- PM·발주처 설득 관점에서 **5대 설득 포인트**를 정의했습니다.
  - 레거시(Nexacro 등) 익숙함
  - Reference·표준 패키지 기반 **생산성**
  - **AI 하네스**(AGENTS.md, 패키지 경계, Reference — 바이브 코딩·에이전트 개발 가속)
  - **React 대중성**(인력·생태계)
  - **미래지향성**(Runtime 제거, 웹 표준)
- Hook 카피, PM 관심사 표, 3 Pillars 요약, 피해야 할 포지셔닝(AI 대체 주장 금지 등)을 함께 갱신했습니다.
- plan README 목차 설명을 5대 설득 포인트 반영으로 수정했습니다.

변경 영역:

- Showcase 기획 — 포지셔닝

관련 파일:

- `apps/showcase/docs/plan/01-positioning-and-audience.md`
- `apps/showcase/docs/plan/README.md`

### apps/showcase 기획 문서 신규 작성

- SI **원청 PM**이 Nexacro 등 레거시 대체로 GenOffice를 제안할 때 사용할 **Showcase 앱 기획** 문서 세트를 추가했습니다.
- Showcase(설득 셸)와 Demo(Reference App) 역할 분리, mock·Guest·scenario 딥링크 연동 스펙을 문서화했습니다.
- 앱 스캐폴딩(`apps/showcase` Vite) 및 Demo Guest mode 구현은 **미착수** — 기획 단계만 완료.

변경 영역:

- Showcase 앱 기획 (docs/plan)

관련 파일:

- `apps/showcase/docs/plan/README.md` — 목차·읽는 순서·상태
- `apps/showcase/docs/plan/01-positioning-and-audience.md` — 포지셔닝·대상·Showcase vs Demo
- `apps/showcase/docs/plan/02-demo-scenarios.md` — PM 데모 시나리오 A~D·체크리스트
- `apps/showcase/docs/plan/03-information-architecture.md` — URL·페이지 IA·배포
- `apps/showcase/docs/plan/04-nexacro-comparison.md` — Nexacro 대비·FAQ
- `apps/showcase/docs/plan/05-demo-integration.md` — demo 연동·Guest·딥링크 스펙
- `apps/showcase/docs/plan/06-gaps-and-roadmap.md` — Gap·Phase 1~3 로드맵

배경:

- `apps/demo` 강화 vs `apps/showcase` 분리 논의 결과, PM 수주용 showcase + demo 재사용 하이브리드 방향 확정.
