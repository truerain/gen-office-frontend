# GenOffice Frontend

GenOffice Frontend는 기업용 백오피스 개발을 빠르게 시작하기 위한 React 기반 프론트엔드 프레임워크입니다.

이 리포지토리는 공통 UI, 테마, 데이터 그리드, CRUD 그리드, 차트, MDI 레이아웃, 데모 앱을 하나의 pnpm 모노레포로 관리합니다. 이미 수행한 프로젝트 경험을 공통 자산으로 정리하고, 이후 여러 백오피스 프로젝트에서 재사용할 수 있는 패키지 경계를 만드는 것이 목표입니다.

## 기술 스택

| 항목 | 툴 / 버전 |
| --- | --- |
| 프레임워크 | React 18 |
| 언어 | TypeScript 5.7 |
| 빌드 | Vite, Turbo |
| 패키지 관리 | pnpm 9, pnpm workspace |
| 모노레포 관리 | Turbo, Nx |
| 문서화 / 컴포넌트 개발 | Storybook 8 |
| UI 기반 | Radix UI |
| 데이터 테이블 | TanStack Table |
| 차트 | visx |

## 요구 사항

- Node.js 20 이상
- pnpm 9 이상

```bash
pnpm install
```

## 빠른 시작

데모 앱 실행:

```bash
pnpm dev
```

Mock 모드 데모 앱 실행:

```bash
pnpm demo:mock
```

Storybook 실행:

```bash
pnpm storybook
```

전체 빌드:

```bash
pnpm build
```

Lint:

```bash
pnpm lint
```

Test:

```bash
pnpm test
```

## AI 코딩

AI 코딩 도구를 사용할 때는 작업 시작 전에 [AGENTS.md](./AGENTS.md)를 기준 지침으로 참조하세요.

`AGENTS.md`는 Codex, ChatGPT, Claude, Gemini, Cursor, Copilot 같은 여러 모델과 도구에서 동일하게 적용할 수 있는 공통 규칙 문서입니다. 다른 도구 전용 지침 파일을 추가하더라도 패키지 경계, 문서화 규칙, 검증 명령, 인코딩 규칙은 `AGENTS.md`와 충돌하지 않게 유지해야 합니다.

## 리포지토리 구조

```text
apps/
  demo/           GenOffice 통합 데모 앱
  storybook-all/  패키지 문서화와 시각 테스트를 위한 Storybook 앱

packages/
  theme/          디자인 토큰, 글로벌 스타일, 폰트
  ui/             공통 UI 컴포넌트
  utils/          공통 유틸리티
  mdi/            Multiple Document Interface 레이아웃
  gen-grid/       TanStack Table 기반 데이터 그리드
  gen-grid-crud/  그리드 기반 CRUD 기능
  gen-grid-chart/ 그리드와 차트 연동 기능
  gen-chart/      차트 컴포넌트
  gen-datagrid/   데이터 그리드 실험 또는 대체 구현 영역
  tsconfig/       공유 TypeScript 설정

docs/             아키텍처, 기능, 운영 가이드 문서
scripts/          저장소 관리 및 코드 생성 스크립트
```

## 패키지 경계

기본 방향은 아래 의존성 흐름을 유지하는 것입니다.

```text
apps -> feature packages -> ui -> theme/utils
```

- `theme`은 색상, 폰트, 전역 스타일 같은 디자인 기반을 제공합니다.
- `ui`는 버튼, 입력, 다이얼로그, 선택 컴포넌트처럼 도메인에 묶이지 않는 범용 UI를 제공합니다.
- `gen-grid`, `gen-grid-crud`, `gen-chart`, `mdi`는 백오피스 기능 단위 패키지입니다.
- 앱은 필요한 패키지를 조합해서 실제 프로젝트 화면과 라우팅을 구성합니다.

기능이 커지거나 외부 엔진 의존성이 큰 컴포넌트는 `ui`에 계속 넣기보다 별도 기능 패키지로 분리하는 것을 우선 검토합니다. 예를 들어 HTML Editor는 TipTap/ProseMirror 계열 의존성, sanitize 정책, toolbar command, serialize/parse 규칙을 함께 다루므로 장기적으로 `@gen-office/html-editor` 같은 별도 패키지 후보입니다.

## 주요 스크립트

| 명령어 | 설명 |
| --- | --- |
| `pnpm dev` | `@gen-office/demo` 개발 서버 실행 |
| `pnpm demo` | 데모 앱 개발 서버 실행 |
| `pnpm demo:mock` | Mock 모드로 데모 앱 실행 |
| `pnpm storybook` | 통합 Storybook 실행 |
| `pnpm build` | 전체 워크스페이스 빌드 |
| `pnpm lint` | 전체 워크스페이스 lint |
| `pnpm test` | 전체 워크스페이스 테스트 |
| `pnpm format` | TypeScript, React, Markdown, JSON, CSS 포맷 |
| `pnpm graph` | Nx dependency graph 실행 |
| `pnpm tokens:map` | 디자인 토큰 매핑 생성 |
| `pnpm check:encoding` | 파일 인코딩 검사 |
| `pnpm hooks:install` | Git hooks 경로 설정 |

## 문서

기존 세부 문서는 `docs/` 아래에 있습니다.

- `docs/app_guide/`: 앱 구성 가이드
- `docs/demo/`: 데모 앱 관련 문서
- `docs/gen-grid/`: GenGrid 문서
- `docs/gen-chart/`: GenChart 문서
- `docs/gen-grid-chart/`: Grid/Chart 연동 문서
- `docs/ui/`: UI 패키지 문서

주요 단일 문서:

- `docs/01.BUILD_GUIDE.md`
- `docs/DYNAMIC_LOADING_GUIDE.md`
- `docs/DATA_DRIVEN_MENU.md`
- `docs/MDI_DEMO_GUIDE.md`
- `docs/VITE_PATH_CONFIG.md`
- `docs/validation.md`
- `docs/다국어지원.md`

## 개발 원칙

- 공통 패키지는 프로젝트별 요구사항보다 재사용 가능한 백오피스 패턴을 우선합니다.
- 앱 전용 정책, API 계약, 화면 조합은 `apps/*`에 둡니다.
- 기능 패키지는 명확한 책임을 가져야 하며, 큰 외부 의존성을 무분별하게 `ui`에 추가하지 않습니다.
- 패키지 간 순환 의존성을 만들지 않습니다.
- 새 패키지를 만들 때는 `package.json`, `src/index.ts`, 빌드 설정, Storybook 또는 데모 진입점을 함께 정리합니다.

## 정리 예정 항목

- 루트 문서와 `docs/` 문서의 목차 체계 정리
- 각 패키지 README 보강
- `ui` 패키지에 들어온 editor 관련 의존성의 패키지 분리 검토
- `gen-datagrid`와 `gen-grid`의 역할 구분 명확화
- 데모 앱을 프로젝트 샘플과 프레임워크 쇼케이스 영역으로 분리
- 패키지별 public API와 import convention 정리
