// grids/UserGrid/columns.tsx
import type { ColumnDef } from '../../../components/NGrid/types';
import type { User } from './types';

export const userGridColumns: ColumnDef<User>[] = [
  {
    id: 'id',
    accessor: 'id',
    header: 'ID',
    width: 80,
    editable: false,
  },
  {
    id: 'name',
    accessor: 'name',
    header: '이름',
    width: 150,
    editable: true,
  },
  {
    id: 'email',
    accessor: 'email',
    header: '이메일',
    width: 200,
    editable: true,
  },
  {
    id: 'age',
    accessor: 'age',
    header: '나이',
    width: 100,
    editable: true,
  },
  {
    id: 'status',
    accessor: 'status',
    header: '상태',
    width: 100,
    editable: (row) => row.status === 'active',
  },
];