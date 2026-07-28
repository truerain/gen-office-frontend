<!-- docs/gen-grid/server-side-sort-architecture.md
Documents the phased architecture and plan for server-side sorting with GenGrid / GenGridCrud.
-->

# Server-Side Sort Architecture & Plan

관련 문서
- `docs/gen-grid/filtering.md` (클라이언트 필터 계약)
- `docs/gen-grid/server-side-sort-spring-boot-sample.md` (Spring Boot 화이트리스트 샘플)
- `packages/gen-grid/.ai/todo.md` (Sorting UI 고도화 TODO)
- `packages/gen-grid/TREE_MODE_SPEC.md` (tree 모드에서 sorting 비활성)

상태: **Phase 0·2 구현 완료** (단일 목록 + DnD 우선순위 CRUD 승격 완료)  
일자: 2026-07-28

---

## 1. 문제

서버 페이징(`enablePagination` + 외부 `data` 슬라이스) 화면에서 GenGrid 헤더 정렬은 TanStack `getSortedRowModel()`로 **현재 페이지 데이터만** 재배열한다.

그 결과:

- UI는 전체 집합 정렬처럼 보이지만 실제는 페이지 로컬 정렬이다.
- API `sort` 파라미터와 헤더 정렬 상태가 연결되어 있지 않다.
- `gen-grid-crud`에는 정렬 전용 public API가 없다.

이 문서는 **서버 페이징 화면용 대안 정렬**의 아키텍처와 단계적 구현 계획을 정의한다.

---

## 2. 목표 / 비목표

### 목표

- ActionBar **Sort** 버튼 → 팝오버에서 컬럼별 Asc/Desc 선택 → 확인 시 콜백으로 sort 항목 전달
- 소비자가 API 호출에 sort를 반영하고, 서버가 정렬한 페이지 데이터를 다시 공급
- 이 기능이 활성일 때 **기존 헤더(클라이언트) 정렬은 비활성**
- demo에서 UX·계약을 검증한 뒤 `gen-grid-crud` built-in으로 승격

### 비목표 (1차)

- 헤더 클릭 기반 서버 정렬(`manualSorting` + 헤더 토글) 제품화
- multi-sort 우선순위 드래그 UI 고도화(필요 시 2차)
- tree / row spanning 모드에서의 서버 정렬
- 정렬 상태의 서버(사용자 설정) 영속화
- 클라이언트 전량 로드 화면의 기본 정렬 UX 변경

---

## 3. 아키텍처 개요

### 3.1 원칙

1. **데이터 소유는 소비자** — sort 적용·page 리셋·refetch는 앱이 한다. 그리드/CRUD는 UI와 계약만 제공한다.
2. **모드 상호 배타** — 서버 Sort 모드 ON이면 헤더 클라이언트 정렬 OFF.
3. **단계적 승격** — demo 검증 → gen-grid 최소 스위치 → gen-grid-crud built-in.
4. **페이징과 동일 계약** — pagination처럼 “상태 변경 알림 → 외부 data 교체” 패턴을 따른다.

### 3.2 레이어

```text
┌─────────────────────────────────────────────────────────┐
│  App (demo / 업무 화면)                                   │
│  - sorting state (applied)                               │
│  - pageIndex / pageSize                                  │
│  - API fetch(params: page, size, sort[])                 │
│  - data / totalRowCount 공급                             │
└──────────────────────────▲──────────────────────────────┘
                           │ onSortingChange(next)
                           │ (Apply 시점)
┌──────────────────────────┴──────────────────────────────┐
│  Phase 1: App customActions + Sort Popover               │
│  Phase 2: GenGridCrud built-in 'sort' + shared popover   │
│  - draft sorting (팝오버 편집 중)                          │
│  - 컬럼 후보 추출 (leaf, sortable)                         │
│  - Confirm → callback                                    │
└──────────────────────────▲──────────────────────────────┘
                           │ gridProps.enableSorting=false
┌──────────────────────────┴──────────────────────────────┐
│  GenGrid                                                 │
│  - enableSorting === false → 헤더 정렬 UI/동작 비활성      │
│  - manualPagination (기존)                               │
│  - data는 이미 서버 정렬된 페이지 슬라이스                   │
└─────────────────────────────────────────────────────────┘
```

### 3.3 데이터 흐름

```text
[사용자] Sort 버튼 클릭
   → 팝오버 open (draft = applied 복제)
   → 컬럼 선택 / Asc|Desc 편집 (draft만 변경)
   → 확인
   → onSortingChange(applied = draft)
   → 소비자: pageIndex = 0, API refetch(sort)
   → 소비자: data / totalRowCount 갱신
   → GenGrid 리렌더 (클라이언트 재정렬 없음)
```

취소/바깥 클릭 시 draft는 버리고 applied는 유지한다.

### 3.4 Sort 항목 모델

TanStack `SortingState`와 동형을 유지한다.

```ts
type ServerSortItem = {
  id: string;   // column id (기본). API 필드가 다르면 meta.sortField 사용
  desc: boolean;
};

type ServerSortingState = ServerSortItem[];
```

API 직렬화는 소비자 책임 예:

```text
[{ id: 'name', desc: false }, { id: 'createdAt', desc: true }]
  → "name:asc,createdAt:desc"   // API 정렬 스펙 (SQL ORDER BY 아님)
```

또는 백엔드 규약에 맞는 query array로 변환.

### 3.5 컬럼 후보 추출

팝오버에 나열할 컬럼:

| 포함 | 제외 |
|------|------|
| leaf column | 시스템 컬럼 (`__row_status__`, `__select__`, `__row_number__` 등) |
| `enableSorting !== false` | 그룹 헤더(비-leaf) |
| 표시명: header 문자열 또는 `meta.label` | `meta.serverSortable === false` (선택 규칙) |

API 필드 매핑:

- 기본: `column.id`
- 오버라이드: `column.meta.sortField` (권장 확장 포인트)

### 3.6 기존 헤더 정렬과의 관계

| 모드 | 헤더 정렬 | Sort 팝오버 |
|------|-----------|-------------|
| 기본 (서버 Sort 미사용) | 클라이언트 `getSortedRowModel()` | 없음 |
| 서버 Sort 활성 | **비활성** (`enableSorting: false`) | 유일 편집 UI |

서버 Sort 활성 판단 (권장):

- Phase 1(demo): 화면이 `gridProps.enableSorting: false` + custom Sort 버튼을 스스로 구성
- Phase 2(CRUD): `onSortingChange` 제공 또는 `includeBuiltIns`에 `'sort'` 포함 시 자동으로 헤더 정렬 OFF

헤더에 “현재 서버 정렬 표시만” 하는 것은 2차 옵션으로 둔다. 1차는 **헤더 정렬 완전 비활성**이 단순하다.

### 3.7 페이징 / 필터 / dirty와의 상호작용

- **페이징:** Apply 시 소비자가 `pageIndex`를 0으로 리셋하는 것을 계약으로 명시한다.
- **필터:** 클라이언트 컬럼 필터와 독립. 서버 필터가 있으면 앱이 sort와 함께 query에 넣는다.
- **CRUD dirty:** row id 기준이므로 정렬 순서와 무관하게 commit 가능. 서버 Sort는 view 순서만 바꾼다.
- **data 교체:** applied sorting은 소비자 상태이므로 그리드 내부 sorting state 리셋 이슈와 무관하다.

---

## 4. 패키지 경계

```text
apps/demo (또는 업무 앱)
  → 검증용 Sort Popover, sorting state, API 연동

packages/gen-grid
  → enableSorting?: boolean 공개 (헤더 클라이언트 정렬 on/off)
  → (1차) sorting controlled API 공개는 필수가 아님

packages/gen-grid-crud
  → Phase 2: built-in 'sort', 팝오버, onSortingChange 패스스루
  → Phase 1에서는 변경 최소화 (customActions로 충분)

packages/ui
  → 기존 Popover / Dialog / Select / Button 재사용
  → Sort 전용 패키지 컴포넌트는 CRUD 승격 시 도입 검토
```

역의존 금지: `gen-grid`는 CRUD/앱 Sort UI를 알지 않는다.

---

## 5. API 스케치

### 5.1 Phase 0–1: GenGrid (최소)

```ts
// GenGridProps
enableSorting?: boolean; // default: true (tree/rowSpan이면 기존처럼 false)
```

동작:

- `enableSorting === false`이면 테이블 `enableSorting: false`, `getSortedRowModel` 미사용(또는 no-op), 헤더 클릭/아이콘 비표시.

### 5.2 Phase 1: Demo (패키지 밖)

```ts
// 화면 로컬
const [sorting, setSorting] = useState<ServerSortingState>([]);

actionBar={{
  customActions: [
    {
      key: 'server-sort',
      label: 'Sort',
      side: 'right',
      onClick: () => setSortPopoverOpen(true),
    },
  ],
}}

gridProps={{
  enablePagination: true,
  enableSorting: false,
  pagination,
  onPaginationChange,
  totalRowCount,
}}

// SortPopover Confirm
onConfirm={(next) => {
  setSorting(next);
  setPageIndex(0);
  // queryKey / fetch deps에 sorting 포함
}}
```

### 5.3 Phase 2: GenGridCrud (승격)

```ts
// GenGridCrudProps 추가 (초안)
sorting?: ServerSortingState;                    // controlled applied
defaultSorting?: ServerSortingState;             // uncontrolled init (선택)
onSortingChange?: (next: ServerSortingState) => void;

// CrudBuiltInActionKey
| 'sort'
```

동작 초안:

- `onSortingChange`가 있거나 `includeBuiltIns`에 `'sort'`가 있으면 Sort 버튼 노출
- 동시에 `gridProps`로 `enableSorting: false` 주입(소비자가 true를 강제해도 서버 Sort 모드에서는 false 우선 — 문서화)
- Apply 시 `onSortingChange(next)`만 호출. refetch/page 리셋은 소비자
- applied 값이 있으면 Sort 버튼 variant를 primary 등으로 강조(filter 패턴)

---

## 6. UX 스케치 (다이얼로그)

1. ActionBar 우측 **Sort** 버튼
2. 클릭 시 Sort 다이얼로그
3. **전체 sortable 컬럼을 단일 목록**으로 나열하고, 각 행 = grip + 컬럼명 + **없음 | 오름 | 내림** + 순위 배지
4. **없음이 아닌 행만** 드래그해 multi-sort 우선순위 변경 (목록 순서 = 적용 순서)
5. 확인 시 `없음`이 아닌 항목만 `ServerSortingState`로 전달
6. 적용 중이면 버튼 라벨에 개수 표시: `Sort (2)` / Confirm `(2)`

스타일은 theme 토큰(`--color-*`, `--border-radius-*`)을 사용한다. 앱 커스터마이징은 토큰 override를 우선한다.

---

## 7. 구현 단계

### Phase 0 — GenGrid 스위치 (선행 또는 Phase 1과 동시)

| 작업 | 위치 |
|------|------|
| `enableSorting?: boolean`을 `GenGridProps`에 공개 | `packages/gen-grid` |
| `useGenGridTable`에서 prop 반영 (tree/rowSpan 기존 강제 false 유지) | 동일 |
| 짧은 문서/로그 | `docs/gen-grid/`, implementation-log |

완료 기준: 페이징 데모에서 `enableSorting: false` 시 헤더 정렬 불가.

### Phase 1 — Demo 검증

| 작업 | 위치 |
|------|------|
| Sort 팝오버 UI | `apps/demo` (기존 pagination CRUD 화면 또는 전용 페이지) |
| `customActions`로 Sort 버튼 | 동일 |
| `sorting` state + API `sort` 파라미터 연동 | 동일 |
| Apply 시 `pageIndex = 0` | 동일 |
| `enableSorting: false` | `gridProps` |

완료 기준:

- 헤더로 페이지 로컬 정렬이 되지 않는다
- Sort 확인 후 API에 sort가 반영되고 그리드 데이터가 서버 순서로 갱신된다
- multi-sort(2개 이상)가 동작한다

### Phase 2 — GenGridCrud 승격

| 작업 | 위치 |
|------|------|
| built-in `'sort'` | `CrudActionBar`, types |
| 공유 Sort 팝오버 컴포넌트 | `packages/gen-grid-crud` |
| `sorting` / `onSortingChange` props | `GenGridCrudProps` |
| 서버 Sort 모드 시 `enableSorting: false` 강제 | `GenGridCrud.tsx` |
| i18n 라벨 | `common` 등 |
| 문서·implementation-log·demo를 built-in 사용으로 전환 | docs / demo |

완료 기준: demo가 custom 팝오버 대신 CRUD built-in만으로 동일 시나리오를 만족한다.

### Phase 3 (선택, 이후)

- 헤더에 서버 정렬 인디케이터(읽기 전용) 표시
- `meta.sortField` 문서화 및 타입 보강
- Excel backend `buildPayload`에 sorting 포함 예시
- 헤더 클릭 ↔ 동일 `sorting` 상태 동기화(제품 요구 시)
- 키보드 접근성 기반 우선순위 재정렬

---

## 8. 위험 / 완화

| 위험 | 완화 |
|------|------|
| 헤더/Sort 이중 UX | 서버 Sort 활성 시 `enableSorting: false` 강제 |
| Apply 후 page 미reset | 계약 문서 + demo에서 리셋 구현, CRUD는 호출만 |
| column id ≠ API field | `meta.sortField` 규칙 |
| ActionBar에 무거운 팝오버 | Phase 1에서 UX 검증 후 Phase 2 승격 |
| uncontrolled 내부 sorting 잔존 | 서버 모드에서 `getSortedRowModel` 비활성으로 무력화 |

---

## 9. 검증

Phase 0

```bash
pnpm -C packages/gen-grid exec tsc -p tsconfig.json --noEmit
```

Phase 1–2

```bash
pnpm -C packages/gen-grid-crud exec tsc -p tsconfig.json --noEmit
pnpm -C apps/demo build
```

수동 체크리스트

- [ ] 서버 Sort ON: 헤더 클릭해도 행 순서가 바뀌지 않음
- [ ] Sort 확인 후 네트워크/쿼리에 sort 반영
- [ ] pageIndex가 0으로 리셋된 뒤 1페이지부터 표시
- [ ] multi-sort 순서대로 API에 전달
- [ ] 취소 시 applied sort 유지
- [ ] tree/rowSpan 화면과 회귀 없음

---

## 10. 결정 요약

1. 서버 페이징 화면의 정렬 대안은 **ActionBar Sort 팝오버 + 소비자 refetch**이다.
2. 기능 활성 시 **기존 헤더 클라이언트 정렬은 비활성**한다.
3. 구현은 **demo 검증 → gen-grid `enableSorting` → gen-grid-crud built-in** 순으로 승격한다.
4. applied sorting의 소유권과 API 직렬화는 **앱 레이어**에 둔다.
