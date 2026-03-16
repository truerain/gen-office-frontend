import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import controls from './GenGridControls.module.css';

type RangeStats = {
  sum: number;
  avg: number;
  count: number;
};

type CustomContextMenuAction = {
  key: string;
  label: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
  children?: readonly CustomContextMenuAction[];
};

export function GenGridContextMenu(props: {
  contextMenu: { x: number; y: number } | null;
  canCopy: boolean;
  canPaste: boolean;
  rangeStats?: RangeStats | null;
  customActions?: readonly CustomContextMenuAction[];
  onClose: () => void;
  onCopy: () => void;
  onCopyWithHeader: () => void;
  onPaste: () => void;
}) {
  const {
    contextMenu,
    canCopy,
    canPaste,
    rangeStats,
    customActions,
    onClose,
    onCopy,
    onCopyWithHeader,
    onPaste,
  } = props;
  const formatStatValue = React.useCallback((value: number) => value.toLocaleString(), []);
  const renderCustomAction = React.useCallback(
    (action: CustomContextMenuAction) => {
      const hasChildren = Boolean(action.children && action.children.length > 0);
      const isDisabled = Boolean(action.disabled);
      return (
        <div
          key={action.key}
          className={controls.contextMenuItemWrap}
          data-has-children={hasChildren || undefined}
        >
          <button
            type="button"
            className={controls.contextMenuItem}
            disabled={isDisabled}
            onClick={() => {
              if (hasChildren || !action.onClick) return;
              onClose();
              void action.onClick();
            }}
          >
            <span>{action.label}</span>
            {hasChildren ? (
              <ChevronRight className={controls.contextMenuExpandIcon} size={14} aria-hidden />
            ) : null}
          </button>

          {hasChildren ? (
            <div className={controls.contextSubMenu} role="menu">
              {action.children!.map((child) => renderCustomAction(child))}
            </div>
          ) : null}
        </div>
      );
    },
    [onClose]
  );

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

      {customActions && customActions.length > 0 ? (
        <div className={controls.contextMenuCustomSection}>
          {customActions.map((action) => renderCustomAction(action))}
        </div>
      ) : null}

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
