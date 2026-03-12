# 파일 업로드/다운로드 컴포넌트 설계 (Notice 적용)

## 1. 목적
- `fileSetId` 기반 다중 파일 업로드/다운로드를 공통 컴포넌트로 분리한다.
- Notice 화면에서 임시 로컬 파일 상태(`File[]`)를 제거하고 서버 API 기반으로 동작시킨다.
- 이후 다른 화면에서도 동일 컴포넌트를 재사용할 수 있게 한다.

## 2. 대상 API
- `POST /api/common/files/upload`
- `GET /api/common/files/newFileSetId`
- `GET /api/common/files/list/{fileSetId}`
- `GET /api/common/files/download/{fileSetId}/{fileId}`

## 3. 핵심 개념
- `fileSetId`: 하나의 첨부 그룹 식별자(공지 1건당 1개 사용 권장)
- `fileId`: 첨부 그룹 내 개별 파일 식별자
- 업로드/목록/다운로드는 모두 `fileSetId`를 기준으로 동작한다.

## 4. 현재 상태와 이슈
- Notice 화면은 첨부를 로컬 상태로만 보관하고 서버 업로드를 수행하지 않는다.
- 공통 HTTP 유틸(`shared/api/http.ts`)은 JSON 전용 동작으로 구현되어 있어:
  - 멀티파트 업로드(`FormData`)
  - 바이너리 다운로드(`Blob`)
  를 바로 처리하기 어렵다.

## 5. 제안 아키텍처
### 5.1 공통 API 모듈
- 파일: `apps/demo/src/shared/api/commonFile.ts`
- 제공 함수(예시):
  - `getNewFileSetId(): Promise<string>`
  - `uploadFiles(params: { fileSetId: string; files: File[] }): Promise<void>`
  - `listFiles(fileSetId: string): Promise<CommonFileItem[]>`
  - `downloadFile(params: { fileSetId: string; fileId: string | number }): Promise<{ blob: Blob; fileName: string }>`

### 5.2 공통 UI 컴포넌트
- 파일: `apps/demo/src/shared/ui/file/FileAttachmentPanel.tsx`
- 역할:
  - 파일 선택(다중)
  - 업로드 실행
  - 업로드된 파일 목록 표시
  - 파일 클릭 다운로드
- 필수 props(예시):
  - `fileSetId?: string`
  - `onFileSetIdChange?: (next: string) => void`
  - `disabled?: boolean`

### 5.3 Notice 적용
- 파일: `apps/demo/src/pages/admin/notice/NoticeDraftPanel.tsx`
- 변경 방향:
  - 기존 `input type="file"` + 로컬 목록 UI 제거
  - `FileAttachmentPanel` 삽입
  - `draft.fileSetId`와 패널을 바인딩
- 저장 시점:
  - 공지 저장 payload에는 기존대로 `fileSetId`만 전달한다.

## 6. 사용자 동작 시나리오
1. 사용자가 첨부영역에서 파일 선택
2. `fileSetId`가 없으면 `newFileSetId` 먼저 발급
3. `upload` API로 다중 파일 업로드
4. 업로드 성공 후 `list` 재조회로 목록 갱신
5. 사용자가 파일명을 클릭하면 `download` API 호출 후 저장
6. 공지 저장 시 `notice.fileSetId`만 서버에 저장

## 7. 구현 시 주의사항
- `fileSetId`가 공백이면 업로드를 막고 자동 발급 로직을 우선 수행한다.
- 다운로드 파일명은 `Content-Disposition` 우선 사용, 없으면 목록의 파일명 fallback 사용.
- 동일 파일 재업로드 정책(허용/차단/덮어쓰기)은 백엔드 규칙에 맞춘다.
- 저장하지 않고 화면 이탈 시 orphan 파일 가능성이 있으므로 서버 정리 정책(배치/TTL) 필요.

## 8. 테스트 체크리스트
1. 파일 1개 업로드/목록/다운로드
2. 파일 여러 개 동시 업로드/목록/다운로드
3. `fileSetId` 없는 상태에서 첫 업로드(자동 발급 확인)
4. Notice 저장 후 재조회 시 기존 첨부 목록 유지
5. API 실패 시 오류 메시지 노출(업로드/목록/다운로드 각각)

## 9. 구현 대상 파일
- `apps/demo/src/shared/api/commonFile.ts` (신규)
- `apps/demo/src/shared/ui/file/FileAttachmentPanel.tsx` (신규)
- `apps/demo/src/shared/ui/file/FileAttachmentPanel.module.css` (신규)
- `apps/demo/src/pages/admin/notice/NoticeDraftPanel.tsx` (수정)
- `apps/demo/src/pages/admin/notice/NoticeManagementPage.tsx` (수정)
- `apps/demo/src/mocks/handlers/commonFile.handlers.ts` (신규, MSW 사용 시)
- `apps/demo/src/mocks/handlers/index.ts` (수정, 핸들러 등록)
