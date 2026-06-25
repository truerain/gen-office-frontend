<!-- apps/showcase/docs/plan/README.md
Shows the index and reading order for GenOffice Showcase planning documents.
-->

# GenOffice Showcase 기획 문서

GenOffice Showcase(`apps/showcase`)는 SI 원청 PM이 발주처·내부 이해관계자에게 **Nexacro 등 레거시 프레임워크 대신 GenOffice를 적용**할 수 있음을 설득하기 위한 데모형 쇼케이스 앱의 기획 문서입니다.

## 문서 목록

| 문서 | 내용 |
| --- | --- |
| [01-positioning-and-audience.md](./01-positioning-and-audience.md) | 제품 포지셔닝, 대상, **5대 설득 포인트**(레거시·생산성·AI·React·미래) |
| [02-demo-scenarios.md](./02-demo-scenarios.md) | PM 데모 시나리오 A~D, 화면 흐름, 멘트 가이드 |
| [03-information-architecture.md](./03-information-architecture.md) | URL 구조, 페이지 IA, 네비게이션 |
| [04-nexacro-comparison.md](./04-nexacro-comparison.md) | Nexacro 대비 기능·TCO·리스크 비교 |
| [05-demo-integration.md](./05-demo-integration.md) | `apps/demo` 연동, URL–MDI, mock·무로그인 스펙 |
| [06-gaps-and-roadmap.md](./06-gaps-and-roadmap.md) | 알려진 Gap, Phase별 롤아웃 |
| [07-mvp-decisions.md](./07-mvp-decisions.md) | **MVP 확정 결정**·뒤로가기 선택·쉬운 용어 정리 |

## MVP 확정 (2026-06-19)

→ [07-mvp-decisions.md](./07-mvp-decisions.md)

- Vercel 완전 공개 · mock-only · `showcase.genoffice.vercel.app` **단일 도메인**
- 빌드·배포: **`apps/showcase`** (`/` 소개, `/app` MDI 체험)
- **진입 URL** `page` / `scenario` · **History 미관리**
- **보류:** 첫 버전 소개 페이지 범위

## 읽는 순서

1. **기획·PM** — `01` → `07` → `02` → `04`
2. **개발 착수** — `07` → `05` → `03` → `06`
3. **제안 미팅 직전** — `02` 시나리오 A

## 관련 리소스

- Reference App: `apps/demo`
- 컴포넌트 API 문서: `apps/storybook-all`
- 데이터 기반 메뉴: `docs/DATA_DRIVEN_MENU.md`
- Showcase 결정 로그: `apps/showcase/docs/logs/decisions.md`
- MDI 가이드: `docs/MDI_DEMO_GUIDE.md`
- CRUD 패턴: `docs/app_guide/crud.md`

## 상태

| 항목 | 상태 |
| --- | --- |
| Showcase 앱 스캐폴딩 | 미착수 |
| Demo showcase (`/app`, URL–MDI, 무로그인) | 미착수 |
| MVP 의사결정 | **07 확정** (뒤로가기만 보류) |

마지막 갱신: 2026-06-19
