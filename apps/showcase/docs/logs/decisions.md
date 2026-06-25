# Showcase 결정 로그

`apps/showcase` 및 showcase 배포·demo(showcase) 연동에 관한 **아키텍처·기술 선택**을 기록합니다.

- 리포지토리 전역 결정: `docs/logs/decisions.md`
- 기획·MVP 요약: `apps/showcase/docs/plan/07-mvp-decisions.md`

최신 항목을 위에 추가합니다.

## 2026-06-19 - URL 진입 전용, History 미관리

결정:

- URL **직접 진입** 시에만 MDI에 반영: `?page={menuId}` → 해당 메뉴 탭 실행·활성화.
- `?scenario=` → preset 탭을 **최초 진입 1회** 오픈 (선택적으로 `page`로 활성 탭 지정).
- **브라우저 History API는 사용하지 않음** — `pushState` / `popstate` 없음, 탭 전환·닫기 시 URL 갱신 없음.
- 뒤로가기는 MDI 탭이 아니라 **이전 페이지(소개·외부)** 로 이동.

이유:

- 공유·북마크용 **진입 URL**과 앱 내부 MDI UX를 분리해 구현을 단순화.
- History와 MDI 상태 이중 관리·불일치 리스크 제거.

영향:

- demo showcase: `useMdiUrlEntry`(가칭) — mount 시 query 파싱만.
- plan `05`, `07` URL 스펙에서 `tabs` 파라미·양방향 sync 제거.
- PM 공유 URL 예: `/app?page=900100`, `/app?scenario=admin-crud`.

## 2026-06-19 - Showcase MVP 배포·URL·로그인

결정:

- **배포:** Vercel 완전 공개, 전체 mock 데이터, 단일 도메인 `showcase.genoffice.vercel.app`.
- **빌드 진입:** `apps/showcase`에서 새 Vercel 빌드·배포 파이프라인. 같은 도메인 아래 `/` = 소개(showcase), `/app` = MDI 체험(demo showcase 프로파일).
- **URL–MDI:** 진입 시 `page` / `scenario`로 메뉴 실행 (History 미관리 — 위 항목).
- **인증:** 없음. Login 페이지 제거, mock 고정 사용자로 즉시 MDI 진입.

이유:

- PM·발주처에 URL 하나로 공개 데모 제공.
- Nexacro 대체 narrative에 “주소 공유·북마크” 필요.
- 데모 사이트는 보안 경계 없이 mock-only로 단순화.

영향:

- `apps/showcase` Vite 앱 + Vercel multi-output 또는 rewrite로 `/app` 연결.
- `apps/demo`에 `build:showcase`, Login 분기 제거, URL 진입 hook 추가.
- plan `05`, `07` — `/app` 경로·무로그인·진입 전용 URL 모델.

## 2026-06-19 - Showcase 결정 로그 위치

결정:

Showcase 관련 결정은 `apps/showcase/docs/logs/decisions.md`에 기록합니다. repo 루트 `docs/logs/decisions.md`와 분리합니다.

이유:

Showcase는 수주·데모용 앱으로 결정 범위가 frontend 전역과 다릅니다. 패키지별 구현 로그와 같은 패턴으로 앱 전용 로그를 둡니다.

영향:

- Showcase plan·구현 변경 시 본 파일을 갱신합니다.
- 리포지토리 전역(AGENTS, gen-grid 등) 결정은 `docs/logs/decisions.md`를 사용합니다.
