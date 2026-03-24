# GenGrid Column Reorder (Drag & Drop) 구현 계획

관련 문서
- `docs/gen-grid/layout-contract.md`
- `docs/gen-grid/layout-regression-playbook.md`

## 1. 목표
- GenGrid 헤더에서 컬럼을 Drag & Drop으로 이동(순서 변경)할 수 있게 한다.
- 컬럼 순서를 제어형/비제어형 모두 지원한다.
- 기존 기능(정렬, 리사이즈, 핀닝, 필터링, 범위선택)과 충돌 없이 동작하게 한다.

## 2. 범위 / 비범위

범위
- Leaf column 기준 DnD 재정렬
- TanStack `columnOrder` 상태 연동
- `GenGridProps`에 컬럼 순서 제어 API 추가
- 시스템 컬럼/핀닝 영역에 대한 이동 정책 적용

비범위(1차 제외)
- 터치 디바이스 전용 제스처 최적화
- 멀티 컬럼 동시 이동
- 컬럼 그룹 헤더 단위 이동
- 사용자별 순서 영속 저장(서버 저장)은 화면/앱 레이어에서 처리

## 3. 현재 상태 요약
- `GenGrid`는 `columnVisibility`, `columnPinning`, `columnSizing`은 지원하지만 `columnOrder`는 노출하지 않는다.
- 헤더는 정렬 클릭/리사이즈만 구현되어 있고, DnD 이벤트(`dragstart`, `dragover`, `drop`)가 없다.
- 실제 렌더 순서는 내부 `resolvedColumns` 배열과 테이블 상태로 결정된다.

## 4. 제안 API (초안)

`GenGridProps<TData>`에 아래 옵션 추가:

```ts
type CommonGridOptions<TData> = {
  enableColumnReorder?: boolean; // default: false

  // controlled
  columnOrder?: string[];
  onColumnOrderChange?: (next: string[]) => void;

  // uncontrolled init
  defaultColumnOrder?: string[];
};
```

동작 원칙
- `columnOrder`가 주어지면 제어형으로 동작하고, 아니면 내부 상태를 사용한다.
- `defaultColumnOrder`는 최초 마운트 시점 초기값으로만 사용한다.
- 순서 배열에 없는 컬럼은 뒤에 append한다(신규 컬럼 안전성).

## 5. DnD UX/정책

기본 규칙
1. 헤더 셀 드래그 시작 시 `sourceColumnId` 저장
2. 드래그 오버 대상 셀 기준으로 drop 위치(앞/뒤) 계산
3. drop 시 `columnOrder` 재계산 후 반영

이동 제한 정책
- 시스템 컬럼(예: `__row_status__`, `__select__`, `__row_number__`)은 이동 불가
- 핀닝 활성화 시 영역 교차 이동은 1차에서 불가
  - left pinned 내부 재정렬: 허용
  - center 내부 재정렬: 허용
  - right pinned 내부 재정렬: 허용
  - left/center/right 간 교차 이동: 차단

충돌 방지
- 정렬 클릭과 드래그를 분리(드래그 핸들 또는 이동 임계치 적용)
- 리사이즈 핸들 영역에서는 드래그 시작 금지

## 6. 접근성/키보드
- 1차는 마우스 DnD 우선
- `aria-grabbed`, drop target 시각 피드백 클래스 제공
- 키보드 기반 재정렬은 2차 과제로 분리

## 7. 구현 단계 (권장)

1. 타입/API 확장
- `packages/gen-grid/src/GenGrid.types.ts`
  - `enableColumnReorder`, `columnOrder`, `onColumnOrderChange`, `defaultColumnOrder` 추가

2. 테이블 상태 연동
- `packages/gen-grid/src/core/table/useGenGridTable.ts`
  - 내부 `innerColumnOrder` 상태 추가
  - controlled/uncontrolled resolve
  - `useReactTable`의 `state.columnOrder`, `onColumnOrderChange` 연결
  - reorder 가능 여부/제약 계산 유틸 연결

3. 헤더 DnD 구현
- `packages/gen-grid/src/components/layout/GenGridHeader.tsx`
  - 헤더 셀 DnD 이벤트 추가
  - drop indicator(앞/뒤) 계산
  - 제한 컬럼/제한 영역 방어

4. 스타일 추가
- `packages/gen-grid/src/components/layout/GenGridHeader.module.css`
  - dragging, drop target, blocked 상태 스타일 추가

5. 문서/샘플
- `docs/gen-grid` 내 관련 문서 링크 보강
- `apps/demo`에 DnD 재정렬 예시 페이지 또는 기존 grid demo에 샘플 추가

## 8. 검증 체크리스트
- [ ] center 영역 컬럼 간 DnD 재정렬이 정상 동작한다.
- [ ] left/right pinned 영역 내부 재정렬이 정상 동작한다.
- [ ] pinned 영역 교차 drop은 차단된다.
- [ ] 시스템 컬럼은 드래그 시작/드롭 대상 모두 차단된다.
- [ ] 정렬 클릭, 리사이즈와 상호 간섭이 없다.
- [ ] 필터 row/컨텍스트 메뉴/범위선택 동작이 회귀되지 않는다.
- [ ] 컬럼 숨김/표시 후에도 `columnOrder` 정합성이 유지된다.
- [ ] `GenGridCrud` 경유 사용 시에도 동일하게 동작한다.

## 9. 리스크 및 대응
- 리스크: DnD 이벤트가 정렬 클릭과 충돌
  - 대응: 드래그 핸들 도입 또는 pointer 이동 임계치 적용
- 리스크: 핀닝/숨김 컬럼과 순서 배열 불일치
  - 대응: 정규화 함수로 유효 column id만 반영하고 누락 컬럼 자동 append
- 리스크: 대량 컬럼에서 dragover 렌더 비용 증가
  - 대응: hover 상태 최소화(컬럼 id + 위치만 저장), 불필요 재렌더 억제

## 10. 롤아웃 제안
1. 1차: API + 내부 상태 + center 영역 재정렬
2. 2차: pinned 영역 내부 재정렬 + 제한 정책 고도화
3. 3차: 키보드 접근성 + 문서/데모 확장

