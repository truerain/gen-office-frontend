import { useEffect, useMemo, useRef, useState } from 'react';
import { ListTree, RefreshCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudRowId } from '@gen-office/gen-grid-crud';
import { SimpleFilterBar, SplitLayout, type FilterField } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { HttpError } from '@/shared/api/http';
import {
  commonCodeKeys,
  useCommonCodeClassListQuery,
  useCommonCodeItemListQuery,
} from '@/entities/system/common-code/api/commonCode';
import type {
  CommonCodeClassListParams,
  CommonCodeItemListParams,
} from '@/entities/system/common-code/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';

import styles from './CommonCodeManagementPage.module.css';
import {
  createCommonCodeClassColumns,
  createCommonCodeItemColumns,
} from './CommonCodeManagementColumns';
import {
  commitCommonCodeClassChanges,
  commitCommonCodeItemChanges,
  hasMissingCommonCodeClassRequired,
  hasMissingCommonCodeItemRequired,
  toCommonCodeClassRowId,
  toCommonCodeItemRowId,
  type CommonCodeClassGridRow,
  type CommonCodeItemGridRow,
} from './CommonCodeManagementCrud';

type ClassFilters = {
  lkupClssCd: string;
  lkupClssName: string;
  useYn: string;
  q: string;
};

const defaultClassFilters: ClassFilters = {
  lkupClssCd: '',
  lkupClssName: '',
  useYn: '',
  q: '',
};

const defaultClassCreateRow = {
  lkupClssCd: '',
  lkupClssName: '',
  lkupClssDesc: '',
  useYn: 'Y',
  createdAt: '',
  updatedAt: '',
};

const defaultItemCreateRow = {
  lkupClssCd: '',
  lkupCd: '',
  lkupName: '',
  lkupNameEng: '',
  sortOrder: 0,
  useYn: 'Y',
  createdAt: '',
  updatedAt: '',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function CommonCodeManagementPage(_props: PageComponentProps) {
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();
  const queryClient = useQueryClient();

  const [classGridDirty, setClassGridDirty] = useState(false);
  const [itemGridDirty, setItemGridDirty] = useState(false);

  const [draftClassFilters, setDraftClassFilters] = useState<ClassFilters>(defaultClassFilters);
  const [classFilters, setClassFilters] = useState<ClassFilters>(defaultClassFilters);

  const [selectedClassRowIds, setSelectedClassRowIds] = useState<readonly CrudRowId[]>([]);
  const [selectedClassCode, setSelectedClassCode] = useState<string | undefined>(undefined);

  const classTempSeqRef = useRef(1);
  const itemTempSeqRef = useRef(1);

  const classQueryParams = useMemo<CommonCodeClassListParams>(
    () => ({
      lkupClssCd: classFilters.lkupClssCd.trim() || undefined,
      lkupClssName: classFilters.lkupClssName.trim() || undefined,
      useYn: classFilters.useYn.trim().toUpperCase() || undefined,
      q: classFilters.q.trim() || undefined,
      page: 0,
      size: 200,
      sort: 'lkup_clss_cd asc',
    }),
    [classFilters]
  );

  const {
    data: classList = [],
    refetch: refetchClassList,
    dataUpdatedAt: classDataUpdatedAt,
  } = useCommonCodeClassListQuery(classQueryParams);

  const classRows = useMemo<CommonCodeClassGridRow[]>(
    () =>
      classList.map((item) => ({
        ...item,
        _rowId: toCommonCodeClassRowId(item),
      })),
    [classList]
  );

  useEffect(() => {
    if (!selectedClassCode) return;
    const exists = classRows.some((row) => row.lkupClssCd === selectedClassCode);
    if (exists) return;
    setSelectedClassCode(undefined);
    setSelectedClassRowIds([]);
  }, [classRows, selectedClassCode]);

  const itemQueryParams = useMemo<CommonCodeItemListParams>(
    () => ({
      page: 0,
      size: 200,
      sort: 'sort_order asc, lkup_cd asc',
    }),
    []
  );

  const {
    data: itemList = [],
    refetch: refetchItemList,
    dataUpdatedAt: itemDataUpdatedAt,
  } = useCommonCodeItemListQuery(selectedClassCode, itemQueryParams, Boolean(selectedClassCode));

  const itemRows = useMemo<CommonCodeItemGridRow[]>(
    () =>
      itemList.map((item) => ({
        ...item,
        _rowId: toCommonCodeItemRowId(item),
      })),
    [itemList]
  );

  const classColumns = useMemo(() => createCommonCodeClassColumns(), []);
  const itemColumns = useMemo(() => createCommonCodeItemColumns(), []);

  const classFilterFields = useMemo<FilterField<ClassFilters>[]>(
    () => [
      { key: 'lkupClssCd', title: 'Class Code', type: 'text', placeholder: '', flex: 0 },
      { key: 'lkupClssName', title: 'Class Name', type: 'text', placeholder: '', flex: 0 },
      { key: 'useYn', title: 'Use(Y/N)', type: 'text', placeholder: 'Y | N', flex: 0 },
      { key: 'q', title: 'Search', type: 'text', placeholder: 'Name/Desc', flex: 1 },
    ],
    []
  );

  const handleClassSearch = () => {
    const same =
      draftClassFilters.lkupClssCd.trim() === classFilters.lkupClssCd.trim() &&
      draftClassFilters.lkupClssName.trim() === classFilters.lkupClssName.trim() &&
      draftClassFilters.useYn.trim().toUpperCase() === classFilters.useYn.trim().toUpperCase() &&
      draftClassFilters.q.trim() === classFilters.q.trim();

    setClassFilters(draftClassFilters);
    if (same) {
      void queryClient.invalidateQueries({ queryKey: commonCodeKeys.classList(classQueryParams) });
      void refetchClassList();
    }
  };

  const refreshClassList = async () => {
    await queryClient.invalidateQueries({ queryKey: commonCodeKeys.classList(classQueryParams) });
    await refetchClassList();
  };

  const refreshItemList = async () => {
    if (!selectedClassCode) return;
    await queryClient.invalidateQueries({
      queryKey: commonCodeKeys.itemList(selectedClassCode, itemQueryParams),
    });
    await refetchItemList();
  };

  return (
    <div className={styles.page} data-grid-dirty={classGridDirty || itemGridDirty ? 'true' : 'false'}>
      <PageHeader
        title="Common Code Management"
        description="Manage lookup classes and detail codes."
        breadcrumbItems={[
          { label: 'System', icon: <ListTree size={16} /> },
          { label: 'Common Code Management', icon: <ListTree size={16} /> },
        ]}
      />
      <div className={styles.content}>
        <SplitLayout
          className={styles.splitLayout}
          leftWidth="60%"
          direction='vertical'
          resizable
          showResizeLine
          left={
            <div className={styles.pane}>
              <div className={styles.filter}>
                <SimpleFilterBar
                  value={draftClassFilters}
                  fields={classFilterFields}
                  onChange={setDraftClassFilters}
                  onSearch={handleClassSearch}
                  searchLabel="검색"
                />
              </div>
              <div className={styles.gridPane}>
                <GenGridCrud<CommonCodeClassGridRow>
                  key={`class-${classDataUpdatedAt}`}
                  title="Code Class List"
                  data={classRows}
                  columns={classColumns}
                  getRowId={(row) => row._rowId}
                  rowSelection={selectedClassRowIds}
                  onRowSelectionChange={(rowIds) => {
                    setSelectedClassRowIds(rowIds);
                  }}
                  onActiveRowChange={({ rowId }) => {
                    const activeRowId = String(rowId ?? '');
                    const activeRow = classRows.find((row) => row._rowId === activeRowId);
                    setSelectedClassCode(activeRow?.lkupClssCd?.trim() || undefined);
                  }}
                  createRow={() => ({
                    ...defaultClassCreateRow,
                    _rowId: `tmp:class:${Date.now()}:${classTempSeqRef.current++}`,
                  })}
                  makePatch={({ columnId, value }) =>
                    ({ [columnId]: value } as Partial<CommonCodeClassGridRow>)
                  }
                  deleteMode="selected"
                  actionBar={{
                    position: 'top',
                    defaultStyle: 'icon',
                    includeBuiltIns: ['add', 'delete', 'save', 'filter'],
                    customActions: [
                      {
                        key: 'refresh-class',
                        label: 'Refresh',
                        icon: <RefreshCcw aria-hidden size={16} />,
                        side: 'right',
                        style: 'icon',
                        order: 20,
                        onClick: () => {
                          void refreshClassList();
                        },
                      },
                    ],
                  }}
                  beforeCommit={({ changes }) => {
                    if (hasMissingCommonCodeClassRequired(changes)) {
                      void openAlert({ title: 'Class Code and Class Name are required.' });
                      return false;
                    }
                    return openConfirm({ title: 'Do you want to save?' });
                  }}
                  onCommit={async ({ changes, ctx }) => {
                    await commitCommonCodeClassChanges(changes, ctx.viewData);
                    await refreshClassList();
                    await openAlert({ title: 'Saved successfully.' });
                    return { ok: true };
                  }}
                  onCommitError={({ error }) => {
                    console.error(error);
                    if (error instanceof HttpError && error.status === 409) {
                      addNotification('이미 존재하는 공통코드입니다.', 'error');
                      return;
                    }
                    const message = error instanceof Error ? error.message : 'Commit failed (see console).';
                    addNotification(message, 'error');
                  }}
                  onStateChange={({ dirty }) => {
                    setClassGridDirty(dirty);
                  }}
                  gridProps={{
                    dataVersion: classDataUpdatedAt,
                    rowHeight: 34,
                    overscan: 8,
                    enablePinning: true,
                    enableColumnSizing: true,
                    enableVirtualization: true,
                    enableRowStatus: true,
                    checkboxSelection: true,
                    editOnActiveCell: false,
                    keepEditingOnNavigate: true,
                    enableFooterRow: false,
                    enableStickyFooterRow: true,
                    enableActiveRowHighlight: true,
                  }}
                />
              </div>
            </div>
          }
          right={
            <div className={styles.pane}>
              <div className={styles.gridPane}>
                <GenGridCrud<CommonCodeItemGridRow>
                  key={`${selectedClassCode ?? 'none'}-${itemDataUpdatedAt}`}
                  title="Code Detail List"
                  data={selectedClassCode ? itemRows : []}
                  columns={itemColumns}
                  getRowId={(row) => row._rowId}
                  createRow={() => ({
                    ...defaultItemCreateRow,
                    lkupClssCd: selectedClassCode ?? '',
                    _rowId: `tmp:item:${Date.now()}:${itemTempSeqRef.current++}`,
                  })}
                  makePatch={({ columnId, value }) =>
                    ({ [columnId]: value } as Partial<CommonCodeItemGridRow>)
                  }
                  deleteMode="selected"
                  actionBar={{
                    position: 'top',
                    defaultStyle: 'icon',
                    includeBuiltIns: ['add', 'delete', 'save', 'filter'],
                    customActions: [
                      {
                        key: 'refresh-item',
                        label: 'Refresh',
                        icon: <RefreshCcw aria-hidden size={16} />,
                        side: 'right',
                        style: 'icon',
                        order: 20,
                        onClick: () => {
                          void refreshItemList();
                        },
                      },
                    ],
                  }}
                  beforeCommit={({ changes }) => {
                    if (!selectedClassCode) {
                      void openAlert({ title: 'Select a code class first.' });
                      return false;
                    }
                    if (hasMissingCommonCodeItemRequired(changes)) {
                      void openAlert({ title: 'Code and Name are required.' });
                      return false;
                    }
                    return openConfirm({ title: 'Do you want to save?' });
                  }}
                  onCommit={async ({ changes, ctx }) => {
                    if (!selectedClassCode) {
                      const error = new Error('Select a code class first.');
                      addNotification(error.message, 'error');
                      return { ok: false, error };
                    }

                    await commitCommonCodeItemChanges(changes, ctx.viewData, selectedClassCode);
                    await refreshItemList();
                    await openAlert({ title: 'Saved successfully.' });
                    return { ok: true };
                  }}
                  onCommitError={({ error }) => {
                    console.error(error);
                    if (error instanceof HttpError && error.status === 409) {
                      addNotification('이미 존재하는 공통코드입니다.', 'error');
                      return;
                    }
                    const message = error instanceof Error ? error.message : 'Commit failed (see console).';
                    addNotification(message, 'error');
                  }}
                  onStateChange={({ dirty }) => {
                    setItemGridDirty(dirty);
                  }}
                  gridProps={{
                    dataVersion: `${selectedClassCode ?? 'none'}-${itemDataUpdatedAt}`,
                    rowHeight: 34,
                    overscan: 8,
                    enablePinning: true,
                    enableColumnSizing: true,
                    enableVirtualization: true,
                    enableRowStatus: true,
                    checkboxSelection: true,
                    editOnActiveCell: false,
                    keepEditingOnNavigate: true,
                    enableFooterRow: false,
                    enableStickyFooterRow: true,
                    enableActiveRowHighlight: true,
                  }}
                />
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
