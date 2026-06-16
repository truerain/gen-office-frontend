// packages/gen-datagrid/src/renderers/div-grid/DataGridFooterBar.tsx
// Renders the grid-level footer bar below the DataGrid body and footer rows.

import * as React from 'react';

type DataGridFooterBarProps = {
  children: React.ReactNode;
};

export function DataGridFooterBar({ children }: DataGridFooterBarProps) {
  return (
    <div className="gen-datagrid__footer-bar" data-gen-datagrid-footer-bar="true">
      {children}
    </div>
  );
}
