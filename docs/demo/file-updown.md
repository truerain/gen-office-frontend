# 파일 업로드/다운로드 컴포넌트 설계 (Notice 적용)

## 1. 목표
- 첨부 파일은 선택 즉시 업로드하지 않는다.
- Notice 저장 시점에만 첨부 파일을 업로드한다.
- 저장 순서는 `첨부 업로드 -> Notice 저장`으로 고정한다.

## 2. 대상 API
- `GET /api/common/files/newFileSetId`
- `GET /api/common/files/list/{fileSetId}`
- `POST /api/common/files/upload`
- `DELETE /api/common/files/{fileSetId}/{fileId}`
- `GET /api/common/files/download/{fileSetId}/{fileId}`

## 3. 책임 분리
### 3.1 NoticeDraftPanel
- `draft.fileSetId`가 없으면 `commonFileApi.getNewFileSetId()`로 선발급한다.
- 발급된 `fileSetId`를 draft에 반영하고 `FileAttachmentPanel`로 전달한다.

### 3.2 FileAttachmentPanel
- 서버 목록(`기존 첨부파일`) 조회/다운로드를 담당한다.
- 파일 선택 시 업로드하지 않고 `저장 대기 파일` 목록만 관리한다.
- 기존 파일 삭제도 즉시 호출하지 않고 `삭제 대기` 목록으로 관리한다.
- 부모의 업로드 신호(`uploadRequestId`)를 받으면 `pending files`만 업로드한다.
- 저장 신호 시 처리 순서: `삭제 대기 파일 일괄 삭제 -> 저장 대기 파일 일괄 업로드`
- 업로드 완료 결과를 부모 콜백(`onUploadDone`)으로 전달한다.

### 3.3 NoticeManagementPage
- 저장 버튼 클릭 시 `uploadRequestId`를 증가시켜 Panel에 업로드를 요청한다.
- Panel 업로드 완료를 기다린 뒤 Notice 저장 API를 호출한다.

## 4. 저장 시퀀스
1. 사용자 Save 클릭
2. NoticeManagementPage가 FileAttachmentPanel에 업로드 요청
3. FileAttachmentPanel이 `delete pending` 삭제 후 `pending files` 업로드
4. 업로드 완료 콜백 성공 시 Notice 저장 API 호출
5. Notice 저장 성공 후 목록/상세 재조회

## 5. 화면 표시 규칙
- 섹션 1: `기존 첨부파일` (서버 목록)
- 섹션 2: `저장 대기 파일` (사용자 선택, 미업로드)
- 저장 대기 파일은 개별 제거 가능

## 6. 예외 처리
- `fileSetId` 없이 업로드 요청이 들어오면 실패 콜백을 반환하고 Notice 저장을 중단한다.
- 삭제/업로드 중 하나라도 실패하면 Notice 저장을 진행하지 않는다.
- 다운로드 파일명은 `Content-Disposition` 우선, 없으면 목록 파일명 fallback.

## 7. 테스트 체크리스트
1. `fileSetId` 없는 공지 열기 시 자동 선발급 여부
2. 파일 선택 시 즉시 업로드되지 않고 `저장 대기 파일`에만 표시되는지
3. Save 시 첨부 업로드 후 Notice 저장 순서가 보장되는지
4. 첨부 업로드 실패 시 Notice 저장이 중단되는지
5. 저장 후 재조회 시 기존 첨부 목록이 정상 반영되는지
