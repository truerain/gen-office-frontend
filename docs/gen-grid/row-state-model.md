# GenGrid Row State Model

이 문서는 기존 정의를 취소하고 아래 4개 상태를 기준으로 다시 정의한다.

## 용어 정의

### 1) `selectedRow`
- `row-selection` 체크박스를 클릭해서 선택된 행 집합
- 행 단위 선택 상태
- 다중 선택 가능

### 2) `selectedRange`
- 셀을 드래그해서 선택한 범위
- 셀 범위 선택 상태 (`start/end` 좌표 기반)
- 단일 범위 또는 다중 범위는 구현 정책으로 결정

### 3) `activeRow`
- 현재 `activeCell`이 속한 행
- 단일 개념
- `activeCell.rowId`로 파생되는 개념을 유지

### 4) `activeCell`
- 현재 포커스된 단일 셀
- 키보드 이동/편집의 기준점

## 상태 관계

- `activeRow`는 독립 저장 상태가 아니라 `activeCell`에서 파생한다.
- `selectedRow`와 `selectedRange`는 서로 다른 선택 모델이다.
- `selectedRow`는 체크박스 기반의 행 선택이고, `selectedRange`는 드래그 기반의 셀 범위 선택이다.
- `activeCell`은 포커스 상태이며 `selectedRow`/`selectedRange`와 분리해서 유지할 수 있다.

## 상호작용 규칙

1. 체크박스 클릭
- `selectedRow`를 갱신한다.
- `selectedRange`는 변경하지 않는다.

2. 셀 드래그
- `selectedRange`를 갱신한다.
- `selectedRow`는 변경하지 않는다.

3. 셀 클릭/키보드 이동
- `activeCell`을 갱신한다.
- `activeRow`는 `activeCell`로부터 자동 파생된다.

## 렌더링 원칙

- `selectedRow`: 행 단위 강조 스타일
- `selectedRange`: 셀 범위 강조 스타일
- `activeRow`: 현재 행 컨텍스트 스타일
- `activeCell`: 현재 포커스 셀 스타일

각 상태의 시각적 의미를 분리해 동시에 표시 가능해야 한다.