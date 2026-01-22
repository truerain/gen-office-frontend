## 2025.01.22

GenGridCrud 개념 요약

GenGrid는 “순수 그리드”이고, GenGridCrud는 “CRUD 편의 + 변경 추적 + 커밋”을 얹는 브리지 퍼예요.

내부적으로 usePendingChanges로 변경사항을 누적하고, applyDiff로 baseData + pending 을 합쳐서 화면(viewData)을 만듭니다.

사용자는 data(base), columns, getRowId만 주면 되고, 편집 결과는 onCommit 시점에 모아서 전달됩니다.


#### 현재 GenGridCrud의 주요 흐름(파일: GenGridCrud.tsx)

- usePendingChanges: create/update/delete를 저장해 “pending changes”를 관리
- applyDiff: base data + pending을 합쳐서 viewData를 만들고, 삭제 row는 숨김 처리
- onDataChange: GenGrid가 반환한 nextViewData와 이전 gridData를 비교해서 patch 생성 → pending update
- CrudActionBar: Add/Delete/Reset/Save 버튼들 연결
- onCommit: 모인 changes를 한 번에 넘겨서 서버 저장(또는 로컬 적용)


#### CustomerTable에서 주의할 점(파일: CustomerTable.tsx)
현재 onCommit에서 data, setData를 사용하지만 정의가 없습니다. (gridState.rows를 사용하거나 별도 state가 필요)

applyChangesLocally가 주석 처리돼 있고, 실제로는 아무 것도 반환하지 않아서 커밋 후 데이터 갱신이 되지 않습니다.

usePendingDiffTracker는 별도 diff 추적용인데, GenGridCrud의 pending과 중복될 수 있어요. 의도에 따라 정리 필요.

#### “완성”을 위해 필요한 결정 포인트
1. 커밋 후 데이터 반영을 어디에서 할지
옵션 A: 서버 응답(nextData)로 gridState.rows를 교체
옵션 B: 로컬에서 applyChangesLocally로 먼저 반영 후, 서버로 동기화

2. 변경 추적을 어디에서 볼지
옵션 A: GenGridCrud의 onStateChange로 changes/dirty만 사용
옵션 B: 기존 usePendingDiffTracker 유지(중복될 수 있음)

3. createRow id 정책
임시 id를 프론트에서 만들고 서버가 확정 id를 주는 패턴인지?

원하시는 방향 알려주세요. 예를 들면:
“로컬에서 즉시 반영 + 서버 동기화”
“저장 버튼 눌렀을 때만 반영”
“삭제는 soft delete(숨김)로 유지하고 서버에서 확정”
“usePendingDiffTracker는 제거”



---
커밋 → 서버 저장 → 재조회 패턴에 맞게 CustomerTable에서 로컬 적용 로직을 제거하고, 상위에서 커밋/리프레시를 주입받도록 연결했어요. 이제 GenGridCrud 저장 버튼은 onCommit을 통해 서버 저장 함수만 호출하고, 성공 시 onRefetch로 재조회합니다.

변경 내용

CustomerTable.tsx: onCommit/onRefetch props 추가, 로컬 apply 제거, 커밋 성공 시 재조회 호출
CustomerInfoPage.tsx: handleCommit 추가(현재 TODO stub), CustomerTable에 onCommit/onRefetch 전달
다음에 할 일(선택)

handleCommit에서 실제 create/update/delete mutation 연결
상단 CustomerActionBar의 저장 버튼을 GenGridCrud 저장 흐름과 합치거나 제거
onDiffChange를 GenGridCrud의 onStateChange로 대체해서 변경 추적 통일
원하시면 1번부터 바로 이어서 구현해줄게요.



확인 포인트

행 체크 → 삭제 버튼 클릭 시 pending delete 반영
row-status가 생성/수정/삭제 상태에 맞게 +/●/×로 표시되는지
다음 원하면 이어서

삭제 상태의 행을 “숨김” 대신 “취소선 표시 + 회색 처리”로 바꾸기
row-status 심볼/색상 디자인 더 정교화 (아이콘/tooltip)


삭제된 created row를 “숨김” 대신 “회색 + 취소선” 표시
tempId 키명을 옵션으로 노출해서 커스터마이즈 가능하게 하기
필요하면 바로 이어서 적용할게.
