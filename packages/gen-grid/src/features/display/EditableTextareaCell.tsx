// packages/gen-grid/src/features/display/EditableTextareaCell.tsx
// Multiline display cell: chrome fills rowHeight; content is line-clamped.
// Optional expand Dialog for full view/edit. Never grows the table row.

import * as React from 'react';
import { Maximize2 } from 'lucide-react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@gen-office/ui';
import styles from './EditableTextareaCell.module.css';

export type EditableTextareaCellAlign = 'left' | 'center' | 'right';

export type EditableTextareaCellProps = {
  children?: React.ReactNode;
  value?: unknown;
  align?: EditableTextareaCellAlign;
  className?: string;
  /** When true, render without field chrome border. */
  disabled?: boolean;
  /** Max visible lines inside the cell (still capped by rowHeight). Default 3. */
  lineClamp?: number;
  /** Show expand button. Defaults to true. */
  expandable?: boolean;
  /** When true, dialog textarea can edit and Apply calls onCommit. */
  writable?: boolean;
  title?: string;
  onCommit?: (next: string) => void;
};

function formatDisplayValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '';
}

export function EditableTextareaCell(props: EditableTextareaCellProps) {
  const {
    children,
    value,
    align = 'left',
    className,
    disabled = false,
    lineClamp = 3,
    expandable = true,
    writable = false,
    title = 'Details',
    onCommit,
  } = props;

  const textValue = formatDisplayValue(value);
  const content = children ?? textValue;
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState(textValue);

  const alignClass =
    align === 'right' ? styles.alignRight : align === 'center' ? styles.alignCenter : styles.alignLeft;

  React.useEffect(() => {
    if (open) setDraft(textValue);
  }, [open, textValue]);

  const handleOpen = (event: React.SyntheticEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setDraft(textValue);
    setOpen(true);
  };

  const handleApply = () => {
    onCommit?.(draft);
    setOpen(false);
  };

  const contentStyle = {
    ['--editable-textarea-line-clamp' as string]: String(Math.max(1, lineClamp)),
  } as React.CSSProperties;

  return (
    <div
      className={[
        styles.root,
        expandable ? styles.rootExpandable : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={[styles.chrome, disabled ? styles.disabled : ''].filter(Boolean).join(' ')}>
        <div className={[styles.content, alignClass].filter(Boolean).join(' ')} style={contentStyle}>
          {content}
        </div>
        {expandable ? (
          <button
            type="button"
            className={styles.expandButton}
            aria-label={writable ? 'Open full text editor' : 'View full text'}
            title={writable ? 'Edit full text' : 'View full text'}
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
            }}
            onClick={handleOpen}
          >
            <Maximize2 size={12} aria-hidden={true} />
          </button>
        ) : null}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className={styles.dialogContent}
          data-gen-grid-editor-overlay="true"
          aria-describedby={undefined}
          onKeyDown={(event) => {
            // Portal events bubble through the React tree into the grid cell.
            event.stopPropagation();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <DialogBody className={styles.dialogBody}>
            {writable ? (
              <textarea
                className={styles.editor}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  event.stopPropagation();
                }}
                autoFocus
              />
            ) : (
              <pre className={styles.readView}>{textValue || ' '}</pre>
            )}
          </DialogBody>
          <DialogFooter className={styles.dialogFooter}>
            {writable ? (
              <>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  취소
                </Button>
                <Button type="button" variant="primary" onClick={handleApply}>
                  확인
                </Button>
              </>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
