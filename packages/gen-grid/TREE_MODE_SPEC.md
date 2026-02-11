# GenGrid Tree Mode Spec (Flat Parent-Child)

## 목적
- `GenGrid`에서 `getSubRows` 방식이 아닌, flat row(`id`, `parentId`) 기반 트리 표시를 지원한다.
- 데이터 입력 순서는 `parent -> child`를 기본 전제로 한다.
- 본 문서는 **구현 전 API/동작 합의 문서**이며, 코드 구현은 별도 요청 시 진행한다.

## 범위
- 대상: `@gen-office/gen-grid`
- 데이터 모델: flat 배열 + 부모 참조 컬럼
- 비대상: 고아 노드 최종 처리 정책(우선 경고만), 서버 정렬/서버 페이지네이션 연동

## 용어
- `idKey`: row 고유 키 컬럼명
- `parentIdKey`: 부모 키 컬럼명
- `treeColumnId`: 트리 토글/들여쓰기를 렌더할 컬럼 id
- `orphan row`: `parentId`가 가리키는 부모가 현재 데이터에 없는 row

## 공개 API 초안
```ts
type GenGridTreeOptions<TData> = {
  enabled: boolean;
  idKey: keyof TData | string;
  parentIdKey: keyof TData | string;
  treeColumnId?: string;
  rootParentValue?: unknown; // default: null | undefined | 0
  indentPx?: number;         // default: 12

  defaultExpanded?: boolean;
  expandedRowIds?: Record<string, boolean>;
  onExpandedRowIdsChange?: (next: Record<string, boolean>) => void;

  showOrphanWarning?: boolean; // default: true
  onOrphanRowsChange?: (rowIds: string[]) => void;
};
```

```ts
type CommonGridOptions<TData> = {
  // ...
  tree?: GenGridTreeOptions<TData>;
};
```

## 핵심 규칙
1. `tree.enabled=true`일 때 정렬(`sorting`) 비활성
2. `tree.enabled=true`일 때 페이지네이션(`pagination`) 비활성
3. `tree.enabled=true`일 때 그룹핑(`grouping`) 비활성
4. 트리 관계 계산은 `idKey`, `parentIdKey`만 사용
5. 트리 표시 컬럼은 `treeColumnId`로 주입
   - 미지정 시 첫 번째 visible leaf column 사용

## 동작 정의
1. row 모델 생성
- 입력 flat data에서 `id -> row`, `id -> children[]` 인덱스 구성
- 루트 판정: `parentId`가 `rootParentValue`(기본 `null|undefined|0`)면 루트
- visible row는 `expandedRowIds` 기준 DFS 순회로 계산

2. expand/collapse
- controlled + uncontrolled 모두 지원
- `defaultExpanded=true`면 초기 전체 펼침
- 각 row 토글 시 `onExpandedRowIdsChange` 호출

3. 렌더
- `treeColumnId` 컬럼에 토글 버튼 + `depth * indentPx` 들여쓰기 적용
- 자식 없는 row는 토글 아이콘 비활성 또는 미표시

4. orphan row
- 우선 정책: 동작 유지 + 경고
- 표시 메타: `isOrphan=true`, `depth=0`
- 콜백: `onOrphanRowsChange(orphanIds)`
- `showOrphanWarning=true`면 개발자 경고(중복 방지 1회) 가능

## 비활성 충돌 정책
- 트리 모드에서 아래 옵션이 들어오면 무시한다.
  - `enablePagination`, `pagination`, `onPaginationChange`
  - `sorting`, `onSortingChange`
  - `enableGrouping`, `grouping`, `onGroupingChange`, `expanded`, `onExpandedChange`
- 개발자 콘솔 경고를 1회 출력한다.

## 키보드/UX 기본안
- 좌/우 키: 현재 row expand/collapse (tree column active 시)
- 상/하 키: visible row 기준 이동
- Enter/F2 편집 규칙은 기존 grid 규칙 우선

## 사용 예시 (Menu)
```tsx
<GenGrid<Menu>
  data={rows}
  columns={columns}
  getRowId={(row) => String(row.menuId)}
  tree={{
    enabled: true,
    idKey: 'menuId',
    parentIdKey: 'prntMenuId',
    treeColumnId: 'menuName',
    rootParentValue: 0,
    indentPx: 14,
    showOrphanWarning: true,
  }}
/>
```

## 검토 체크리스트
- `treeColumnId`와 실제 column id 매핑이 일치하는가
- `idKey` 타입(number/string) 혼합 시 문자열 정규화 기준을 통일했는가
- orphan 경고 정책(UI/토스트/콘솔) 확정 여부
- virtualization에서 depth/토글 렌더 성능 문제가 없는가


## Related Document
- Implementation breakdown: `packages/gen-grid/TREE_MODE_TODO.md`
