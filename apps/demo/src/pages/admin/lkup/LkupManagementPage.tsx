import { useEffect, useMemo, useRef, useState } from 'react';
import { ListTree, RefreshCcw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { GenGridCrud } from '@gen-office/gen-grid-crud';
import type { CrudRowId } from '@gen-office/gen-grid-crud';
import { SimpleFilterBar, SplitLayout, type FilterField } from '@gen-office/ui';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { HttpError } from '@/shared/api/http';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';
import { useCommonCodesQuery } from '@/shared/api/commonCode';
import {
  LkupKeys,
  useLkupMasterListQuery,
  useLkupDetailListQuery,
} from '@/pages/admin/lkup/api/lkup';
import type {
  LkupMasterListParams,
  LkupDetailListParams,
} from '@/pages/admin/lkup/model/types';
import { useAppStore } from '@/app/store/appStore';
import { useAlertDialog } from '@/shared/ui/AlertDialogProvider';

import styles from './LkupManagementPage.module.css';

import {
  commitLkupMasterChanges,
  commitLkupDetailChanges,
  hasMissingLkupMasterRequired,
  hasMissingLkupDetailRequired,
  toLkupMasterRowId,
  toLkupDetailRowId,
  type LkupMasterGridRow,
  type LkupDetailGridRow,
} from './LkupManagementCrud';
import { createDetailColumns, createMasterColumns } from './LkupManagementColumns';

type masterFilters = {
  lkupClssCd: string;
  lkupClssName: string;
  useYn: string;
  q: string;
};

const ALL_USE_YN = 'ALL';

const defaultmasterFilters: masterFilters = {
  lkupClssCd: '',
  lkupClssName: '',
  useYn: ALL_USE_YN,
  q: '',
};

const defaultClassCreateRow = {
  lkupClssCd: '',
  lkupClssName: '',
  lkupClssDesc: '',
  useYn: 'Y',
  lastUpdatedBy: '',
  lastUpdatedByName: '',
  lastUpdatedAt: '',
};

const defaultItemCreateRow = {
  lkupClssCd: '',
  lkupCd: '',
  lkupName: '',
  lkupNameEng: '',
  sortOrder: 0,
  useYn: 'Y',
  lastUpdatedBy: '',
  lastUpdatedByName: '',
  lastUpdatedAt: '',
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LkupManagementPage(_props: PageComponentProps) {
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();
  const queryClient = useQueryClient();

  const [masterGridDirty, setmasterGridDirty] = useState(false);
  const [detailGridDirty, setdetailGridDirty] = useState(false);

  const [draftMasterFilters, setdraftMasterFilters] = useState<masterFilters>(defaultmasterFilters);
  const [masterFilters, setmasterFilters] = useState<masterFilters>(defaultmasterFilters);

  const [selectedClassRowIds, setSelectedClassRowIds] = useState<readonly CrudRowId[]>([]);
  const [selectedClassCode, setSelectedClassCode] = useState<string | undefined>(undefined);

  const classTempSeqRef = useRef(1);
  const itemTempSeqRef = useRef(1);

  const { data: useYnCodes = [] } = useCommonCodesQuery('USE_YN');

  const classQueryParams = useMemo<LkupMasterListParams>(
    () => ({
      lkupClssCd: masterFilters.lkupClssCd.trim() || undefined,
      lkupClssName: masterFilters.lkupClssName.trim() || undefined,
      useYn:
        masterFilters.useYn.trim().toUpperCase() === ALL_USE_YN
          ? undefined
          : masterFilters.useYn.trim().toUpperCase() || undefined,
      q: masterFilters.q.trim() || undefined,
      page: 0,
      size: 200,
      sort: 'lkup_clss_cd asc',
    }),
    [masterFilters]
  );

  const {
    data: classList = [],
    refetch: refetchClassList,
    dataUpdatedAt: classDataUpdatedAt,
  } = useLkupMasterListQuery(classQueryParams);

  const masterRows = useMemo<LkupMasterGridRow[]>(
    () =>
      classList.map((item) => ({
        ...item,
        _rowId: toLkupMasterRowId(item),
      })),
    [classList]
  );

  useEffect(() => {
    if (!selectedClassCode) return;
    const exists = masterRows.some((row) => row.lkupClssCd === selectedClassCode);
    if (exists) return;
    setSelectedClassCode(undefined);
    setSelectedClassRowIds([]);
  }, [masterRows, selectedClassCode]);

  const itemQueryParams = useMemo<LkupDetailListParams>(
    () => ({
      sort: 'sort_order asc,lkup_cd asc',
    }),
    []
  );

  const {
    data: itemList = [],
    refetch: refetchItemList,
    dataUpdatedAt: itemDataUpdatedAt,
  } = useLkupDetailListQuery(selectedClassCode, itemQueryParams, Boolean(selectedClassCode));

  const itemRows = useMemo<LkupDetailGridRow[]>(
    () =>
      itemList.map((item) => ({
        ...item,
        _rowId: toLkupDetailRowId(item),
      })),
    [itemList]
  );

  const masterColumns = useMemo(() => createMasterColumns(), []);
  const itemColumns = useMemo(() => createDetailColumns(), []);

  const filterFields = useMemo<FilterField<masterFilters>[]>(
    () => [
      { key: 'lkupClssCd', title: 'Class Code', type: 'text', placeholder: '', flex: 0 },
      { key: 'lkupClssName', title: 'Class Name', type: 'text', placeholder: '', flex: 0 },
      {
        key: 'useYn',
        title: 'Use(Y/N)',
        type: 'select',
        placeholder: 'All',
        options: [
          { label: 'All', value: ALL_USE_YN },
          ...useYnCodes
            .filter((item) => String(item.useYn ?? '').toUpperCase() === 'Y')
            .sort((a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0))
            .map((item) => ({
              label: item.name,
              value: item.code,
            })),
        ],
        flex: 0,
      },
    ],
    [useYnCodes]
  );

  const handleClassSearch = () => {
    const same =
      draftMasterFilters.lkupClssCd.trim() === masterFilters.lkupClssCd.trim() &&
      draftMasterFilters.lkupClssName.trim() === masterFilters.lkupClssName.trim() &&
      draftMasterFilters.useYn.trim().toUpperCase() === masterFilters.useYn.trim().toUpperCase() &&
      draftMasterFilters.q.trim() === masterFilters.q.trim();

    setmasterFilters(draftMasterFilters);
    if (same) {
      void queryClient.invalidateQueries({ queryKey: LkupKeys.classList(classQueryParams) });
      void refetchClassList();
    }
  };

  const refreshClassList = async () => {
    await queryClient.invalidateQueries({ queryKey: LkupKeys.classList(classQueryParams) });
    await refetchClassList();
  };

  const refreshItemList = async () => {
    if (!selectedClassCode) return;
    await queryClient.invalidateQueries({
      queryKey: LkupKeys.itemList(selectedClassCode, itemQueryParams),
    });
    await refetchItemList();
  };

  return (
    <div className={styles.page} data-grid-dirty={masterGridDirty || detailGridDirty ? 'true' : 'false'}>
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
          leftWidth="55%"
          direction='vertical'
          resizable
          showResizeLine
          left={
            <div className={styles.pane}>
              <div className={styles.filter}>
                <SimpleFilterBar
                  value={draftMasterFilters}
                  fields={filterFields}
                  onChange={setdraftMasterFilters}
                  onSearch={handleClassSearch}
                  searchLabel="검색"
                />
              </div>
              <div className={styles.gridPane}>
                <GenGridCrud<LkupMasterGridRow>
                  key={`class-${classDataUpdatedAt}`}
                  title="Code Class List"
                  data={masterRows}
                  columns={masterColumns}
                  getRowId={(row) => row._rowId}
                  rowSelection={selectedClassRowIds}
                  onRowSelectionChange={(rowIds) => {
                    setSelectedClassRowIds(rowIds);
                  }}
                  onActiveRowChange={({ rowId }) => {
                    const activeRowId = String(rowId ?? '');
                    const activeRow = masterRows.find((row) => row._rowId === activeRowId);
                    setSelectedClassCode(activeRow?.lkupClssCd?.trim() || undefined);
                  }}
                  createRow={() => ({
                    ...defaultClassCreateRow,
                    _rowId: `tmp:class:${Date.now()}:${classTempSeqRef.current++}`,
                  })}
                  makePatch={({ columnId, value }) =>
                    ({ [columnId]: value } as Partial<LkupMasterGridRow>)
                  }
                  deleteMode="selected"
                  actionBar={{
                    position: 'top',
                    defaultStyle: 'icon',
                    includeBuiltIns: ['add', 'delete', 'save', 'filter', 'excel'],
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
                    if (hasMissingLkupMasterRequired(changes)) {
                      void openAlert({ title: 'Class Code and Class Name are required.' });
                      return false;
                    }
                    return openConfirm({ title: 'Do you want to save?' });
                  }}
                  onCommit={async ({ changes, ctx }) => {
                    await commitLkupMasterChanges(changes, ctx.viewData);
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
                    const message = resolveApiErrorMessage(error, {
                      defaultMessage: 'Commit failed (see console).',
                    });
                    addNotification(message, 'error');
                  }}
                  onStateChange={({ dirty }) => {
                    setmasterGridDirty(dirty);
                  }}
                  excelExport={{
                    mode: 'frontend',
                    frontend: { onlySelected: false },
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
                <GenGridCrud<LkupDetailGridRow>
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
                    ({ [columnId]: value } as Partial<LkupDetailGridRow>)
                  }
                  deleteMode="selected"
                  actionBar={{
                    position: 'top',
                    defaultStyle: 'icon',
                    includeBuiltIns: ['add', 'delete', 'save', 'filter', 'excel'],
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
                    if (hasMissingLkupDetailRequired(changes)) {
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

                    await commitLkupDetailChanges(changes, ctx.viewData, selectedClassCode);
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
                    const message = resolveApiErrorMessage(error, {
                      defaultMessage: 'Commit failed (see console).',
                    });
                    addNotification(message, 'error');
                  }}
                  onStateChange={({ dirty }) => {
                    setdetailGridDirty(dirty);
                  }}
                  excelExport={{
                    mode: 'frontend',
                    frontend: { onlySelected: false },
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
