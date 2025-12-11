// EditableCell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Input } from 'antd';

interface EditableCellProps {
  value: any;
  rowKey: string | number;
  columnId: string;
  editable: boolean;
  onSave: (rowKey: string | number, columnId: string, newValue: any) => void;
}

export function EditableCell({
  value,
  rowKey,
  columnId,
  editable,
  onSave,
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = () => {
    setIsEditing(false);
    if (editValue !== value) {
      onSave(rowKey, columnId, editValue);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  if (!editable) {
    return <span>{value}</span>;
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onPressEnter={handleSave}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            handleCancel();
          }
        }}
        style={{ margin: '-5px -11px' }}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      style={{
        cursor: 'pointer',
        padding: '5px',
        minHeight: '22px',
      }}
      title="클릭하여 편집"
    >
      {value || <span style={{ color: '#d9d9d9' }}>-</span>}
    </div>
  );
}