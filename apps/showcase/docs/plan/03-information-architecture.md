<!-- apps/showcase/docs/plan/03-information-architecture.md
Defines URL structure, page IA, and navigation for GenOffice Showcase.
-->

# 03. 정보 구조 (IA)

Showcase는 PM이 **시나리오 URL 하나**만 공유해도 미팅이 진행되도록 단순한 IA를 유지합니다.

## 1. URL 구조

```text
/                              랜딩 (가치 제안 + "데모 시작")
/compare/nexacro               Nexacro vs GenOffice 비교
/scenarios                     시나리오 선택 (A/B/C 카드)
/scenarios/admin-crud          시나리오 A → demo 연동
/scenarios/finance-grid        시나리오 B → demo 연동
/scenarios/platform            시나리오 C → demo 연동
/architecture                  패키지·백엔드 연동·배포 (정적)
/migration                     전환 로드맵·PM 체크리스트 (정적)
/play                          전체 demo Guest 진입 (mock 고정)
```

### Demo 연동 URL (apps/demo, `/app` 하위)

```text
/app?page=900100
/app?scenario=admin-crud
/app?scenario=admin-crud&page=900300
```

- **진입 시에만** query 해석 → 해당 메뉴·시나리오 탭 오픈
- 탭 전환·History API 연동 **없음**

## 2. 페이지별 섹션

### `/` 랜딩

| 섹션 | 내용 |
| --- | --- |
| Hero | Hook 카피, “데모 시작” CTA |
| 3 Pillars | 익숙한 UX / 검증된 조립 / 현대 스택 |
| 시나리오 카드 | A·B·C 요약 + 링크 |
| 신뢰 | Reference App, 패키지 목록, 기술 스택 뱃지 |
| Footer | GitHub, docs, Storybook (내부용 링크는 선택) |

### `/compare/nexacro`

| 섹션 | 내용 |
| --- | --- |
| 기능 비교표 | MDI, Grid CRUD, 메뉴·권한, Excel, Chart 등 |
| TCO | 런타임·라이선스·브라우저 (정성 + PM placeholder) |
| 리스크 | 전환 로드맵, 병행 운영 |
| CTA | 시나리오 A로 이동 |

### `/scenarios`

| 섹션 | 내용 |
| --- | --- |
| 시나리오 A | 15분, Admin CRUD, 대상, 체크리스트 |
| 시나리오 B | 20분, Finance Grid |
| 시나리오 C | 30분, Platform |
| 시나리오 D | ROI — `/migration`, `/compare/nexacro` 링크 |

### `/scenarios/{id}`

| 섹션 | 내용 |
| --- | --- |
| 시나리오 개요 | 시간, 대상, 성공 기준 |
| 단계별 가이드 | `02-demo-scenarios.md` 요약 |
| “체험 시작” | demo 딥링크 |
| Nexacro 매핑 | 해당 화면 ↔ Nexacro 개념 |

### `/architecture`

| 섹션 | 내용 |
| --- | --- |
| Monorepo 구조 | apps / packages 의존 방향 |
| 핵심 패키지 | mdi, gen-grid-crud, theme, ui |
| 백엔드 연동 | REST, 세션, CSRF, 메뉴 API |
| 배포 | Vite SPA, Vercel, mock 프로파일 |

### `/migration`

| 섹션 | 내용 |
| --- | --- |
| 전환 원칙 | 화면 단위, 병행 운영 |
| Phase 템플릿 | 분석 → POC → 파일럿 → 전환 |
| PM 체크리스트 | 발주처별 커스터마이즈 가능 |
| Gap 요약 | `06-gaps-and-roadmap.md` 링크 |

## 3. 네비게이션

### 글로벌 Nav (최대 5~7항목)

```text
GenOffice Showcase | 시나리오 | Nexacro 비교 | 아키텍처 | 전환 가이드 | [데모 시작]
```

- **데모 시작** — `/play` 또는 시나리오 A demo 딥링크
- 모바일: 햄버거 메뉴, CTA는 상단 고정

### 시나리오 페이지 내

- 좌: 단계별 가이드 (sticky, 선택)
- 우: demo iframe 또는 “새 창에서 열기” 버튼

## 4. 콘텐츠 언어

| 영역 | 언어 |
| --- | --- |
| Showcase UI·카피 | **한국어** (PM·발주처 미팅) |
| Demo 화면 라벨 | 기존 demo i18n (KO 기본) |
| 기술 용어 | MDI, CRUD, GenGrid 등 패키지명은 영문 유지 |

## 5. 배포·도메인 (안)

| 앱 | URL (예시) | 비고 |
| --- | --- | --- |
| Showcase | `showcase.genoffice.dev` | 정적 + 라우팅 |
| Demo (showcase용) | `demo.genoffice.dev` | mock-only 빌드 |

동일 origin이 필요하면 Showcase가 `/demo/*`를 proxy하는 방식도 가능하나, Phase 1에서는 **서브도메인 분리**를 권장합니다.

## 6. Phase별 IA 범위

| Phase | 포함 페이지 |
| --- | --- |
| **1 MVP** | `/`, `/compare/nexacro`, `/scenarios/admin-crud`, `/play` |
| **2** | B·C 시나리오, `/architecture`, `/migration` |
| **3** | white-label, analytics, PDF export |
