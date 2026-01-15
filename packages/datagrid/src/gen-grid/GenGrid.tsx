import * as React from 'react';

import { useGenGridTable } from './useGenGridTable';
import type { GenGridProps } from './types';
import { GenGridBase } from './GenGridBase';

export function GenGrid<TData>(props: GenGridProps<TData>) {
  const table = useGenGridTable<TData>(props);

  return (
    <GenGridBase<TData>
      table={table}
      // ✅ GenGridProps에 있는 옵션들 그대로 전달
      caption={props.caption}
      height={props.height}
      maxHeight={props.maxHeight}
      enableStickyHeader={props.enableStickyHeader}
      headerHeight={props.headerHeight}
      rowHeight={props.rowHeight}
      enableVirtualization={props.enableVirtualization}
      overscan={props.overscan}
      enableFiltering={props.enableFiltering}
      enablePinning={props.enablePinning}
      enableColumnSizing={props.enableColumnSizing}
      enableRowSelection={props.enableRowSelection}
      enablePagination={props.enablePagination}
      pageSizeOptions={props.pageSizeOptions}
      // ✅ Step11
      onCellValueChange={props.onCellValueChange}
      isCellDirty={props.isCellDirty}
    />
  );
}
