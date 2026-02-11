# GenGrid Tree Mode Implementation TODO

본 문서는 `packages/gen-grid/TREE_MODE_SPEC.md` 기준의 **구현 작업 분해** 문서다.
현재 단계에서는 코드 변경 없이 TODO만 정리한다.

## 목표
- Flat parent-child(`idKey`, `parentIdKey`) 기반 트리 모드 구현
- 트리 모드에서 정렬/페이지네이션/그룹핑 비활성
- orphan row는 우선 경고 상태로 유지

## 완료 기준 (Definition of Done)
- `tree.enabled=true` 시 부모/자식 계층이 올바르게 표시된다.
- expand/collapse가 controlled/uncontrolled 모두 동작한다.
- 트리 모드에서 sorting/pagination/grouping이 비활성 처리되고 경고 로그가 1회 출력된다.
- `treeColumnId`에 토글 + depth indent가 반영된다.
- orphan row 목록이 콜백으로 전달되고 depth=0으로 렌더된다.

## Phase 0: 타입/계약 확정
- [x] `GenGrid.types.ts`에 `GenGridTreeOptions<TData>` 타입 추가
- [x] `CommonGridOptions<TData>`에 `tree?: GenGridTreeOptions<TData>` 추가
- [x] 기본값 규칙 명시
  - `rootParentValue`: `null | undefined | 0`
  - `indentPx`: `12`
  - `showOrphanWarning`: `true`
  - `defaultExpanded`: `false`

산출물:
- 타입 선언 업데이트
- 주석(영문/국문 중 현재 코드베이스 톤에 맞춤)

## Phase 1: 트리 row model 훅 추가
- [x] 신규 훅 생성 (예: `features/tree/useTreeRowModel.ts`)
- [x] 입력: `data`, `tree options`
- [x] 출력:
  - `visibleRowIds` 또는 `visibleRows`
  - `depthByRowId`
  - `hasChildrenByRowId`
  - `orphanRowIds`
  - `expandedRowIds`, `setExpandedRowIds`, `toggleRow`
- [x] key 정규화 전략 확정 (`String(id)` 기준)
- [x] orphan 판정 및 수집
- [x] `defaultExpanded` 초기 상태 처리
- [x] controlled/uncontrolled 동시 지원

산출물:
- 트리 row model 훅
- 단위 테스트 또는 최소 검증 코드

## Phase 2: 테이블 엔진 연동
- [x] `useGenGridTable.ts`에서 트리 모드 분기 추가
- [x] 트리 모드일 때 비활성 처리
  - sorting
  - pagination
  - grouping/expanded(grouping용)
- [x] 충돌 옵션 경고 로그(중복 방지 1회)
- [x] 트리 모드 row source를 `visibleRows`로 공급

산출물:
- 테이블 상태 분기 로직
- 경고 로직 유틸(중복 로그 방지)

## Phase 3: 렌더 계층 UI 반영
- [x] `GenGridCell` 또는 body 렌더 계층에 트리 토글 UI 추가
- [x] `treeColumnId` 컬럼에서만 토글/indent 렌더
- [x] `depth * indentPx` 스타일 반영
- [x] 자식 없는 row 토글 비활성/미표시 규칙 반영
- [x] orphan row 시각 표시(최소 배지/데이터 속성)

산출물:
- DOM data attribute 예시
  - `data-tree-depth`
  - `data-tree-orphan`

## Phase 4: 네비게이션/편집 규칙 정리
- [x] 트리 모드에서 좌/우 키 확장/축소 규칙 추가
- [x] 상/하 키는 visible row 기준 이동 유지
- [x] 편집 진입 키(Enter/F2)와 충돌 없음 확인
- [x] activeCell 이동 시 collapse된 subtree 건너뛰기 검증

산출물:
- `useActiveCellNavigation` 트리 분기
- 키보드 동작 테스트 시나리오

## Phase 5: 이벤트/콜백
- [x] `onOrphanRowsChange` 호출 시점 정의
  - 초기 마운트
  - data 변경 시
- [x] `onExpandedRowIdsChange` 호출 타이밍 정리
- [x] `tableMeta` 노출 여부 결정 (필요 시 `genGrid.tree` namespace)

산출물:
- 콜백 이벤트 규약 문서화

## Phase 6: 데모/문서
- [x] `apps/demo`에 트리 데모 페이지 추가 또는 기존 메뉴 페이지 예제 반영
- [x] `TREE_MODE_SPEC.md`와 cross-link
- [x] README/패키지 문서에 트리 모드 사용 예시 추가

산출물:
- 데모 화면
- 사용 가이드

## 테스트 체크리스트
- [x] parent/child 정상 계층 렌더
- [x] collapse 시 자손 전체 숨김
- [x] expand/collapse 상태 유지(controlled/uncontrolled)
- [x] tree + virtualization 스크롤 안정성
- [x] tree + selection + editing 동시 동작
- [x] orphan 존재 시 경고 및 콜백
- [x] tree 모드에서 sorting/pagination/grouping 무시 확인

## 리스크
- row id 타입 혼합(number/string)으로 인한 parent 매칭 실패
- virtualization 환경에서 토글 후 active/focus 튐
- 대용량 데이터에서 depth 계산/visible 재계산 비용

## 권장 구현 순서
1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 3
5. Phase 4
6. Phase 5
7. Phase 6

## Related Document
- Spec: `packages/gen-grid/TREE_MODE_SPEC.md`
