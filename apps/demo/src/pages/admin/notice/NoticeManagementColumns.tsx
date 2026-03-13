import type { ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import { SquarePen } from "lucide-react";
import type { Notice } from "@/pages/admin/notice/model/types";
import { Button } from "@gen-office/ui";

type NoticeManagementColumnOptions = {
  onEditRow?: (row: Notice) => void;
};

export const createNoticeManagementColumns = (
  t: TFunction,
  options: NoticeManagementColumnOptions = {},
): ColumnDef<Notice>[] => [
  {
    id: "edit",
    header: t("common.edit", { defaultValue: "Edit" }),
    size: 68,
    meta: {
      align: "center",
      pinned: "left",
      renderCell: ({ row }) => (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={t("common.edit", { defaultValue: "Edit" })}
          title={t("common.edit", { defaultValue: "Edit" })}
          onClick={(event) => {
            event.stopPropagation();
            options.onEditRow?.(row);
          }}
        >
          <SquarePen size={14} aria-hidden />
        </Button>
      ),
    },
  },
  {
    id: "title",
    header: t("notice.title", { defaultValue: "Title" }),
    accessorKey: "title",
    size: 500,
    meta: {
      pinned: "left",
    },
  },
  {
    id: "dispStartDate",
    header: t("notice.dispStartDate", { defaultValue: "Start Date" }),
    accessorKey: "dispStartDate",
    size: 120,
    meta: {
      align: "center",
      editType: "date",
    },
  },
  {
    id: "dispEndDate",
    header: t("notice.dispEndDate", { defaultValue: "End Date" }),
    accessorKey: "dispEndDate",
    size: 120,
    meta: {
      align: "center",
    },
  },
  {
    id: "popupYn",
    header: t("notice.popupYn", { defaultValue: "Popup" }),
    accessorKey: "popupYn",
    size: 100,
    meta: {
      align: "center",
    },
  },
  {
    id: "useYn",
    header: t("notice.useYn", { defaultValue: "Use" }),
    accessorKey: "useYn",
    size: 100,
    meta: {
      align: "center",
    },
  },
  {
    id: "readCount",
    header: t("notice.readCount", { defaultValue: "Read Count" }),
    accessorKey: "readCount",
    size: 110,
    meta: {
      align: "center",
    },
  },
  {
    id: "filenames",
    header: t("notice.filenames", { defaultValue: "Filenames" }),
    accessorKey: "filenames",
    size: 180,
  },
  {
    id: 'lastUpdatedBy',
    header: 'Last Updated By',
    accessorKey: 'lastUpdatedByName',
    size: 180,
    meta: {
      align: 'center',
    },
  },
  {
    id: 'lastUpdatedDate',
    header: 'Last Updated At',
    accessorKey: 'lastUpdatedDate',
    size: 180,
    meta: {
      align: 'center',
    },
  },
];
