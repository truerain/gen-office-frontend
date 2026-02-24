import type { ColumnDef } from '@tanstack/react-table';
import type { MessageGridRow } from './MessageManagementCrud';

export const createMessageManagementColumns = (): ColumnDef<MessageGridRow>[] => [
  {
    id: 'namespace',
    header: 'Namespace',
    accessorKey: 'namespace',
    size: 180,
    meta: {
      editable: true,
      editType: 'text',
      pinned: 'left',
    },
  },
  {
    id: 'messageCd',
    header: 'Message Code',
    accessorKey: 'messageCd',
    size: 220,
    meta: {
      editable: true,
      editType: 'text',
      pinned: 'left',
    },
  },
  {
    id: 'langCd',
    header: 'Language',
    accessorKey: 'langCd',
    size: 110,
    meta: {
      editable: true,
      editType: 'text',
      align: 'center',
      pinned: 'left',
      editPlaceholder: 'ko | en | en-US',
    },
  },
  {
    id: 'messageTxt',
    header: 'Message Text',
    accessorKey: 'messageTxt',
    size: 420,
    meta: {
      editable: true,
      editType: 'text',
      editPlaceholder: 'Enter message text',
    },
  },
  {
    id: 'updatedAt',
    header: 'Updated At',
    accessorKey: 'updatedAt',
    size: 180,
    meta: {
      align: 'center',
    },
  },
];
