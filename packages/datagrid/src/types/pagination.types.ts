/**
 * Pagination state
 */
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

/**
 * Pagination info
 */
export interface PaginationInfo {
  pageIndex: number;
  pageSize: number;
  pageCount: number;
  totalRows: number;
  canPreviousPage: boolean;
  canNextPage: boolean;
}

/**
 * Pagination props
 */
export interface PaginationProps {
  /**
   * Current page index (0-based)
   */
  pageIndex: number;

  /**
   * Page size
   */
  pageSize: number;

  /**
   * Total number of pages
   */
  pageCount: number;

  /**
   * Total number of rows
   */
  totalRows: number;

  /**
   * Can go to previous page
   */
  canPreviousPage: boolean;

  /**
   * Can go to next page
   */
  canNextPage: boolean;

  /**
   * Go to first page
   */
  onFirstPage: () => void;

  /**
   * Go to previous page
   */
  onPreviousPage: () => void;

  /**
   * Go to next page
   */
  onNextPage: () => void;

  /**
   * Go to last page
   */
  onLastPage: () => void;

  /**
   * Go to specific page
   */
  onPageChange: (pageIndex: number) => void;

  /**
   * Change page size
   */
  onPageSizeChange?: (pageSize: number) => void;

  /**
   * Show page size selector
   */
  showPageSizeSelector?: boolean;

  /**
   * Page size options
   */
  pageSizeOptions?: number[];

  /**
   * Compact mode
   */
  compact?: boolean;
}