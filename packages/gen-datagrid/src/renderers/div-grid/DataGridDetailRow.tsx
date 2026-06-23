// packages/gen-datagrid/src/renderers/div-grid/DataGridDetailRow.tsx
// Renders a fixed-height master-detail panel row for the non-virtualized body path.

type DataGridDetailRowProps = {
  parentRowId: string;
  gridTemplateColumns: string;
  height: number;
  children: React.ReactNode;
};

export function DataGridDetailRow({
  parentRowId,
  gridTemplateColumns,
  height,
  children,
}: DataGridDetailRowProps) {
  return (
    <div
      role="row"
      data-gen-datagrid-detail-row="true"
      data-parent-rowid={parentRowId}
      className="gen-datagrid__detail-row"
      style={{
        gridTemplateColumns,
        ['--gen-datagrid-detail-row-height' as string]: `${height}px`,
      }}
    >
      <div
        role="presentation"
        className="gen-datagrid__detail-panel"
        data-gen-datagrid-detail-panel="true"
        onMouseDown={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
