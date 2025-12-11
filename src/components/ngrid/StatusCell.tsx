// StatusCell.tsx
import React from 'react';
import { EditOutlined } from '@ant-design/icons';

interface StatusCellProps {
  isModified: boolean;
}

export function StatusCell({ isModified }: StatusCellProps) {
  if (!isModified) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1890ff',
      }}
      title="수정됨"
    >
      <EditOutlined />
    </div>
  );
}