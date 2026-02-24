Role 관리 페이지 TODO (apps/demo)

## 1. API 스펙 확정
- Role 필드 정의 확정 (id, name, description, useFlag 등)
- GET /api/roles 응답 형태 확인 (Role[] vs { items: Role[] })
- POST/PUT 요청 바디 필드 확정
- DELETE /api/roles/{id} 응답 형태 확정

## 2.모델 타입 추가
- types.ts 생성
- Role, RoleRequest, RoleListParams 정의

## 3.API/Query 레이어 추가
- role.ts 생성
- 구현:
    - roleApi.list → GET /api/roles
    - roleApi.get → GET /api/roles/{id}
    - roleApi.create → POST /api/roles
    - roleApi.update → PUT /api/roles/{id}
    - roleApi.remove → DELETE /api/roles/{id}
    - useRoleListQuery
- menuApi처럼 배열/items 둘 다 대응 처리

## 4. 페이지/컬럼 컴포넌트 생성
- RoleManagementPage.tsx 생성
- RoleManagementColumns.tsx 생성
- RoleManagementPage.module.css 생성
- 패턴은 UserManagementPage 재사용:
    - GenGridCrud<Role>
    - commitRoleChanges(create/update/delete 일괄 커밋)
    - onCommitError 알림 처리

## 5.라우팅 컴포넌트 레지스트리 연결
- componentRegistry.dynamic.ts
- 'RoleManagementPage': () => import('@/pages/admin/role/RoleManagementPage') 추가

## 6. 메뉴-컴포넌트 매핑 연결
- menuData.ts
- componentNameByMenuId에 'role-management': 'RoleManagementPage' 추가
- (iconByMenuId의 'role-management': 'Shield'는 이미 존재)


## 7. 메뉴 데이터(개발환경) 점검
- menu.ts에 role 관리 메뉴 엔트리 확인/추가
- 실제 DB 메뉴 사용 시 menuId/url(componentName) 매핑 확인

## 8. UX/검증
- 생성 시 필수값 검증(예: role name)
- 삭제 confirm
- 저장 성공/실패 메시지
- 목록 재조회(refetch 또는 query invalidate)

## 9. 완료 조건(DoD)
- Role 목록 조회 동작 (GET /api/roles)
- 행 추가/수정/삭제 각각 정상 동작 (POST/PUT/DELETE)
- 페이지 메뉴 클릭 시 RoleManagementPage 정상 렌더링
- 새로고침 후에도 메뉴 진입/조회 정상


# 빌드 가능 단계
## 1. types + api만 추가
role 타입/roleApi/useRoleListQuery만 만들고 아직 어디서도 import 안 하면 빌드 영향 거의 없습니다.

## 2. columns 추가
RoleManagementColumns.tsx 생성(미사용 상태)
타입만 맞으면 단독으로도 빌드 통과합니다.

## 3. page 추가(라우트 미연결)
RoleManagementPage.tsx 생성
GenGridCrud 최소 컬럼/데이터 연결만 하고 컴포넌트 레지스트리에는 아직 연결 안 해도 됩니다.

## 4. componentRegistry 연결
RoleManagementPage 등록
이 단계에서 경로/기본 export만 맞으면 빌드 통과.

## 5. menuData 매핑 연결
'role-management': 'RoleManagementPage' 추가
메뉴 데이터에 항목이 있으면 UI 진입 가능, 없어도 빌드는 통과.

## 6. CRUD 커밋 로직/검증 추가
onCommit, onCommitError, confirm/alert 추가