# CRUD Guide (MenuManagementPage)

GenGridCrud를 화면에서 사용할 때, 화면에서 처리해야 할 CRUD 관련 처리 기준을 정리한다.  
기준 화면: `apps/demo/src/pages/admin/menu/MenuManagementPage.tsx`

## 1) `createRow`

목적:
- 추가(Add) 버튼 클릭 시 신규 행 기본값 생성

기본 처리:
- 생성 로직은 `MenuManagementCrud.ts`의 `createMenuRow`로 분리
- 페이지에서는 `selectedNode`만 전달해서 호출

코드:

```tsx
createRow={() => createMenuRow(selectedNode)}
```

## 2) `makePatch`

목적:
- 셀 편집값을 CRUD patch 형태로 변환

기본 처리:
- 단일 컬럼 변경을 `{ [columnId]: value }`로 생성
- 해당 patch는 내부 `changes` 누적에 사용

코드:

```tsx
makePatch={({ columnId, value }) => ({ [columnId]: value } as Partial<Menu>)}
```

## 3) `beforeCommit`

목적:
- 저장 전 검증/사용자 확인
- `false` 반환 시 커밋 중단

기본 처리:
1. `validateMenuChanges(changes)` 실행
2. 실패 시 첫 에러 코드(`validation.errors[0]?.code`)를 기준으로 i18n 메시지 결정
3. `openAlert({ title })` 후 `false` 반환
4. 성공 시 `openConfirm({ title: t('common.confirm_save') })` 반환

코드:

```tsx
beforeCommit={({ changes }) => {
  const validation = validateMenuChanges(changes);
  if (!validation.ok) {
    const code = validation.errors[0]?.code;
    const title =
      code === 'MENU_ID_REQUIRED'
        ? t('admin.menu.validation.menu_id_required', {
            defaultValue: 'Please enter Menu ID.',
          })
        : t('common.validation.invalid_input', {
            defaultValue: 'Please check your input.',
          });
    void openAlert({ title });
    return false;
  }
  return openConfirm({
    title: t('common.confirm_save', { defaultValue: 'Do you want to save?' }),
  });
}}
```

## 4) `onCommit`

목적:
- 서버 커밋 + 재조회 + 화면 동기화 + 성공 안내

기본 처리:
1. `commitMenuChanges(changes, ctx.viewData)`로 서버 저장
2. `refetchMenuList()`로 트리 데이터 재조회
3. `setMenuData(refreshed.data)`로 반영
4. `fetchChildren(selectedNodeId)`로 우측 목록 재조회
5. `setMenuVersion((v) => v + 1)`로 그리드 버전 갱신
6. `openAlert({ title: t('common.saved') })` 표시
7. `{ ok: true }` 반환

코드:

```tsx
onCommit={async ({ changes, ctx }) => {
  await commitMenuChanges(changes, ctx.viewData);

  const refreshed = await refetchMenuList();
  if (refreshed.data) {
    setMenuData(refreshed.data);
  }

  await fetchChildren(selectedNodeId);
  setMenuVersion((v) => v + 1);
  await openAlert({
    title: t('common.saved', { defaultValue: 'Saved successfully.' }),
  });
  return { ok: true };
}}
```

## 5) `onCommitError`

목적:
- 커밋 실패 로그/사용자 안내

기본 처리:
1. `console.error(error)` 로깅
2. 메시지 결정: `error.message` 우선, 없으면 i18n 기본 문구 사용
3. `addNotification(message, 'error')` 표시

코드:

```tsx
onCommitError={({ error }) => {
  // eslint-disable-next-line no-console
  console.error(error);
  const message =
    error instanceof Error
      ? error.message
      : t('common.commit_failed', { defaultValue: 'Commit failed (see console)' });
  addNotification(message, 'error');
}}
```

## 관련 파일

- `apps/demo/src/pages/admin/menu/MenuManagementPage.tsx`
- `apps/demo/src/pages/admin/menu/MenuManagementCrud.ts`
- `apps/demo/src/pages/admin/menu/api/menu.ts`
