// apps/demo/src/pages/approval/inbox/ApprovalInboxPage.tsx
// Approval inbox: fixed TreeView navigation + list/detail right pane.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, RefreshCcw } from 'lucide-react';

import { GenDataGridCrud } from '@gen-office/gen-datagrid-crud';
import { Button, SplitLayout, TreeView } from '@gen-office/ui';

import type { PageComponentProps } from '@/app/config/componentRegistry.dynamic';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';
import { useAlertDialog } from '@/shared/ui/AlertDialogContext';
import { useAppStore } from '@/app/store/appStore';

import {
  useApprovalDecisionMutation,
  useApprovalInboxDetailQuery,
  useApprovalInboxListQuery,
} from '@/pages/approval/inbox/api/approvalInbox';
import { createApprovalInboxColumns } from '@/pages/approval/inbox/ApprovalInboxColumns';
import { ApprovalInboxDetailPanel } from '@/pages/approval/inbox/ApprovalInboxDetailPanel';
import type {
  ApprovalBox,
  ApprovalDocument,
  ApprovalInboxStatus,
} from '@/pages/approval/inbox/model/types';

import styles from './ApprovalInboxPage.module.css';

type NavNodeId =
  | 'request'
  | 'inbox'
  | 'request:pending'
  | 'request:completed'
  | 'request:rejected'
  | 'inbox:pending'
  | 'inbox:completed'
  | 'inbox:rejected';

type NavNode = {
  id: NavNodeId;
  parent_id: NavNodeId | null;
  label: string;
  box?: ApprovalBox;
  status?: ApprovalInboxStatus;
};

type RightViewMode = 'list' | 'detail';

const DEFAULT_NAV_ID: NavNodeId = 'inbox:pending';

const NAV_NODES: NavNode[] = [
  { id: 'request', parent_id: null, label: '품의' },
  { id: 'request:pending', parent_id: 'request', label: '진행중', box: 'request', status: 'pending' },
  {
    id: 'request:completed',
    parent_id: 'request',
    label: '완료',
    box: 'request',
    status: 'completed',
  },
  {
    id: 'request:rejected',
    parent_id: 'request',
    label: '반려',
    box: 'request',
    status: 'rejected',
  },
  { id: 'inbox', parent_id: null, label: '결재함' },
  { id: 'inbox:pending', parent_id: 'inbox', label: '대기', box: 'inbox', status: 'pending' },
  { id: 'inbox:completed', parent_id: 'inbox', label: '완료', box: 'inbox', status: 'completed' },
  { id: 'inbox:rejected', parent_id: 'inbox', label: '반려', box: 'inbox', status: 'rejected' },
];

function resolveLeafNavId(id: NavNodeId): NavNodeId {
  const node = NAV_NODES.find((item) => item.id === id);
  if (node?.box && node.status) return id;
  if (id === 'request') return 'request:pending';
  if (id === 'inbox') return 'inbox:pending';
  return DEFAULT_NAV_ID;
}

function getListTitle(navId: NavNodeId) {
  const node = NAV_NODES.find((item) => item.id === navId);
  if (!node?.box) return '문서 목록';
  const boxLabel = node.box === 'request' ? '품의' : '결재함';
  return `${boxLabel} · ${node.label}`;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function ApprovalInboxPage(_props: PageComponentProps) {
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  const [selectedNavId, setSelectedNavId] = useState<NavNodeId>(DEFAULT_NAV_ID);
  const [viewMode, setViewMode] = useState<RightViewMode>('list');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const activeNavId = resolveLeafNavId(selectedNavId);
  const activeNav = NAV_NODES.find((item) => item.id === activeNavId);

  const listParams = useMemo(
    () => ({
      box: activeNav?.box,
      status: activeNav?.status,
    }),
    [activeNav]
  );

  const {
    data: rows = [],
    dataUpdatedAt,
    error,
    isError,
    refetch,
  } = useApprovalInboxListQuery(listParams);

  const detailQuery = useApprovalInboxDetailQuery(
    selectedDocId,
    viewMode === 'detail' && Boolean(selectedDocId)
  );
  const decisionMutation = useApprovalDecisionMutation();
  const columns = useMemo(() => createApprovalInboxColumns(), []);

  useEffect(() => {
    setViewMode('list');
    setSelectedDocId(null);
    setComment('');
  }, [activeNavId]);

  const selectedDocument: ApprovalDocument | null =
    detailQuery.data ?? rows.find((row) => row.docId === selectedDocId) ?? null;

  const canDecide =
    selectedDocument?.box === 'inbox' &&
    selectedDocument.status === 'pending' &&
    !decisionMutation.isPending;

  const handleNavSelect = useCallback((node: NavNode) => {
    setSelectedNavId(resolveLeafNavId(node.id));
  }, []);

  const handleOpenDetail = useCallback((docId: string) => {
    setSelectedDocId(docId);
    setComment('');
    setViewMode('detail');
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setComment('');
  }, []);

  const handleApprove = useCallback(async () => {
    if (!selectedDocId || !canDecide) return;
    const confirmed = await openConfirm({
      title: '선택한 문서를 승인합니다',
      buttonSet: 'yesNo',
    });
    if (!confirmed) return;

    try {
      const next = await decisionMutation.mutateAsync({
        docId: selectedDocId,
        decision: 'approve',
        comment: comment.trim() || undefined,
      });
      setComment('');
      await refetch();
      await openAlert({
        type: 'success',
        message:
          next.status === 'completed'
            ? '최종 승인되어 완료 함으로 이동했습니다.'
            : '승인되었습니다. 다음 결재 단계로 전달됩니다.',
      });
      if (next.status !== 'pending') {
        setViewMode('list');
        setSelectedDocId(null);
      }
    } catch (err) {
      const message = resolveApiErrorMessage(err, {
        defaultMessage: '승인 처리에 실패했습니다.',
      });
      addNotification(message, 'error');
    }
  }, [
    addNotification,
    canDecide,
    comment,
    decisionMutation,
    openAlert,
    openConfirm,
    refetch,
    selectedDocId,
  ]);

  const handleReject = useCallback(async () => {
    if (!selectedDocId || !canDecide) return;
    const trimmed = comment.trim();
    if (!trimmed) {
      await openAlert({
        type: 'warning',
        message: '반려 시 의견을 입력해야 합니다.',
      });
      return;
    }

    const confirmed = await openConfirm({
      title: '선택한 문서를 반려합니다',
      buttonSet: 'yesNo',
    });
    if (!confirmed) return;

    try {
      await decisionMutation.mutateAsync({
        docId: selectedDocId,
        decision: 'reject',
        comment: trimmed,
      });
      setComment('');
      setSelectedDocId(null);
      setViewMode('list');
      await refetch();
      await openAlert({
        type: 'success',
        message: '반려 처리되었습니다.',
      });
    } catch (err) {
      const message = resolveApiErrorMessage(err, {
        defaultMessage: '반려 처리에 실패했습니다.',
      });
      addNotification(message, 'error');
    }
  }, [
    addNotification,
    canDecide,
    comment,
    decisionMutation,
    openAlert,
    openConfirm,
    refetch,
    selectedDocId,
  ]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="결재함"
        description="품의/결재함을 트리로 구분하고, 목록에서 더블클릭하여 상세를 확인합니다."
        breadcrumbItems={[
          { label: '결재', icon: <Box size={16} /> },
          { label: '결재함', icon: <Box size={16} /> },
        ]}
      />

      <div className={styles.content}>
        <SplitLayout
          className={styles.splitLayout}
          leftWidth="240px"
          resizable
          left={
            <div className={styles.treePane}>
              <TreeView
                title="결재 메뉴"
                data={NAV_NODES}
                selectedId={activeNavId}
                defaultExpandedIds={['request', 'inbox']}
                onSelect={handleNavSelect}
                showRefresh
                onRefresh={() => {
                  void refetch();
                }}
              />
            </div>
          }
          right={
            <div className={styles.detailPane}>
              {isError ? (
                <div className={styles.error}>
                  <div className={styles.errorTitle}>결재함 목록을 불러오지 못했습니다.</div>
                  <div className={styles.errorMessage}>
                    {resolveApiErrorMessage(error, { defaultMessage: 'Unknown error' })}
                  </div>
                  <Button type="button" variant="outline" onClick={() => void refetch()}>
                    다시 시도
                  </Button>
                </div>
              ) : null}

              <div className={styles.viewStack} data-view={viewMode}>
                <div
                  className={styles.viewPanel}
                  data-panel="list"
                  data-active={viewMode === 'list' ? 'true' : 'false'}
                  aria-hidden={viewMode !== 'list'}
                >
                  <GenDataGridCrud<ApprovalDocument>
                    title={getListTitle(activeNavId)}
                    readonly
                    data={rows}
                    columns={columns}
                    getRowId={(row) => row.docId}
                    dataVersion={`${dataUpdatedAt}-${activeNavId}-${rows.length}`}
                    onCommit={async () => ({ ok: true })}
                    onExport={() => undefined}
                    actionBar={{
                      showTotalRows: true,
                      includeBuiltIns: ['filter'],
                      customActions: [
                        {
                          key: 'refresh',
                          label: 'Refresh',
                          icon: <RefreshCcw aria-hidden size={16} />,
                          side: 'right',
                          order: 20,
                          onClick: () => {
                            void refetch();
                          },
                        },
                      ],
                    }}
                    gridProps={{
                      rowHeight: 34,
                      enablePinning: true,
                      enableColumnSizing: true,
                      enableRowNumber: true,
                      enableVirtualization: true,
                      enablePagination: false,
                      resetScrollOnDataVersion: true,
                      enableCurrentRowHighlight: true,
                      enableRowSelection: false,
                      enableRowStatus: false,
                      editOnActiveCell: false,
                      keepEditingOnNavigate: false,
                      enableFooterRow: false,
                      editPolicy: {
                        startTriggers: {
                          doubleClick: false,
                        },
                      },
                      onRowDoubleClick: ({ rowId }) => {
                        handleOpenDetail(rowId);
                      },
                      defaultColumnPinning: {
                        left: ['docId', 'title'],
                      },
                    }}
                  />
                </div>

                <div
                  className={styles.viewPanel}
                  data-panel="detail"
                  data-active={viewMode === 'detail' ? 'true' : 'false'}
                  aria-hidden={viewMode !== 'detail'}
                >
                  <ApprovalInboxDetailPanel
                    document={selectedDocument}
                    isLoading={Boolean(selectedDocId) && detailQuery.isLoading}
                    comment={comment}
                    onCommentChange={setComment}
                    onApprove={() => {
                      void handleApprove();
                    }}
                    onReject={() => {
                      void handleReject();
                    }}
                    onBack={handleBackToList}
                    canDecide={Boolean(canDecide)}
                    isDeciding={decisionMutation.isPending}
                  />
                </div>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
