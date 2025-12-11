import React, { useState, useMemo } from 'react';
import { NGrid } from '../../components/ngrid/ngrid';
import { Button, Space } from 'antd';
import { userGridColumns } from './columns';
import { UserGridActions } from './actions';
import type { User } from './types';



const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25, status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, status: 'inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 28, status: 'active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 32, status: 'active' },
    { id: 6, name: 'Diana Davis', email: 'diana@example.com', age: 27, status: 'active' },
    { id: 7, name: 'Edward Moore', email: 'edward@example.com', age: 33, status: 'inactive' },
    { id: 8, name: 'Fiona Taylor', email: 'fiona@example.com', age: 29, status: 'active' },
  ]);
  const [selectedRows, setSelectedRows] = useState<(number | string)[]>([]);

  // Actions 인스턴스 생성 (메모이제이션)
  const actions = useMemo(() => {
    const instance = new UserGridActions(setUsers, setSelectedRows);
    instance.setGetSelectedRows(() => selectedRows);
    return instance;
  }, [selectedRows]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>N-Grid 전체 기능 예제</h1>

      <Space style={{ marginBottom: '16px' }}>
        <Button
          type="primary"
          danger
          disabled={selectedRows.length === 0}
          onClick={actions.handleDelete}
        >
          선택 삭제 ({selectedRows.length})
        </Button>
      </Space>

      <NGrid<User>
        columns={userGridColumns}
        data={users}
        rowKey="id"
        onEdit={actions.handleEdit}
        selectable={true}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        trackChanges={true}
        headerHeight={35}
        rowHeight={30}
      />

      <div style={{ marginTop: '20px' }}>
        <h3>선택된 행: {selectedRows.join(', ')}</h3>
      </div>
    </div>
  );
};

export default UserList;
