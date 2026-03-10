# GenGrid Range Selection

이 문서는 GenGrid의 `selectedRange` 구현 원칙을 정리한다.

## 목적

- 셀 드래그 기반 범위 선택(`selectedRange`)을 일관되게 제공한다.
- `pinned` 컬럼과 스크롤 영역을 넘나드는 드래그에서도 범위 누락이 없도록 한다.
- 화면에 보이지 않는(가려진/가상화된) 중간 셀도 논리적으로 범위에 포함한다.

## 상태 모델 연계

- `selectedRow`: 체크박스(`row-selection`) 기반 행 선택
- `selectedRange`: 셀 드래그 기반 범위 선택
- `activeRow`: `activeCell`에서 파생
- `activeCell`: 현재 포커스 셀

`selectedRow`와 `selectedRange`는 서로 독립적으로 유지한다.

## 핵심 설계 원칙

1. DOM 기준이 아니라 논리 좌표 기준으로 계산한다.
- 컬럼: `columnId -> logicalColIndex`
- 행: `rowId -> logicalRowIndex`
- 범위: `(rowMin..rowMax) x (colMin..colMax)`

2. pinned left/center/right를 하나의 선형 컬럼 축으로 취급한다.
- 시작 셀과 현재 셀의 논리 인덱스 사이 컬럼은 모두 포함
- 스크롤로 중간 컬럼이 화면에 없어도 포함

3. 가상화(virtualization)와 무관하게 상태는 전체 모델 기준으로 유지한다.
- 렌더링은 보이는 셀만 하되, 선택 상태는 전체 logical range로 관리

4. 포함 판정은 좌표 기반으로만 수행한다.
- `isCellInRange(cell) = rowIndex 범위 포함 && colIndex 범위 포함`
- 요소 visibility/DOM 존재 여부를 판정 기준으로 사용하지 않음

## 이벤트 규칙

1. 시작
- `mousedown` on cell -> range anchor 설정

2. 갱신
- drag 중 현재 cell 갱신 -> anchor와 focus 사이 logical rectangle 재계산

3. 종료
- `mouseup` -> range 확정
- `Escape` -> range clear

4. 첫 번째 컬럼 특수 규칙
- 첫 번째 컬럼 셀을 클릭하면 해당 row의 "전체 visible 컬럼"을 `selectedRange`로 지정한다.
- 첫 번째 컬럼 셀에서 드래그를 시작하면 `selectedRange`는 cell 단위가 아니라 row 단위로 확장한다.
- row 단위 확장 시 컬럼 범위는 항상 "전체 visible 컬럼"으로 고정하고, 드래그로는 row 범위만 확장한다.
- pinned/스크롤 상태와 무관하게 중간에 가려진 컬럼도 동일 row 범위에 포함된 것으로 간주한다.

5. 충돌 방지
- 체크박스 클릭은 `selectedRow`만 갱신
- 셀 드래그는 `selectedRange`만 갱신

## Pinned + 스크롤 드래그 보완 포인트

1. 스크롤된 상태에서 center -> pinned left(또는 반대) 드래그 시
- 시작/현재 셀의 logical index로 범위를 확정
- 중간 offscreen 셀 전부 range 포함

2. 포인터가 셀 경계/빈 공간을 지나갈 때
- 마지막 유효 셀 좌표를 유지하고 다음 유효 셀에서 범위 재계산
- 필요 시 `document` 레벨 move/up 추적으로 드래그 일관성 확보

3. 컬럼 포함 정책
- 기본: visible 컬럼만 포함 (`columnVisibility=false` 제외)
- 확장 옵션: 숨김 컬럼 포함 정책은 별도 옵션으로 분리 가능

## 스타일 우선순위

권장 우선순위:
`activeCell > selectedRange > activeRow > selectedRow`

동시에 성립 가능한 상태는 시각적으로 공존 가능해야 한다.

## 테스트 체크리스트

1. 가로 스크롤 끝 상태에서 center 셀 -> pinned left 드래그
2. pinned left 셀 -> center far-right 드래그
3. 중간 컬럼 다수가 offscreen인 상태에서 범위 누락 없는지 검증
4. 첫 번째 컬럼 클릭 시 해당 row 전체 visible 컬럼이 range로 지정되는지 검증
5. 첫 번째 컬럼에서 위/아래 드래그 시 row 단위로 range 확장되는지 검증
6. 첫 번째 컬럼에서 드래그 시작 후 스크롤/고정 컬럼 경계를 넘겨도 row 단위 range가 유지되는지 검증
7. row-selection 체크박스와 range-selection 동시 사용 시 비간섭 검증
8. 가상 스크롤(행 virtualized) 상태에서 범위 상태 일관성 검증