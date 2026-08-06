<!-- docs/debug/debug-tooling-backlog.md
GenOffice 디버깅 도구 후보 backlog. MVP(@gen-office/debug 훅) 밖의 아이디어를 나중에 재검토하기 위해 남긴다.
-->

# 디버깅 도구 backlog

이 문서는 공통 디버그 패키지 논의에서 나온 후보를 기록합니다.  
**지금 구현 범위가 아닙니다.** 수준·수요가 충분해졌을 때 다시 검토합니다.

관련 MVP: `@gen-office/debug` (`useDebugState`, `useRenderCount`, `useWhyRender`)

## 목표 상기

프레임을 쓰는 개발자에게 표준적이고 쉬운 디버그 경험을 제공한다.  
한 번에 모든 층을 만들지 않고, MVP(상태·리렌더 훅) 이후 필요한 것만 고른다.

## 명시적 제외

| 항목 | 메모 |
| --- | --- |
| Dialog / 팝업으로 상태·JSON 조회 | 유지비, 대용량 렌더, 패키지 경계 부담으로 제외 |

## 후보 목록

### 데이터셋 조회

- `useDebugDatasetState` — 행 배열을 등록하고 화면에서 DataGrid 등으로 조회
- 쟁점: `@gen-office/debug` → `gen-datagrid` 의존 vs 레지스트리만 debug / 뷰어는 앱
- 재검토 조건: 목록형 원본 데이터를 콘솔로 보기 어려운 경우가 반복될 때

### 덤프 헬퍼 (Dialog 대안)

- 클립보드 복사, JSON 파일 다운로드
- 재검토 조건: 대용량 스냅샷을 동료에게 전달·저장할 필요가 커질 때

### 디버그 게이트 / 채널 로거

- `VITE_DEBUG_*`, `localStorage`, `?debug=`, `createDebug('page'|'grid')`
- 재검토 조건: 훅·패키지 opt-in이 늘고 출력을 한 스위치로 묶어야 할 때

### 외부 DevTools 표준화

- React DevTools / Profiler (문서·온보딩)
- TanStack Query Devtools를 demo/템플릿에 기본 장착
- MSW 로그, (선택) Zustand devtools for MDI
- 재검토 조건: 온보딩 시 서버·캐시·트리 디버그가 반복적으로 막힐 때

### 셸 / 페이지 컨텍스트 프로브

- menuId, MDI 탭, route, i18n 언어 등 “지금 어디 화면인지”
- 재검토 조건: ad-hoc `console.group` 셸 로그가 앱마다 복제될 때

### 기능 패키지 opt-in

- `gen-grid-crud` / `gen-grid` / `gen-datagrid`: 표시 변환 전·내부 원본, 편집 세션, 컬럼·정렬·필터·선택
- Calendar / Chart 등 도메인 스냅샷
- 재검토 조건: 페이지 `useDebugState`로 넘긴 값과 그리드 내부 상태가 어긋나 디버그가 어려울 때

### 네트워크 · 오류 · 성능

- API 래퍼 DEV 로그, Error Boundary DEV UI
- effect 타이밍, 자체 Profiler 래퍼, `why-did-you-render` 라이브러리 도입
- 재검토 조건: 앱 인프라 표준이 필요할 때. 훅 MVP와 역할이 겹치면 문서만으로 둘 수 있음

### 프레임 가드레일

- 잘못된 grid/CRUD props·모드 조합에 대한 DEV `console.warn` 강화
- 재검토 조건: 같은 설정 실수가 이슈로 반복될 때

## MVP와의 관계

| 층 | 상태 |
| --- | --- |
| 상태·리렌더 훅 (`@gen-office/debug`) | MVP |
| 게이트·로거·덤프·DevTools·데이터셋 뷰어·패키지 opt-in | backlog (본 문서) |

## 재검토 체크리스트

다시 열 때 확인할 것:

1. 온보딩 개발자가 실제로 막히는 축이 데이터 / 캐시 / 리렌더 / 그리드 내부 중 어디인가?
2. 자작 UI가 필요한가, 외부 DevTools·문서로 충분한가?
3. 패키지 의존 방향(`apps → feature → ui → theme/utils`, debug는 foundation)을 깨지 않는가?
