<!-- apps/showcase/docs/plan/07-mvp-decisions.md
Records confirmed MVP decisions and plain-language notes for GenOffice Showcase.
-->

# 07. MVP 의사결정 (확정)

PM·개발 착수 전 확정한 선택과, **아직 고를 것**을 쉬운 말로 정리합니다.

## 확정된 결정 (2026-06-19)

### 1. 배포·접근

| 항목 | 결정 |
| --- | --- |
| 공개 범위 | **완전 공개** (누구나 URL 접속) |
| 호스팅 | **Vercel** |
| 데이터 | **전부 mock** (MSW, 가짜 API·DB) |
| 도메인 | **단일 주소** — `showcase.genoffice.vercel.app` (showcase·체험 앱 모두 이 주소 아래) |
| 빌드 | **`apps/showcase`** 에서 Vercel 배포 설정·새 빌드 파이프라인 |

**한 줄:** “하나의 공개 사이트, 가짜 데이터만, Vercel에 올린다.”

#### 단일 도메인 안에서 페이지 나누기 (구현 안)

같은 `showcase.genoffice.vercel.app` 안에서 역할만 나눕니다.

```text
/                    소개·Nexacro 비교·시나리오 안내  (showcase 앱)
/app/                MDI 백오피스 체험                 (demo showcase 빌드)
```

- Vercel에서 showcase 빌드 + demo(showcase용) 빌드를 **한 프로젝트**로 묶거나, showcase `vercel.json` rewrite로 `/app` → demo 산출물 연결
- PM이 공유하는 “체험 URL” 예: `https://showcase.genoffice.vercel.app/app?page=900100`

### 2. URL → MDI (진입 전용, History 없음)

| 항목 | 결정 |
| --- | --- |
| **진입** | URL로 **직접 들어오면** 해당 `menuId` 메뉴(탭)를 실행 |
| **History** | **관리하지 않음** — `pushState` / `popstate` / 탭 전환 시 URL 갱신 없음 |
| **구현 위치** | **`apps/demo`** (showcase 프로파일). `@gen-office/mdi` 패키지는 비변경 |
| **목표** | PM·Showcase가 **공유 URL**로 특정 화면 데모 진입. 앱 안에서 탭 이동은 MDI만 담당 |

**동작 요약**

1. `/app?page=900100` 접속 → Home(기본) + **사용자관리** 탭 오픈·활성
2. `/app?scenario=admin-crud` 접속 → 시나리오에 정의된 탭들을 **최초 1회** 오픈
3. 이후 메뉴·탭 클릭 → MDI만 변경, **주소창·브라우저 히스토리는 건드리지 않음**
4. 브라우저 **뒤로가기** → 이전 사이트·소개 페이지로 이동 (탭 히스토리 아님)

### 3. 보안·로그인

| 항목 | 결정 |
| --- | --- |
| 로그인 | **없음** — Login 페이지 제거 |
| 인증 API | showcase 빌드에서는 `getMe` 등 **mock 고정 사용자**로 바로 MDI 진입 |
| 의미 | “데모용 공개 사이트”이므로 세션·CSRF는 mock 수준만 유지 |

---

## URL 형식 (확정)

```text
/app?page=900100
/app?scenario=admin-crud
/app?scenario=admin-crud&page=900300
```

| 파라미 | 시점 | 동작 |
| --- | --- | --- |
| `page` | **앱 최초 진입** | `menuId`에 해당하는 메뉴 탭 `addTab` + 활성화 |
| `scenario` | **앱 최초 진입** | preset 탭 목록 순서대로 오픈 |
| `page` + `scenario` | **앱 최초 진입** | scenario 탭 오픈 후 `page`를 활성 탭으로 |

- `page` 값 = MDI 탭 id = `menuId` (예: `900100`, `home`)
- **새로고침** 시 URL을 다시 읽어 동일하게 진입 (그동안 연 다른 탭은 복원하지 않음)
- 검색 조건·그리드 편집 상태는 URL에 **넣지 않음**

### History 정책 (확정)

| 하지 않음 | 이유 |
| --- | --- |
| `history.pushState` | 탭마다 뒤로가기 스택 쌓지 않음 |
| `popstate` 핸들러 | MDI와 브라우저 히스토리 이중 상태 방지 |
| 탭 전환·닫기 시 URL 변경 | “공유용 진입 URL”과 런타임 UX 분리 |

브라우저 **뒤로가기** → MDI 탭이 아니라 **소개 `/`·이전 사이트**로 이동.

---

## “이해 못 하겠던 구분” — 쉬운 말로

앞서 제안했던 항목 중, **이미 위에서 정해진 것**과 **나중에 해도 되는 것**만 구분합니다.

| 예전에 쓴 말 | 쉬운 뜻 | 지금 |
| --- | --- | --- |
| Guest mode | 로그인 없이 바로 체험 | ✅ 로그인 제거로 확정 |
| mock-only | 진짜 서버·DB 없이 가짜 데이터 | ✅ 확정 |
| iframe vs 리다이렉트 | 소개 페이지 안에 체험 넣기 vs 주소만 이동 | ✅ **단일 도메인 `/app`** 으로 통합 |
| Phase 1 페이지 범위 | 첫 버전에 만들 소개 페이지 개수 | ⏳ 구현 시작할 때 `/`, `/compare/nexacro`, `/app` 최소 3개 권장 |
| white-label | 발주처 이름·로고 바꿔 보여주기 | ⏳ 나중 (Phase 3) |
| analytics | 누가 어떤 URL 봤는지 통계 | ⏳ 나중 |
| Storybook footer | 개발자용 컴포넌트 문서 링크 | ⏳ 공개 사이트에 넣을지 나중 결정 |
| CI smoke test | 배포 전 “URL 열면 탭 뜨는지” 자동 검사 | ⏳ 구현 후 추가 권장 |

**지금 꼭 정할 것 (남은 1가지)**

1. **첫 버전 소개 페이지** — 최소 `/` + Nexacro 비교 + `/app` 체험만 할지, 시나리오 안내 페이지까지 할지

---

## demo(showcase) 빌드에서 바뀔 코드 (요약)

- `LoginPage` 분기 제거 → 항상 mock user + MDI
- `useMdiUrlEntry` (가칭): **최초 진입** 시 query `page` / `scenario` → `handleOpenPage` (History API 미사용)
- `build:showcase` — `VITE_MSW=true`, 로그인 비활성
- menuId = 탭 id (기존과 동일)

---

## 관련 문서

- 연동 상세: [05-demo-integration.md](./05-demo-integration.md)
- IA: [03-information-architecture.md](./03-information-architecture.md)
- Showcase 결정 로그: `apps/showcase/docs/logs/decisions.md`
