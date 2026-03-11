import * as React from 'react';
import controls from './GenGridControls.module.css';

type RangeStats = {
  sum: number;
  avg: number;
  count: number;
};

export function GenGridContextMenu(props: {
  contextMenu: { x: number; y: number } | null;
  canCopy: boolean;
  canPaste: boolean;
  rangeStats?: RangeStats | null;
  onClose: () => void;
  onCopy: () => void;
  onCopyWithHeader: () => void;
  onPaste: () => void;
}) {
  const { contextMenu, canCopy, canPaste, rangeStats, onClose, onCopy, onCopyWithHeader, onPaste } = props;
  const formatStatValue = React.useCallback((value: number) => value.toLocaleString(), []);

  if (!contextMenu) return null;

  return (
    <div
      className={controls.contextMenu}
      data-gen-grid-context-menu="true"
      role="menu"
      style={{
        left:
          typeof window !== 'undefined'
            ? Math.min(contextMenu.x, window.innerWidth - 220)
            : contextMenu.x,
        top:
          typeof window !== 'undefined'
            ? Math.min(contextMenu.y, window.innerHeight - 220)
            : contextMenu.y,
      }}
    >
      <button
        type="button"
        className={controls.contextMenuItem}
        disabled={!canCopy}
        onClick={() => {
          onClose();
          onCopy();
        }}
      >
        <span>Copy</span>
        <span className={controls.contextMenuShortcut}>Ctrl+C</span>
      </button>
      <button
        type="button"
        className={controls.contextMenuItem}
        disabled={!canCopy}
        onClick={() => {
          onClose();
          onCopyWithHeader();
        }}
      >
        <span>Copy with Header</span>
        <span className={controls.contextMenuShortcut}>Ctrl+Shift+C</span>
      </button>
      <button
        type="button"
        className={controls.contextMenuItem}
        disabled={!canPaste}
        onClick={() => {
          onClose();
          onPaste();
        }}
      >
        <span>Paste</span>
        <span className={controls.contextMenuShortcut}>Ctrl+V</span>
      </button>

      {rangeStats &&  rangeStats.count > 1 ? (
        <div className={controls.contextMenuStats} aria-label="Range statistics">
              <div className={controls.contextMenuStatRow}>
                <span>Sum</span>
                <span>{formatStatValue(rangeStats.sum)}</span>
              </div>
              <div className={controls.contextMenuStatRow}>
                <span>Avg</span>
                <span>{formatStatValue(rangeStats.avg)}</span>
              </div>
            <div className={controls.contextMenuStatMeta}>n={rangeStats.count}</div>
        </div>
      ) : null}
    </div>
  );
}
