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



기본 renderer/editor 기반 구조를 추가했어.
meta.format으로 렌더링, meta.editType으로 기본 에디터가 동작하고, 필요한 경우 meta.renderCell/meta.renderEditor로 언제든 확장 가능하도록 구성했어. 헬퍼 함수도 같이 넣어서 앱에서 편하게 메타를 채울 수 있게 했어.

변경 내용

기본 렌더러: meta.format에 따라 숫자/통화/퍼센트/날짜/불리언 표시
기본 에디터: meta.editType에 따라 text/number/date/select/textarea/checkbox 렌더
메타 확장 타입 보강 + 헬퍼 함수 제공
editType만 있어도 편집 가능하도록 수정
수정/추가 파일

cellFormat.ts (기본 포맷터)
utils.ts (메타 타입 확장)
GenGridCell.tsx (렌더/에디터 적용)
useCellEditing.ts (editType 허용)
tanstack-table.d.ts (ColumnMeta 확장)
columnHelpers.ts (헬퍼 함수)
index.ts (헬퍼 export)
사용 방식 예시 (meta 기반 + 헬퍼)

// meta 직접 사용
{
  accessorKey: 'registeredAt',
  header: '가입일',
  meta: { format: 'date', editType: 'date', align: 'center', width: 110 },
}

// helper 사용
numberColumn<Customer>('totalOrders', '주문수', { width: 100, align: 'right' })
dateColumn<Customer>('registeredAt', '가입일', { width: 110, align: 'center' })
selectColumn<Customer>('status', '상태', {
  width: 100,
  align: 'center',
  options: [
    { label: '활성', value: 'ACTIVE' },
    { label: '비활성', value: 'INACTIVE' },
    { label: '대기중', value: 'PENDING' },
  ],
})
주의/확장 포인트

meta.format이 있으면 기본 렌더러가 우선 사용됨
(커스텀 렌더가 필요하면 meta.renderCell로 확장)
에디터 확장은 meta.renderEditor 사용
원하면 다음도 바로 추가해줄게:

meta.format용 커스텀 formatter registry (앱 단에서 교체)
editValidator/editParser/editFormatter 공식 지원
통화/날짜 포맷 전역 기본값 설정 API


리사이저 더블클릭 시 초기 width로 복원
드래그 중 body cursor/selection 방지
width 저장/복원 (localStorage 등)
