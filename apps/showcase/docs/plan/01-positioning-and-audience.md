<!-- apps/showcase/docs/plan/01-positioning-and-audience.md
Defines product positioning and target audience for GenOffice Showcase.
-->

# 01. 포지셔닝과 대상

## 1. Showcase란 무엇인가

GenOffice Showcase는 **수주·제안 미팅용 제품 데모**입니다.

- 개발자용 API 문서(Storybook)도, 내부 검증용 통합 앱(`apps/demo`)도 아닙니다.
- PM이 15~30분 안에 **“Nexacro로 하던 백오피스를 GenOffice로 전환할 수 있다”**는 확신을 주는 것이 목표입니다.
- 인터랙티브 CRUD·MDI·그리드는 `apps/demo`를 재사용하고, Showcase는 **내러티브·비교·시나리오 진입**을 담당합니다.

## 2. 1차 대상: 원청 PM

| 관심사 | Showcase가 답해야 할 질문 |
| --- | --- |
| 기능 동등성 | Grid CRUD, MDI, 팝업, Excel, 권한·메뉴가 Nexacro·유사 레거시와 비슷한가? |
| 생산성 | Reference·표준 패턴으로 오히려 더 빨리 만들 수 있는가? |
| AI·개발 방식 | 바이브 코딩·AI 에이전트와 함께 쓸 수 있는 구조인가? |
| 일정·리스크 | Reference App과 표준 패키지로 납기를 줄일 수 있는가? |
| TCO·인력 | React 대중성, 런타임 제거, 미래 유지보수 비용은? |
| 설득 자료 | 발주처 미팅에서 바로 돌려볼 수 있는 URL이 있는가? |

PM은 Showcase를 **슬라이드 대신 “돌아가는 백오피스”**로 사용합니다.

## 3. 2차 대상: 발주처 이해관계자

PM이 Showcase를 통해 간접적으로 설득해야 하는 대상입니다.

```text
원청 PM
  ├─ 발주처 IT 담당     → 기능 동등성, 보안, 운영, 아키텍처
  ├─ 발주처 현업        → MDI 업무 흐름, 그리드 속도, 검색·CRUD
  └─ 경영·구매          → 비용, 일정, 리스크 (주로 PM 브리핑·ROI 슬라이드)
```

Showcase 본체는 **IT + 현업**을 동시에 만족시키는 데 집중합니다. 경영진용 ROI는 Showcase 내 요약 페이지 + PM용 별도 자료로 보완합니다.

## 4. 핵심 메시지

### Hook (랜딩 카피 방향)

> Nexacro로 하던 백오피스를, 업무 패턴은 유지하고 React 표준으로 — 레거시와 같거나 더 빠르게, AI와 함께, 더 넓은 생태계로.

### 설득 포인트 (PM → 발주처)

Showcase·제안 미팅에서 **반드시 전달할 5가지**입니다. 순서는 대상에 따라 조정합니다.

#### 1. 레거시와의 익숙함 — “업무 화면은 그대로”

Nexacro·DevExpress·eGovFrame UI 등 **SI 백오피스 PM이 익숙한 패턴**을 그대로 제공합니다.

| 레거시에서 익숙한 것 | GenOffice |
| --- | --- |
| WorkFrame / MDI | `@gen-office/mdi` — 멀티탭, 상태 유지 |
| Grid + Dataset CRUD | `@gen-office/gen-grid-crud` |
| 검색·팝업·Form | `@gen-office/ui` FilterBar, Dialog, PopupInput |
| 메뉴·권한·공통코드 | Reference App admin 화면 |

**Showcase 시연:** 시나리오 A (Admin CRUD) — “현업·IT가 첫 화면부터 낯설지 않다.”

#### 2. 더 높은 생산성 — “비슷한 수준을 넘어서”

동등성만 주장하지 않고, **표준화된 조립**으로 화면당 공수를 줄이는 narrative를 씁니다.

- **Reference App** — 사용자·권한·메뉴·공통코드·i18n을 복붙·커스터마이즈 출발점으로 제공
- **GenGridCrud** — 조회·추가·수정·일괄저장·Export를 한 패턴으로 통일
- **데이터 기반 메뉴** — DB `execComponent` + lazy registry로 화면 추가 범위 축소
- **Monorepo 패키지** — `@gen-office/*` 경계가 명확해 팀 단위 병렬 개발에 유리

**PM 멘트:** “Nexacro Form을 매번 새로 짜던 것보다, CRUD·MDI·운영 화면은 **이미 검증된 블록**에서 시작합니다.”

#### 3. AI 하네스 — “바이브 코딩·에이전트 개발을 전제로 설계”

GenOffice는 단순 UI kit이 아니라 **AI 코딩 도구(Cursor, Copilot, Codex 등)가 맥락을 잡고 코드를 생성하기 쉬운 하네스** 역할을 합니다.

| 하네스 요소 | PM·IT에게 의미 |
| --- | --- |
| `AGENTS.md` + 패키지 경계 규칙 | 에이전트가 “어디에 무엇을 넣을지” 일관되게 따름 |
| Reference App·구현 로그·docs | Few-shot 예시·아키텍처 맥락 제공 |
| TypeScript + 명확한 public API | AI 생성 코드의 타입·검증 안정성 |
| 표준 CRUD·메뉴 패턴 반복 | “비슷한 화면 하나 더”를 AI-assisted로 빠르게 확장 |

**바이브 코딩(vibe coding)** — PM-facing 표현으로는 “자연어·대화형 AI로 화면·로직 초안을 빠르게 만들고, 프레임워크 가드레일 안에서 검증·통합” 정도로 설명합니다. Showcase 데모 자체보다 **개발 생산성·일정 단축** 논거로 씁니다.

**주의:** “AI가 전부 대체”가 아니라 “**프레임워크 + Reference + AI**로 SI 생산성을 한 단계 올린다”가 안전한 메시지입니다.

#### 4. React 대중성 — “가장 넓은 개발 생태계”

- **React**는 엔터프라이즈·SI·스타트업을 아우르는 **사실상 표준** 프론트 스택
- Nexacro 전문 인력 pool 축소 vs **React/TS SI·정규직·외주** 수급 용이
- 서드파티 라이브러리, 채용, 교육, 커뮤니티, 레퍼런스 자료가 풍부
- 발주처 IT도 “벤더 종속 UI Runtime”보다 **오픈하고 검증된 스택** 선호 경향

**PM 멘트:** “납품 후 유지보수· 추가 개발 인력을 **시장에서 구하기 쉽습니다**.”

#### 5. 미래지향성 — “Runtime은 레거시, 웹 표준은 표준”

| 레거시 SI UI | GenOffice |
| --- | --- |
| 전용 Runtime·ActiveX 이력 | **브라우저만** — 설치·버전 배포 부담 ↓ |
| 벤더 lock-in Script/Form | TypeScript, ESM, Vite — **웹 플랫폼 표준** |
| 구형 브라우저·호환 이슈 | Chromium 계열 현대 브라우저 전제 |
| AI·DevOps 도구 연계 약함 | Git, CI, Storybook, AI 에이전트와 **같은 toolchain** |

**PM 멘트:** “5년 뒤에도 **표준 웹 + React**로 유지보수·확장하는 쪽이 TCO·리스크 모두 유리합니다.”

### 3 Pillars (랜딩·슬라이드 요약용)

위 5가지를 슬라이드·Hero에 압축할 때:

1. **익숙한 업무 UX** — Nexacro급 MDI·CRUD·운영 패턴
2. **더 빠른 납품** — Reference + 표준 패키지 + AI 하네스
3. **React 표준·미래 대응** — 대중성, 인력, 웹 표준, Runtime 제거

### 피해야 할 포지셔닝

| ❌ 하지 말 것 | ✅ 대신 강조할 것 |
| --- | --- |
| “UI 컴포넌트 라이브러리 모음” | “SI 납품형 BackOffice 프레임워크 + AI 하네스” |
| Storybook부터 보여주기 | Reference App + 시나리오 데모 |
| 로그인·빈 홈으로 시작 | Guest 원클릭 체험 |
| Nexacro 100% 동일 주장 | **비슷하거나 더 생산적인** 핵심 80% + React 확장 |
| “AI가 개발팀을 대체” | “AI-assisted + 가드레일 있는 프레임워크” |

## 5. Showcase vs Demo vs Storybook

| | `apps/showcase` | `apps/demo` | `apps/storybook-all` |
| --- | --- | --- | --- |
| **목적** | 수주·제안 설득 | 개발 레퍼런스·내부 검증 | 컴포넌트 API·변형 문서 |
| **첫 화면** | 30초 내 백오피스 체험 | 로그인 → MDI | 컴포넌트 목록 |
| **톤** | 한국어, 업무 도메인, ROI | 개발·패키지 중심 | 개발자 문서 |
| **깊이** | 시나리오 3~5개 | 전 메뉴·기능 데모 | 단일 컴포넌트 |
| **배포** | 공개 URL, PM 공유 | mock/API, 사내 | 사내·문서 |

### 권장 구조

```text
apps/showcase (얇은 마케팅·시나리오 셸)
       │
       ├─ 정적: 가치 제안, Nexacro 비교, 아키텍처, 마이그레이션
       └─ 인터랙티브: apps/demo (mock) 임베드 또는 딥링크
```

**원칙:** Showcase에서 CRUD 화면을 새로 만들지 않는다. CRUD·MDI·그리드의 단일 SSOT는 `apps/demo`이다.

## 6. 성공 기준

| 지표 | Phase 1 목표 |
| --- | --- |
| PM 미팅 진입 | 로그인 없이 30초 내 MDI 체험 |
| 시나리오 공유 | URL 1개로 Admin CRUD 데모 재현 |
| 설득 포인트 | 레거시 UX 동등 + 생산성·AI·React·미래지향 5축 전달 |
| 운영 | mock-only 배포, 백엔드·VPN 불필요 |
