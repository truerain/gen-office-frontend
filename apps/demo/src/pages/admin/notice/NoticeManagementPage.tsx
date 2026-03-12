import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Bell, ListPlus, RefreshCcw } from "lucide-react";

import { GenGridCrud } from "@gen-office/gen-grid-crud";
import type { CrudRowId } from "@gen-office/gen-grid-crud";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@gen-office/ui";
import { PageHeader } from "@/components/PageHeader/PageHeader";
import {
  noticeApi,
  useNoticeDetailQuery,
  useNoticeListQuery,
} from "@/pages/admin/notice/api/notice";
import type {
  Notice,
  NoticeListParams,
  NoticeRequest,
} from "@/pages/admin/notice/model/types";
import { useAppStore } from "@/app/store/appStore";
import { useAlertDialog } from "@/shared/ui/AlertDialogProvider";
import { resolveApiErrorMessage } from "@/shared/api/errorMessage";

import styles from "./NoticeManagementPage.module.css";
import { createNoticeManagementColumns } from "./NoticeManagementColumns";
import { commitNoticeChanges } from "./NoticeManagementCrud";
import { NoticeDraftPanel, type NoticeDraft } from "./NoticeDraftPanel";
import type { FileAttachmentUploadResult } from "@/shared/ui/file/FileAttachmentPanel";

const createDefaultDraft = (): NoticeDraft => ({
  title: "",
  content: "",
  fileSetId: "",
  dispStartDate: "",
  dispEndDate: "",
  popupYn: "Y",
  useYn: "Y",
  readCount: 0,
});

function toDraft(notice: Notice): NoticeDraft {
  return {
    noticeId: notice.noticeId,
    title: String(notice.title ?? ""),
    content: String(notice.content ?? ""),
    dispStartDate: String(notice.dispStartDate ?? ""),
    dispEndDate: String(notice.dispEndDate ?? ""),
    popupYn: String(notice.popupYn ?? "Y"),
    useYn: String(notice.useYn ?? "Y"),
    fileSetId: String(notice.fileSetId ?? ""),
    readCount: Number(notice.readCount ?? 0),
  };
}

export default function NoticeManagementPage() {
  const { t } = useTranslation("common");
  const addNotification = useAppStore((state) => state.addNotification);
  const { openAlert, openConfirm } = useAlertDialog();

  // selectedRowIds: row_select column(checkbox) state
  const [selectedRowIds, setSelectedRowIds] = useState<readonly CrudRowId[]>(
    [],
  );
  // activeNoticeId: row where active cell currently belongs
  const [activeNoticeId, setActiveNoticeId] = useState<number | null>(null);
  const [isDraftDialogOpen, setIsDraftDialogOpen] = useState(false);
  const [draft, setDraft] = useState<NoticeDraft>(() => createDefaultDraft());
  const [isSaving, setIsSaving] = useState(false);
  const [uploadRequestId, setUploadRequestId] = useState(0);
  const draftRef = useRef<NoticeDraft>(draft);
  const uploadWaiterRef = useRef<{
    resolve: (uploadedCount: number) => void;
    reject: (error: Error) => void;
  } | null>(null);

  const queryParams = useMemo<NoticeListParams>(() => ({}), []);
  const {
    data: noticeList = [],
    refetch,
    dataUpdatedAt,
  } = useNoticeListQuery(queryParams);
  const {
    data: activeNotice,
    isFetching: isDetailLoading,
    refetch: refetchDetail,
  } = useNoticeDetailQuery(activeNoticeId ?? 0, activeNoticeId != null);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    if (!activeNotice) return;
    const nextDraft = toDraft(activeNotice);
    setDraft((prev) => {
      // Keep locally issued fileSetId until notice save persists it on server.
      if (
        prev.noticeId === nextDraft.noticeId &&
        String(prev.fileSetId ?? "").trim() &&
        !String(nextDraft.fileSetId ?? "").trim()
      ) {
        return { ...nextDraft, fileSetId: prev.fileSetId };
      }
      return nextDraft;
    });
  }, [activeNotice]);

  const handleUploadDone = useCallback((result: FileAttachmentUploadResult) => {
    const waiter = uploadWaiterRef.current;
    if (!waiter) return;
    uploadWaiterRef.current = null;
    if (!result.ok) {
      waiter.reject(
        new Error(result.message || "Failed to upload attachments."),
      );
      return;
    }
    waiter.resolve(result.uploadedCount);
  }, []);

  const requestAttachmentUpload = useCallback(() => {
    if (uploadWaiterRef.current) {
      uploadWaiterRef.current.reject(
        new Error("Upload request was replaced by a new request."),
      );
      uploadWaiterRef.current = null;
    }
    return new Promise<number>((resolve, reject) => {
      uploadWaiterRef.current = { resolve, reject };
      setUploadRequestId((prev) => prev + 1);
    });
  }, []);

  const handleCreateDraft = useCallback(() => {
    setActiveNoticeId(null);
    setDraft(createDefaultDraft());
    setSelectedRowIds([]);
    setIsDraftDialogOpen(true);
  }, []);

  const handleOpenEditDraft = useCallback((row: Notice) => {
    const noticeId = Number(row.noticeId);
    if (!Number.isFinite(noticeId) || noticeId <= 0) return;
    setActiveNoticeId(noticeId);
    setSelectedRowIds([noticeId]);
    setDraft(toDraft(row));
    setIsDraftDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => createNoticeManagementColumns(t, { onEditRow: handleOpenEditDraft }),
    [handleOpenEditDraft, t],
  );

  const handleSelectedRowsChange = useCallback(
    (rowIds: readonly CrudRowId[]) => {
      setSelectedRowIds(rowIds);
      // selected rows do not drive detail panel
    },
    [],
  );

  const handleSave = async () => {
    if (!draftRef.current.title.trim()) {
      await openAlert({ title: "Please enter a notice title." });
      return;
    }

    const confirmed = await openConfirm({
      title: "Do you want to save changes?",
      confirmText: "Save",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    const beforeUploadDraft = draftRef.current;
    const resolvedNoticeId =
      typeof beforeUploadDraft.noticeId === "number" &&
      Number.isFinite(beforeUploadDraft.noticeId) &&
      beforeUploadDraft.noticeId > 0
        ? beforeUploadDraft.noticeId
        : (activeNoticeId ?? undefined);

    try {
      setIsSaving(true);
      await requestAttachmentUpload();

      const latestDraft = draftRef.current;
      const payload: NoticeRequest = {
        noticeId: resolvedNoticeId,
        title: latestDraft.title.trim(),
        content: latestDraft.content,
        dispStartDate: latestDraft.dispStartDate || undefined,
        dispEndDate: latestDraft.dispEndDate || undefined,
        popupYn: latestDraft.popupYn,
        useYn: latestDraft.useYn,
        fileSetId: latestDraft.fileSetId.trim() || undefined,
        lastUpdatedBy: "admin",
        createdBy: resolvedNoticeId ? undefined : "admin",
      };

      const saved = await noticeApi.save(payload);
      const savedNoticeId = Number(
        (saved as { noticeId?: unknown } | null)?.noticeId ??
          resolvedNoticeId ??
          latestDraft.noticeId ??
          activeNoticeId,
      );
      const hasSavedNoticeId =
        Number.isFinite(savedNoticeId) && savedNoticeId > 0;
      if (hasSavedNoticeId) {
        setActiveNoticeId(savedNoticeId);
        setSelectedRowIds([savedNoticeId]);
      }
      await refetch();
      if (hasSavedNoticeId) {
        await refetchDetail();
      }
      await openAlert({ title: "Saved successfully." });
      setIsDraftDialogOpen(false);
    } catch (error) {
      console.error(error);
      const message = resolveApiErrorMessage(error, {
        defaultMessage: "Failed to save notice.",
        t,
      });
      addNotification(message, "error");
    } finally {
      setIsSaving(false);
      if (uploadWaiterRef.current) {
        uploadWaiterRef.current.reject(
          new Error("Upload request was cancelled."),
        );
        uploadWaiterRef.current = null;
      }
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Notice Management"
        description="Manage the notice list and edit notice details."
        breadcrumbItems={[
          { label: "System", icon: <Bell size={16} /> },
          { label: "Notice Management", icon: <Bell size={16} /> },
        ]}
      />
      <div className={styles.content}>
        <div className={styles.pane}>
          <GenGridCrud<Notice>
            title="Notice List"
            data={noticeList}
            columns={columns}
            getRowId={(row) => row.noticeId}
            rowSelection={selectedRowIds}
            deleteMode="selected"
            onRowSelectionChange={(rowIds) => handleSelectedRowsChange(rowIds)}
            onCommit={async ({ changes, ctx }) => {
              await commitNoticeChanges(changes, ctx.viewData);
              await refetch();
              return { ok: true };
            }}
            actionBar={{
              position: "top",
              defaultStyle: "icon",
              includeBuiltIns: ["filter"],
              customActions: [
                {
                  key: "add-notice",
                  label: "Add",
                  icon: <ListPlus aria-hidden size={16} />,
                  side: "left",
                  style: "icon",
                  order: 5,
                  onClick: () => {
                    handleCreateDraft();
                  },
                },
                {
                  key: "refresh",
                  label: "Refresh",
                  icon: <RefreshCcw aria-hidden size={16} />,
                  side: "right",
                  style: "icon",
                  order: 20,
                  onClick: () => {
                    void refetch();
                  },
                },
              ],
            }}
            gridProps={{
              dataVersion: dataUpdatedAt,
              rowHeight: 34,
              overscan: 8,
              enablePinning: true,
              enableColumnSizing: true,
              enableVirtualization: true,
              enableRowStatus: false,
              enableRowNumber: true,
              checkboxSelection: false,
              editOnActiveCell: false,
              keepEditingOnNavigate: true,
            }}
          />
        </div>

        <Dialog
          open={isDraftDialogOpen}
          onOpenChange={(nextOpen) => {
            if (isSaving && !nextOpen) return;
            setIsDraftDialogOpen(nextOpen);
          }}
        >
          <DialogContent className={styles.noticeDialog}>
            <DialogHeader>
              <DialogTitle>
                {draft.noticeId ? "Edit Notice" : "Create Notice"}
              </DialogTitle>
            </DialogHeader>
            <div className={styles.noticeDialogBody}>
              <NoticeDraftPanel
                draft={draft}
                isDetailLoading={isDetailLoading}
                isSaving={isSaving}
                uploadRequestId={uploadRequestId}
                onUploadDone={handleUploadDone}
                onDraftChange={setDraft}
                onSave={() => {
                  void handleSave();
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
