<!-- packages/gen-datagrid-crud/docs/customer-info-loading-loop.md
Documents the CustomerInfoPage loading-loop investigation and fix.
-->

# CustomerInfoPage 로딩 지연 원인과 해결

## 증상

- demo 앱에서 CustomerInfoPage를 먼저 연 뒤 다른 메뉴를 열면 새 메뉴가 로딩 화면에 머무르는 현상이 있었다.
- CustomerInfoPage를 닫으면 대기 중이던 다른 메뉴가 즉시 렌더링되었다.
- CustomerTable에서 `GenDataGridCrud`를 제거하면 다른 메뉴가 정상 로딩되었다.

## 원인

문제는 lazy import가 아니라 CustomerInfoPage에 마운트된 `GenDataGridCrud`의 반복 state 통지였다.

`GenDataGridCrud`는 내부 controller state를 `onStateChange`로 외부에 알린다. 이때 state 생성이 `createRow`, `onExport` 같은 함수 prop의 identity에 의존하면, 소비자가 inline 함수를 전달하는 화면에서 부모 렌더마다 동일 의미의 state가 새 객체로 만들어질 수 있다. CustomerInfoPage는 `onStateChange`에서 부모 state를 갱신하므로 다음 흐름이 반복될 수 있었다.

1. `GenDataGridCrud`가 state를 통지한다.
2. CustomerTable의 `onStateChange`가 CustomerInfoPage state를 갱신한다.
3. CustomerInfoPage/CustomerTable이 다시 렌더된다.
4. inline `createRow`/callback/object prop identity가 바뀐다.
5. CRUD controller state가 새로 계산되고 다시 `onStateChange`가 호출된다.

MDI는 비활성 탭도 기본적으로 마운트된 상태로 유지한다. 따라서 CustomerInfoPage가 hidden 상태여도 반복 렌더가 계속되면 새 메뉴의 import가 끝나도 React commit이 지연될 수 있다.

## 해결

- `useDataGridCrudController`에서 `DataGridCrudUiState.canCreateRow`, `canExport`를 함수 identity가 아니라 boolean 값으로 분리했다.
- `GenDataGridCrud`가 `GenDataGrid`에 전달하는 `data`, `columns` 배열을 매 렌더 무조건 복사하지 않고 입력 참조 변경 시에만 memoized copy를 만들도록 변경했다.
- CustomerInfoPage/CustomerTable에서 빈 rows, `createRow`, `getRowId`, `onCommit`, `beforeCommit`, `actionBar`, `gridProps`, `onStateChange`를 안정화했다.
- inline `createRow`와 `onStateChange`가 함께 쓰여도 반복 통지가 발생하지 않는 회귀 테스트를 추가했다.

## 재발 방지

- CRUD wrapper 내부 state는 함수 prop identity를 의미 있는 state 변경으로 취급하지 않아야 한다.
- demo/consumer 화면에서는 비용이 큰 grid에 전달하는 callback/object prop을 `useCallback`/`useMemo`로 안정화한다.
- MDI처럼 hidden tab을 unmount하지 않는 구조에서는 비활성 탭의 grid도 계속 React work를 만들 수 있다는 점을 고려한다.
- 유사 증상이 발생하면 먼저 lazy import 완료 여부와 hidden tab의 반복 렌더 여부를 분리해서 확인한다.
