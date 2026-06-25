<!-- apps/showcase/docs/plan/05-demo-integration.md
Specifies how apps/showcase integrates with apps/demo for interactive demos.
-->

# 05. Demo 연동 스펙

Showcase는 인터랙티브 기능을 `apps/demo`에 위임합니다. 본 문서는 **연동 계약**과 **demo 측 필요 변경**을 정의합니다.

## 1. 원칙

| 원칙 | 설명 |
| --- | --- |
| **Single SSOT** | CRUD·MDI·그리드 화면은 demo만 유지 |
| **mock-only** | Showcase 경로는 MSW mock, 백엔드·VPN 불필요 |
| **Guest first** | 로그인 없이 30초 내 MDI 진입 |
| **Scenario deep link** | URL **진입** 시 `page` / `scenario`로 메뉴·탭 오픈 |
| **History** | **미관리** — 진입 이후 탭 조작과 URL·브라우저 히스토리 무연동 |

## 2. Demo 재사용 목록

### 시나리오 A — Admin CRUD

| 컴포넌트 | 경로 |
| --- | --- |
| `UserManagementPage` | `apps/demo/src/pages/admin/user/` |
| `RoleManagementPage` | `apps/demo/src/pages/admin/role/` |
| `MenuManagementPage` | `apps/demo/src/pages/admin/menu/` |
| `UserRoleManagementPage` | `apps/demo/src/pages/admin/user-role/` |

### 시나리오 B — Finance Grid

| 컴포넌트 | 경로 |
| --- | --- |
| `CoActualsPage` | `apps/demo/src/pages/co/actuals/` |
| `DashboardDemoPage` | `apps/demo/src/pages/demo/dashboard/` |
| `ChartDemoPage` | `apps/demo/src/pages/demo/chart/` |

### 시나리오 C — Platform

| 컴포넌트 | 경로 |
| --- | --- |
| `LkupManagementPage` | `apps/demo/src/pages/admin/lkup/` |
| `MessageManagementPage` | `apps/demo/src/pages/admin/message/` |
| `NoticeManagementPage` | `apps/demo/src/pages/admin/notice/` |
| `MenuManagementPage` | `apps/demo/src/pages/admin/menu/` |

### 공통 셸

| 기능 | 위치 |
| --- | --- |
| MDI | `@gen-office/mdi`, `App.tsx` |
| TitleBar / 메뉴 | `TitleBarLayout.tsx`, `menuData.ts` |
| Mock API | `apps/demo/src/mocks/` |
| Lazy registry | `componentRegistry.dynamic.ts` |

## 3. URL 계약 (진입 전용)

URL은 **앱 최초 진입(및 새로고침)** 에만 해석합니다. MDI 탭 전환·닫기는 URL·History를 변경하지 않습니다.

### Query parameters

| Param | 값 | 동작 (진입 시 1회) |
| --- | --- | --- |
| `page` | `menuId` (예: `900100`, `home`) | 해당 메뉴 탭 `addTab` + 활성화 |
| `scenario` | `admin-crud` \| `finance-grid` \| `platform` | preset 탭 목록 순서대로 오픈 |
| `page` + `scenario` | 동시 사용 | scenario 탭 오픈 후 `page` 활성화 |

`mode=showcase`, `guest=1` — showcase 빌드에서는 기본(로그인 없음)이므로 **선택·deprecated** 가능.

### History

- `pushState` / `replaceState` / `popstate` **사용하지 않음**
- 브라우저 뒤로가기 → MDI 탭이 아닌 **이전 문서**(소개 `/` 등)로 이동

### 예시

```text
https://showcase.genoffice.vercel.app/app?page=900100
https://showcase.genoffice.vercel.app/app?scenario=admin-crud
https://showcase.genoffice.vercel.app/app?scenario=admin-crud&page=900300
```

## 4. Scenario → 탭 매핑

```typescript
// 목표 스펙 (apps/demo에 구현 예정)
const showcaseScenarios = {
  'admin-crud': [
    { menuId: '900100', component: 'UserManagementPage', title: '사용자관리' },
    { menuId: '900300', component: 'RoleManagementPage', title: '권한관리' },
    { menuId: '900200', component: 'MenuManagementPage', title: '메뉴관리' },
  ],
  'finance-grid': [
    { menuId: '700100', component: 'CoActualsPage', title: 'CO 실적' },
    { menuId: '990800', component: 'ChartDemoPage', title: 'Chart' },
  ],
  'platform': [
    { menuId: '900600', component: 'LkupManagementPage', title: '공통코드' },
    { menuId: '900500', component: 'MessageManagementPage', title: '메시지' },
    { menuId: '900400', component: 'NoticeManagementPage', title: '공지' },
  ],
} as const;
```

메뉴 ID는 mock `app_menus` 데이터와 일치해야 합니다. 불일치 시 `componentName` fallback (`menuData.ts`) 사용.

## 5. Guest mode 동작

### 진입

1. `mode=showcase` 감지
2. 로그인 화면 스킵
3. mock 사용자 세션 주입 (예: `ROLE_ADMIN`, 표시명 “데모 사용자”)
4. MSW 활성 (`pnpm demo:mock` 동등)

### UI 옵션 (Phase 1 vs 2)

| 항목 | Phase 1 | Phase 2 |
| --- | --- | --- |
| 로그인 스킵 | ✅ | ✅ |
| TitleBar 유지 | ✅ | ✅ |
| Showcase 배너 (“데모 모드”) | ❌ | ✅ optional |
| 가이드 툴팁 | ❌ | ✅ |
| Layout settings | ✅ | ✅ |

## 6. Showcase → Demo 연결 방식

| 방식 | 장점 | 단점 | Phase |
| --- | --- | --- | --- |
| **새 탭 리다이렉트** | 구현 단순, demo 독립 배포 | Showcase↔Demo 전환 끊김 | **1** |
| **iframe embed** | 한 페이지 내 가이드+데모 | 높이·postMessage, SSO | 2 |
| **동일 monorepo dev proxy** | 로컬 개발 편의 | prod는仍 분리 | dev only |

Phase 1 권장: 시나리오 페이지에서 **“체험 시작 (새 창)”** → demo URL.

## 7. 빌드·배포

### Demo showcase 프로파일

```bash
# 목표 (package.json scripts 추가 예정)
pnpm -C apps/demo build:showcase   # VITE_MSW=1, VITE_SHOWCASE=1
```

| Env | 용도 |
| --- | --- |
| `VITE_MSW=true` | mock API |
| `VITE_SHOWCASE=true` | Guest mode 기본 활성 |

### 배포

- Showcase: Vercel static
- Demo (showcase): 별도 Vercel project, mock-only
- CORS: iframe 사용 시 demo가 showcase origin 허용

## 8. 로컬 개발

```bash
# 터미널 1
pnpm -C apps/demo demo:mock

# 터미널 2 (showcase 스캐폴딩 후)
pnpm -C apps/showcase dev
```

Showcase `.env.local`:

```env
VITE_DEMO_URL=http://localhost:5173
```

## 9. 구현 체크리스트 (demo 측)

- [ ] **진입** query `page` / `scenario` 파싱 → `handleOpenPage` (History API 없음)
- [ ] Guest mock user + menu load (로그인 UI 제거)
- [ ] `build:showcase` script
- [ ] mock menu ID ↔ scenario mapping 검증
- [ ] (Phase 2) showcase 배너 / guide overlay hook

## 10. 구현 체크리스트 (showcase 측)

- [ ] Vite app 스캐폴딩 (`apps/showcase`)
- [ ] IA 페이지 (Phase 1: `/`, `/compare/nexacro`, `/scenarios/admin-crud`, `/play`)
- [ ] `VITE_DEMO_URL` 기반 demo 링크 생성
- [ ] `@gen-office/theme` 공유 (브랜딩 일치)
