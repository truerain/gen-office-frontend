# GenGrid Row State Model

이 문서는 `CheckedRow`, `SelectedRow`, `ActiveRow`, `ActiveCell` 개념을 분리해서 정의한다.

## 용어 정의

### 1) `CheckedRow`
- 체크박스로 선택된 행 집합
- 다중 선택 가능
- 보통 `rowSelection` 상태와 1:1로 매핑

### 2) `SelectedRow`
- 업무적으로 "선택된 행" 집합
- 포커스가 없어도 유지됨
- 다중 선택 가능
- 체크박스 선택, 단축키 선택, 기타 선택 UX를 수용하는 상위 개념

### 3) `ActiveRow`
- 현재 포커스된 셀(`ActiveCell`)이 속한 행
- 단일 개념
- 실질적으로 `activeCell?.rowId`로 파생

### 4) `ActiveCell`
- 현재 포커스된 단일 셀
- 키보드 내비게이션/편집 컨텍스트의 기준

## 상태 관계

- `ActiveRow`는 독립 저장 상태가 아니라 `ActiveCell`로부터 파생되는 개념이다.
- `SelectedRow`는 `ActiveCell`과 독립적으로 존재한다.
- `CheckedRow`는 "체크박스 선택 UI" 관점의 집합이며, 구현 정책에 따라 `SelectedRow`와 동일 집합으로 운영할 수 있다.

## 동기화 규칙 (합의안)

1. 기본 규칙
- `SelectedRow`는 기본적으로 `ActiveCell`을 따라간다.
- 단, `ActiveCell`이 없는 상태에서도 `SelectedRow`는 존재/유지될 수 있다.

2. 멀티 선택
- `SelectedRow`는 다른 입력 방식(체크박스, 단축키 등)으로 멀티 선택될 수 있다.

3. 포커스 재발생
- 다시 `ActiveCell`이 생기면 해당 row를 `SelectedRow`에 반영한다.
- 반영 방식(`replace` 또는 `add`)은 화면 정책으로 결정한다.

## 권장 UX 정책

1. 단일 클릭
- `ActiveCell`/`ActiveRow` 갱신
- `SelectedRow` 반영 정책은 화면별로 명시 (`replace` 권장)

2. 멀티 입력(Ctrl/Shift/체크박스)
- `SelectedRow` 집합 갱신
- `ActiveCell`은 유지 또는 입력 위치로 갱신

3. 스타일 구분
- `ActiveRow`와 `SelectedRow`는 시각 스타일을 분리한다.
- Active는 "현재 커서 문맥", Selected는 "업무 선택 집합" 의미를 유지한다.

## 구현 메모

- 현재 GenGrid는 `ActiveRow` 하이라이트를 `activeCell?.rowId` 기준으로 판단한다.
- 즉, `ActiveCell`이 없으면 `ActiveRow` 하이라이트는 표시되지 않는다.
- `SelectedRow`를 `CheckedRow`와 분리해 운영하려면 별도 상태/이벤트 설계가 필요하다.
