<!-- packages/gen-datagrid/docs/reference/controlled-uncontrolled-app-guide.md
Guides app screens in choosing controlled or uncontrolled GenDataGrid data ownership.
-->

# Controlled vs Uncontrolled App Guide

## 목적

이 문서는 app 화면에서 `GenDataGrid`를 controlled mode로 쓸지, uncontrolled mode로 쓸지
결정하는 기준을 정리한다. 특히 `GenDataGridCrud`와 함께 사용할 때 grid, CRUD wrapper,
app 중 누가 데이터를 소유해야 하는지 판단하는 데 사용한다.

## 짧은 결론

대부분의 업무 화면은 **controlled mode를 기본값**으로 선택한다.

Uncontrolled mode는 story, prototype, 독립 위젯, 서버 저장이 없는 로컬 편집 도구처럼
grid 내부에서 데이터 생명주기를 끝낼 수 있는 경우에만 선택한다.

## 두 방식의 의미

### Controlled mode

App이 `data`를 내려주고, 저장 성공이나 재조회 후 새 `data`와 `dataVersion`을 다시 내려준다.

```tsx
<GenDataGrid
  data={rows}
  dataVersion={dataUpdatedAt}
  columns={columns}
  getRowId={getRowId}
  onCellValueChange={(event) => {
    // app 또는 CRUD controller가 patch/save 후보를 관리한다.
  }}
/>
```

특징:

- 서버 데이터, React Query cache, page state, form state와 잘 맞는다.
- 저장 성공 후 `dataVersion` 변경으로 dirty/deleted marker를 정리할 수 있다.
- app이 source of truth라서 여러 component가 같은 데이터를 공유하기 쉽다.
- grid handle은 controlled `data`를 몰래 mutation하면 안 된다.

### Uncontrolled mode

Grid가 `defaultData`를 초기값으로 받고 내부 state로 row를 관리한다.

```tsx
<GenDataGrid
  defaultData={initialRows}
  columns={columns}
  getRowId={getRowId}
/>
```

특징:

- 작은 standalone grid나 Storybook 예제에 단순하다.
- app이 매 edit마다 데이터를 다시 내려주지 않아도 된다.
- 서버 저장, refetch, 외부 상태 동기화가 있으면 오히려 복잡해질 수 있다.
- `revertChanges`, `insertRows`, `load` 같은 handle API를 구현하기 쉬운 쪽은 uncontrolled다.

## 선택 기준

| 질문 | Controlled 권장 | Uncontrolled 가능 |
| --- | --- | --- |
| 서버에서 조회한 업무 데이터인가? | 예 | 아니오 |
| 저장 성공 후 refetch 또는 cache 갱신이 필요한가? | 예 | 아니오 |
| 같은 데이터를 chart/detail/form과 공유하는가? | 예 | 아니오 |
| URL, filter, tab, page state와 데이터가 연결되는가? | 예 | 아니오 |
| grid 안에서만 끝나는 임시 편집인가? | 아니오 | 예 |
| Storybook/demo/prototype인가? | 선택 가능 | 예 |
| row 추가/삭제가 서버 transaction에 포함되는가? | 예 | 신중 |
| app이 변경 diff를 API payload로 만들어야 하는가? | 예 | 제한적 |

## 화면 유형별 권장안

### 조회 전용 화면

권장: controlled mode

예:

- 실적 조회
- 원장 조회
- 코드 목록 조회
- audit/log viewer

이유:

- 조회 조건, server cache, export, chart, detail과 연결되는 경우가 많다.
- grid 내부 data mutation이 필요 없다.
- `GenDataGridCrud`를 쓰더라도 ActionBar는 filter/export/refresh 중심의 얇은 shell이면 된다.

### 일반 CRUD 화면

권장: controlled mode + `GenDataGridCrud`

예:

- 코드 관리
- 단가 관리
- 권한 매핑
- 예산/계획 입력

운영 방식:

1. app이 `data`와 `dataVersion`을 내려준다.
2. `GenDataGrid`는 edit, dirty marker, validation marker를 처리한다.
3. `GenDataGridCrud`는 ActionBar와 save/delete/reset workflow를 조율한다.
4. 저장 성공 후 app이 refetch 또는 cache update로 새 `data`를 내려준다.
5. `dataVersion` 변경 또는 `acceptChanges()`로 marker를 정리한다.

### 대량 데이터 조회 + 일부 로컬 표시 설정

권장: controlled mode

예:

- 2,000건 이상 virtualized 조회
- 서버 paging/filtering
- chart context menu 연동

이유:

- virtualization 자체는 controlled/uncontrolled와 무관하지만, 대량 데이터는 대개 서버 상태와 연결된다.
- filter, chart, export 대상이 app state와 맞아야 한다.

### 로컬 편집 도구

권장: uncontrolled mode 가능

예:

- import preview grid
- CSV paste 후 local cleanup
- 저장 API가 없고 최종 결과만 한 번 추출하는 도구

조건:

- grid가 내부 data를 소유해도 app과 충돌하지 않아야 한다.
- 외부 component가 같은 row data를 동시에 수정하지 않아야 한다.
- 최종 submit 시점에 `getData()` 같은 handle snapshot을 읽는 방식이 자연스러워야 한다.

## GenDataGridCrud와의 관계

`GenDataGridCrud`는 controlled mode를 기본 대상으로 설계한다.

이유:

- 실제 업무 CRUD는 대개 서버 transaction이다.
- app이 저장 성공, 실패, refetch, optimistic update, error 표시를 소유해야 한다.
- CRUD wrapper가 별도 source of truth가 되면 app data와 grid dirty state가 이중화된다.

따라서 `GenDataGridCrud`의 기본 save 흐름은 다음을 전제로 한다.

```text
app data -> GenDataGrid -> dirty/change snapshot -> GenDataGridCrud onCommit
          <- app refetch/cache update <- save success
```

Uncontrolled CRUD는 후속 확장으로 둔다. 특히 `insertRows`, `load`, `revertChanges`는
controlled/uncontrolled 정책 차이가 크기 때문에 handle 확장 계획에서 deferred로 분리한다.

## Handle API와 선택 기준

### Controlled mode에서 handle이 해야 하는 일

- `flushEditing()`: 저장 전 editor 값을 확정한다.
- `getData()`: 현재 렌더링 기준 snapshot을 읽는다.
- `getChangeSet()`: commit payload 후보를 만든다.
- `acceptChanges()`: 저장 성공 후 marker를 정리한다.
- `deleteRows()`: 삭제 marker와 callback을 발생시킨다.

Controlled mode에서 handle이 하면 안 되는 일:

- consumer-owned `data`를 내부에서 조용히 변경
- app의 refetch/cache update 없이 baseline을 임의 교체
- row 추가/삭제를 app state와 분리해서 확정

### Uncontrolled mode에서 handle이 할 수 있는 일

- `insertRows()`: 내부 row 추가
- `load()`: 내부 data 교체
- `revertChanges()`: 내부 baseline으로 되돌림
- `hardReset()`: mount 초기값으로 reset

단, 이 API들은 controlled mode 정책과 충돌할 수 있으므로 별도 slice로 설계한다.

## App 화면 구현 패턴

### Controlled readonly 조회

```tsx
const { data = [], dataUpdatedAt, refetch } = useQuery(...);

return (
  <GenDataGrid
    data={data}
    dataVersion={dataUpdatedAt}
    columns={columns}
    getRowId={getRowId}
    readOnly
    enableVirtualization
  />
);
```

### Controlled CRUD

```tsx
const [rows, setRows] = useState<TData[]>([]);
const [dataVersion, setDataVersion] = useState(0);

return (
  <GenDataGridCrud
    data={rows}
    dataVersion={dataVersion}
    columns={columns}
    getRowId={getRowId}
    onCommit={async ({ changes }) => {
      const result = await saveChanges(changes);
      if (result.ok) {
        setRows(result.nextRows);
        setDataVersion((prev) => prev + 1);
      }
      return result;
    }}
  />
);
```

### Uncontrolled local tool

```tsx
const gridRef = useRef<GenDataGridHandle<MyRow>>(null);

return (
  <>
    <GenDataGrid
      ref={gridRef}
      defaultData={initialRows}
      columns={columns}
      getRowId={getRowId}
    />
    <button
      type="button"
      onClick={() => {
        const rows = gridRef.current?.getData() ?? [];
        submitLocalResult(rows);
      }}
    >
      Apply
    </button>
  </>
);
```

## 주의할 점

- `data`와 `defaultData`를 동시에 의미 있게 사용하지 않는다. 화면은 둘 중 하나를 선택해야 한다.
- 서버 데이터 화면에서 uncontrolled mode를 쓰면 refetch 후 grid 내부 상태와 서버 상태가 어긋날 수 있다.
- controlled mode에서는 `dataVersion`을 저장 성공 또는 refetch 완료 시점에 갱신한다.
- `getRowId`는 index만 사용하지 않는다. 정렬, 필터, row 추가/삭제가 있으면 dirty/delete marker가 잘못 연결될 수 있다.
- app 화면이 `GenDataGridCrud`를 쓴다면 직접 dirty store를 또 만들지 않는다. 필요한 값은 `onDirtyStateChange`, `getChangeSet`, CRUD state callback으로 받는다.

## 권장 기본값

- 업무 조회 화면: controlled
- 업무 CRUD 화면: controlled + `GenDataGridCrud`
- Storybook/example: uncontrolled 가능
- local-only import/preview tool: uncontrolled 가능
- 서버 저장이 있는 화면: controlled
- 여러 component가 같은 data를 보는 화면: controlled
