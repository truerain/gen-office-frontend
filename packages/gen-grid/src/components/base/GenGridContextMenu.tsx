import * as React from 'react';
import controls from './GenGridControls.module.css';

export function GenGridContextMenu(props: {
  contextMenu: { x: number; y: number } | null;
  canCopy: boolean;
  canPaste: boolean;
  onClose: () => void;
  onCopy: () => void;
  onCopyWithHeader: () => void;
  onPaste: () => void;
}) {
  const { contextMenu, canCopy, canPaste, onClose, onCopy, onCopyWithHeader, onPaste } = props;
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
            ? Math.min(contextMenu.y, window.innerHeight - 140)
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
    </div>
  );
}
