// CheckboxCell.tsx
import React from 'react';
import { Checkbox } from 'antd';

interface CheckboxCellProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxCell({ checked, onChange }: CheckboxCellProps) {
  return (
    <Checkbox
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}