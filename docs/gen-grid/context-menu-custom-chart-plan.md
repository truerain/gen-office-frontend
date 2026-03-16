# GenGrid ContextMenu Custom + Range Chart 구현 방향

관련 문서
- `docs/gen-grid/context-menu-clipboard.md`
- `docs/gen-grid/range-selection.md`
- `docs/gen-grid/layout-contract.md`

## 1. 목표
- GenGrid 우클릭 ContextMenu에 화면별 커스텀 메뉴를 추가할 수 있게 한다.
- 예시로 `Chart` 메뉴를 추가해, 현재 Selection Range 데이터를 차트 팝업으로 전달할 수 있게 한다.
- 기존 Copy/Paste/통계 기능은 유지하고, 사용하지 않는 화면에는 영향이 없도록 기본 동작을 보장한다.

## 2. 현재 상태 요약
- ContextMenu 항목은 `Copy`, `Copy with Header`, `Paste`로 고정되어 있다.
- 메뉴 렌더링: `packages/gen-grid/src/components/base/GenGridContextMenu.tsx`
- 메뉴 오픈/선택범위 통계 계산: `packages/gen-grid/src/components/base/GenGridBase.tsx`
- 선택범위 경계 계산: `packages/gen-grid/src/features/range-selection/clipboard.ts`의 `resolveRangeBounds`
- 문제점: 화면 단위 확장 포인트(커스텀 메뉴, 메뉴 클릭 시 선택범위 데이터 접근)가 없다.

## 3. 설계 원칙
- 기존 API 호환성 유지(기존 사용 화면 수정 없이 동작).
- 커스텀 기능은 옵셔널로 제공.
- Range 데이터 계산은 ContextMenu 오픈 시점 기준으로 최소화.
- 메뉴 UI와 비즈니스 로직을 분리(그리드는 이벤트/데이터만 전달, 실제 Chart 팝업은 화면에서 처리).

## 4. 제안 API (초안)
`GenGridProps<TData>`에 아래 옵션 추가:

```ts
type GenGridContextMenuCustomAction<TData> = {
  key: string;
  label: string;
  disabled?: boolean | ((ctx: GenGridContextMenuActionContext<TData>) => boolean);
  onClick: (ctx: GenGridContextMenuActionContext<TData>) => void | Promise<void>;
};

type GenGridContextMenuActionContext<TData> = {
  table: Table<TData>;
  selectedRange: SelectedRange;
  bounds: RangeBounds | null;
  cells: Array<{
    rowIndex: number;
    rowId: string;
    columnId: string;
    columnHeader: string;
    value: unknown;
  }>;
  matrix: unknown[][];
};

type GenGridContextMenuOptions<TData> = {
  customActions?: GenGridContextMenuCustomAction<TData>[];
};
```

`GenGridProps<TData>`에:
- `contextMenu?: GenGridContextMenuOptions<TData>`

## 5. 동작 시나리오
1. 사용자가 셀 범위를 선택한다.
2. 우클릭 시 기존 메뉴 + `customActions` 메뉴를 함께 렌더링한다.
3. 커스텀 메뉴 클릭 시 `GenGridBase`에서 `bounds/cells/matrix`를 구성한다.
4. `onClick(ctx)` 호출 후 메뉴를 닫는다.
5. 화면 컴포넌트는 `ctx.matrix`를 받아 Chart 팝업 상태를 연다.

## 6. Chart 예시 사용 방식 (페이지 단)
화면에서:
- `GenGrid` 또는 `GenGridCrud.gridProps`에 `contextMenu.customActions` 주입
- `Chart` 메뉴 클릭 시 `matrix`를 파싱해 시리즈 생성
- 로컬 `dialogOpen` 상태로 차트 모달 렌더링

예시 흐름:
- 첫 행/열을 라벨로 사용할지 정책 결정
- 숫자 변환 가능한 값만 시리즈에 반영
- 빈 범위/비숫자 범위는 경고 후 차트 미오픈

## 7. 구현 단계 (권장)
1. 타입 확장
- `packages/gen-grid/src/GenGrid.types.ts`에 `contextMenu` 옵션 타입 추가

2. Base 연결
- `packages/gen-grid/src/components/base/GenGridBase.tsx`
  - `props.contextMenu` 수신
  - `resolveRangeBounds`로 `bounds` 계산
  - 범위 셀 데이터(`cells`, `matrix`) 생성 유틸 추가
  - `GenGridContextMenu`로 커스텀 액션 전달

3. ContextMenu 렌더 확장
- `packages/gen-grid/src/components/base/GenGridContextMenu.tsx`
  - 기본 메뉴 하단 또는 구분선 아래에 커스텀 메뉴 항목 렌더
  - `disabled` 지원

4. 문서/샘플
- `docs/gen-grid/context-menu-clipboard.md`에 확장 섹션 추가
- 데모 페이지 1개에 `Chart` 커스텀 메뉴 예제 연결

## 8. 검증 포인트
- 기존 Copy/Paste 동작 회귀 없음
- 커스텀 메뉴 미설정 시 기존 UI와 완전히 동일
- 범위가 없을 때 `Chart` 메뉴 비활성 처리 가능
- 대량 범위(예: 200x50)에서 메뉴 오픈 지연이 허용 범위 내인지 확인
- `GenGridCrud` 경유 사용 시에도 `gridProps.contextMenu` 전달이 정상인지 확인

## 9. 리스크 및 대응
- 리스크: 메뉴 클릭 시 매번 큰 데이터 직렬화 비용
  - 대응: `cells/matrix`는 클릭 시점 lazy 생성 또는 상한선 도입
- 리스크: 컬럼 헤더/값 타입이 다양한 화면에서 차트 변환 실패
  - 대응: 화면 단 변환 유틸 표준화(숫자 파서, 헤더 해석 정책)
- 리스크: 향후 메뉴 항목이 늘면서 UI 복잡도 증가
  - 대응: 그룹/구분선 옵션은 2차 확장으로 분리

## 10. 우선순위 제안
- 1차: Custom 메뉴 주입 + 클릭 컨텍스트 전달
- 2차: Chart 샘플 페이지(모달/간단 막대차트)
- 3차: 공통 `rangeToChartSeries` 유틸 제공

