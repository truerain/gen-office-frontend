// packages/gen-grid/src/features/active-cell/cellDom.ts

type FocusGridCellOptions = {
  // sticky header 높이(px). 없으면 0
  stickyHeaderHeight?: number;
  // pinned left/right 폭(px). 없으면 0
  pinnedLeftWidth?: number;
  pinnedRightWidth?: number;
  // 여백
  padding?: number;
};

function scrollCellIntoContainerView(
  container: HTMLElement,
  cell: HTMLElement,
  opts: FocusGridCellOptions = {}
) {
  const {
    stickyHeaderHeight = 0,
    pinnedLeftWidth = 0,
    pinnedRightWidth = 0,
    padding = 8,
  } = opts;

  const cellRect = cell.getBoundingClientRect();
  const contRect = container.getBoundingClientRect();

  // 실제 “보이는 영역” (sticky/pinned 제외)
  const visibleTop = contRect.top + stickyHeaderHeight + padding;
  const visibleBottom = contRect.bottom - padding;
  const visibleLeft = contRect.left + pinnedLeftWidth + padding;
  const visibleRight = contRect.right - pinnedRightWidth - padding;

  let nextTop = container.scrollTop;
  let nextLeft = container.scrollLeft;

  // vertical
  if (cellRect.top < visibleTop) {
    nextTop -= (visibleTop - cellRect.top);
  } else if (cellRect.bottom > visibleBottom) {
    nextTop += (cellRect.bottom - visibleBottom);
  }

  // horizontal
  if (cellRect.left < visibleLeft) {
    nextLeft -= (visibleLeft - cellRect.left);
  } else if (cellRect.right > visibleRight) {
    nextLeft += (cellRect.right - visibleRight);
  }

  if (nextTop !== container.scrollTop) container.scrollTop = nextTop;
  if (nextLeft !== container.scrollLeft) container.scrollLeft = nextLeft;
}

export function focusGridCell(
  rowId: string,
  colId: string,
  opts?: FocusGridCellOptions
) {
  const el = document.querySelector<HTMLElement>(
    `[data-row-id="${CSS.escape(rowId)}"][data-col-id="${CSS.escape(colId)}"]`
  );
  if (!el) return;

  // ✅ 스크롤 컨테이너 찾기: 너희 class가 tableScroll이므로 가장 안전
  const container = el.closest<HTMLElement>('[class*="tableScroll"]') ?? el.parentElement;

  el.focus({ preventScroll: true });

  if (container) {
    scrollCellIntoContainerView(container, el, opts);
  } else {
    // fallback
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
}