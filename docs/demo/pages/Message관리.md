# Message 관리 페이지 운영 가이드

## 1. 목적
- 운영자가 다국어 메시지(`namespace + messageCd + langCd`)를 조회/등록/수정/삭제하는 관리자 화면이다.
- 런타임 i18n 조회 API와 분리된 관리 화면이며, 관리 API는 `mis-admin-message-api.md` 스펙을 따른다.

## 2. 메뉴/라우팅 구조 (DATA_DRIVEN_MENU 기준)
- 메뉴 데이터 소스: `/api/app-menus`
- 페이지 연결 우선순위:
  - 1순위: DB `execComponent`
  - 2순위: 프론트 폴백 매핑(`menuData.ts > componentNameByMenuId`)
- Message 페이지 컴포넌트 이름: `MessageManagementPage`
- 동적 로딩 등록 파일: `apps/demo/src/app/config/componentRegistry.dynamic.ts`

## 3. 운영 반영 시 필수 설정
### 3.1 DB 메뉴 설정
- 테이블: `app_menus`(운영 시스템 기준)
- 권장 값:
  - `menu_name`: Message Management
  - `parent_menu_id`: System 메뉴 ID
  - `exec_component`: `MessageManagementPage`
  - `display_yn`: `Y`
  - `use_yn`: `Y`
  - `sort_order`: 운영 정책에 맞게 설정

### 3.2 프론트 폴백 매핑
- 파일: `apps/demo/src/app/menu/menuData.ts`
- 목적: DB 응답에 `execComponent`가 누락되거나 빈 값일 때 메뉴 진입 보장
- 현재 폴백 매핑:
  - `900500 -> MessageManagementPage`
  - 아이콘: `Languages`

## 4. 권한/접근 정책
- API 문서 기준으로 관리자 권한(예: `ROLE_ADMIN`)만 접근 가능해야 한다.
- 운영 점검 시 확인 항목:
  - 비관리자 계정 접근 차단
  - 세션 만료/권한 부족 시 표준 에러 응답 반환

## 5. 화면 기능 요약
- 경로: `apps/demo/src/pages/admin/message/MessageManagementPage.tsx`
- 제공 기능:
  - 필터 검색: `namespace`, `langCd`, `messageCd`, `q(messageTxt)`
  - 그리드 CRUD: 생성/수정/삭제 일괄 저장
  - 복합키 기준 관리: `(namespace, messageCd, langCd)`
- 저장 실패 시:
  - `409` 충돌은 "이미 존재하는 메시지 키입니다."로 노출
  - 기타 오류는 공통 알림으로 노출

## 6. 운영 API 확인 포인트
- 목록: `GET /api/mis/admin/messages`
- 생성: `POST /api/mis/admin/messages`
- 수정: `PUT /api/mis/admin/messages/{namespace}/{messageCd}/{langCd}`
- 삭제: `DELETE /api/mis/admin/messages/{namespace}/{messageCd}/{langCd}`
- 기본 검증:
  - 필수값: `namespace`, `messageCd`, `langCd`, `messageTxt`
  - `messageCd` 공백 금지
  - `langCd` 형식: `ko`, `en`, `en-US`

## 7. 장애 점검 체크리스트
1. 메뉴는 보이는데 페이지가 안 열림
- `/api/app-menus` 응답에서 대상 메뉴의 `execComponent` 확인
- `execComponent === MessageManagementPage` 확인
- `componentRegistry.dynamic.ts`에 동일 이름 등록 여부 확인

2. 페이지는 열리는데 목록이 비정상
- 브라우저 네트워크에서 `/api/mis/admin/messages` 상태코드/응답 확인
- 필터 파라미터 오탈자(`langCd`, `messageCd`, `q`) 확인
- 서버 측 권한/인증 실패(401/403) 여부 확인

3. 저장 시 실패
- 409 충돌인지 확인(동일 복합키 중복)
- 입력값 형식 오류(`messageCd` 공백, `langCd` 형식) 확인
- 서버 에러 포맷(`code`, `messageKey`, `message`) 확인

## 8. 배포 후 검증 시나리오
1. 관리자 계정으로 System > Message Management 진입
2. `namespace=userEntity`로 검색 후 목록 조회 확인
3. 신규 메시지 1건 생성 후 즉시 조회 확인
4. 동일 키 재생성 시 409 충돌 메시지 확인
5. 기존 메시지 수정 후 반영 확인
6. 메시지 삭제 후 재조회 시 미노출 확인

## 9. 관련 파일
- 페이지:
  - `apps/demo/src/pages/admin/message/MessageManagementPage.tsx`
  - `apps/demo/src/pages/admin/message/MessageManagementColumns.tsx`
  - `apps/demo/src/pages/admin/message/MessageManagementCrud.ts`
- API/모델:
  - `apps/demo/src/entities/system/message/api/message.ts`
  - `apps/demo/src/entities/system/message/model/types.ts`
- 메뉴 연결:
  - `apps/demo/src/app/config/componentRegistry.dynamic.ts`
  - `apps/demo/src/app/menu/menuData.ts`
