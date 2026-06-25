<!-- apps/showcase/docs/plan/06-gaps-and-roadmap.md
Documents known gaps, risks, and phased rollout for GenOffice Showcase.
-->

# 06. Gap과 로드맵

## 1. 알려진 Gap

Showcase·PM 미팅에서 **솔직히 인정하고 로드맵으로 답변**할 항목입니다.

| 발주처·Nexacro 기대 | GenOffice 현재 | Showcase 대응 |
| --- | --- | --- |
| Form Designer / 저코드 | 코드 기반 React | “표준 CRUD 템플릿으로 80% 단축” + 로드맵 |
| Report (OZ, Crownix 등) | Excel·Chart 중심 | `/architecture` 연동 슬라이드, Phase 2 |
| 대규모 Batch·스케줄 UI | admin CRUD 위주 | 백엔드·별도 모듈 설명 |
| AS-IS 1:1 UI | 불가 | `/migration` 화면 단위 전환 |
| Nexacro Dataset API | GenGridCrud API | `04-nexacro-comparison` + docs |
| Nexacro 전용 컴포넌트 100% | 없음 | 핵심 패턴 Reference + React 확장 |
| 오프라인·내부망 전용 Runtime | 없음 (SPA) | PWA·사내망 배포는 프로젝트 옵션 |

### PM용 한 줄

> 업무 백오피스 **핵심 80%**(MDI, CRUD, 권한, 메뉴, 공통코드)는 Reference로 즉시 제공하고, 리포트·특수 UI는 **표준 React + 연동**으로 확장합니다.

## 2. 리스크

| 리스크 | 영향 | 완화 |
| --- | --- | --- |
| demo·showcase 이중 유지 | 문서·URL drift | CRUD는 demo SSOT, showcase는 셸만 |
| mock과 실 API 차이 | 미팅 후 POC gap | “Reference는 mock, POC는 API 연동” 명시 |
| menu ID 불일치 | scenario 탭 실패 | mapping 테스트, CI smoke |
| 과장 마케팅 | 신뢰 손실 | Gap 표 공개, FAQ |
| 네트워크 의존 | 현장 데모 실패 | mock-only, `preview` 오프라인 리허설 |

## 3. Phase별 롤아웃

### Phase 1 — MVP (수주용 최소)

**목표:** PM이 URL 하나로 15분 Admin CRUD 미팅 수행.

| 항목 | 산출물 |
| --- | --- |
| Showcase | `apps/showcase` 스캐폴딩, `/`, `/compare/nexacro`, `/scenarios/admin-crud`, `/play` |
| Demo | Guest mode, `scenario=admin-crud`, mock 빌드 |
| 문서 | 본 plan 디렉터리, PM 체크리스트 (`02`) |
| 배포 | showcase + demo-showcase (Vercel) |

**예상 기간:** 2~3주 (1 FTE 기준, rough).

### Phase 2 — 시나리오 확장

| 항목 | 산출물 |
| --- | --- |
| 시나리오 B·C | finance-grid, platform 딥링크 |
| IA | `/architecture`, `/migration`, `/scenarios` 목록 |
| UX | iframe embed 검토, demo “데모 모드” 배너 |
| Demo | CO 실적·Platform 탭 mapping 검증 |

### Phase 3 — PM 도구화

| 항목 | 산출물 |
| --- | --- |
| white-label | 발주처명·로고 placeholder |
| analytics | 시나리오별 조회 (optional) |
| export | 마이그레이션 체크리스트 PDF |
| guide overlay | Nexacro ↔ 화면 툴팁 |

## 4. 성공 지표

| 지표 | Phase 1 | Phase 2+ |
| --- | --- | --- |
| Guest → MDI 진입 | ≤ 30초 | ≤ 15초 |
| scenario URL 탭 오픈 | 3/3 (admin) | B·C 각 2+ 탭 |
| mock 백엔드 의존 | 0 | 0 |
| PM 미팅 리허설 | 내부 1회 | 발주처 파일럿 1회 |

## 5. 마이그레이션 로드맵 템플릿 (`/migration`)

PM이 발주처별로 채워 넣는 **전환 Phase** 템플릿입니다.

| Phase | 기간 (placeholder) | 활동 |
| --- | --- | --- |
| **0. 분석** | 2~4주 | AS-IS 화면 inventory, Nexacro→GenOffice 매핑 |
| **1. POC** | 2~3주 | 시나리오 A 화면 1~2개 API 연동 |
| **2. 파일럿** | 1~2개월 | admin + 핵심 업무 1 domain |
| **3. 전환** | 프로젝트별 | 화면 단위 cutover, 병행 운영 |
| **4. 안정화** | 1~2개월 | 성능, UAT, 교육 |

### 병행 운영 옵션

- Nexacro legacy + GenOffice 신규 화면 **동시 운영** (메뉴 분리)
- 도메인별 전환 (시스템관리 → 업무 → 리포트)
- API layer 공유, UI만 교체

## 6. 다음 작업 (구현 착수 순)

1. `apps/showcase` Vite 앱 스캐폴딩 + Phase 1 페이지
2. `apps/demo` Guest mode + scenario query handler
3. `demo build:showcase` + Vercel 2-project 배포
4. PM 내부 리허설 → `02-demo-scenarios` 체크리스트 보완

## 7. 의사결정 기록

| 결정 | 선택 | 이유 |
| --- | --- | --- |
| CRUD SSOT | `apps/demo` | 중복 구현 방지 |
| Showcase 형태 | Vite SPA (monorepo) | demo·패키지와 동일 toolchain |
| 배포 | Vercel, **완전 공개**, mock-only | PM URL 공유 |
| 도메인 | **단일** `showcase.genoffice.vercel.app` | `/` 소개 + `/app` 체험 |
| 빌드 진입 | **`apps/showcase`** | Vercel 프로젝트·파이프라인 |
| URL–MDI | **진입 전용** `page` / `scenario`, History **미관리** | 북마크·공유·새로고침 복원 |
| 인증 | **없음**, Login 제거 | 공개 데모 |
| 뒤로가기 | **확정** — History 미관리, 이전 페이지로 이동 | `07-mvp-decisions.md` |

상세: `apps/showcase/docs/plan/07-mvp-decisions.md`, `apps/showcase/docs/logs/decisions.md`
