export type RangeCellCoord = {
  rowId: string;
  columnId: string;
};

export type SelectedRange = {
  anchor: RangeCellCoord;
  focus: RangeCellCoord;
};

export type SelectedRanges = SelectedRange[];
