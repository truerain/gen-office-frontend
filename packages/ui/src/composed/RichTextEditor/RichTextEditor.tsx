import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Pilcrow } from 'lucide-react';
import { cn } from '@gen-office/utils';

import { FontSize } from './FontSize';
import type { RichTextEditorProps } from './RichTextEditor.types';
import { ResizableImage } from './ResizableImage';
import styles from './RichTextEditor.module.css';

export function RichTextEditor({
  value,
  onChange,
  onImageUpload,
  placeholder,
  minHeight = 220,
  className,
  toolbarClassName,
  editorClassName,
  disabled = false,
}: RichTextEditorProps) {
  const normalizedValue = value || '';
  const skipSyncRef = React.useRef(false);
  const lastAppliedExternalValueRef = React.useRef(normalizedValue);
  const editorRef = React.useRef<ReturnType<typeof useEditor>>(null);
  const [mode, setMode] = React.useState<'visual' | 'html'>('visual');
  const [htmlSource, setHtmlSource] = React.useState(normalizedValue);
  const [selectedFontFamily, setSelectedFontFamily] = React.useState('');
  const [selectedFontSize, setSelectedFontSize] = React.useState('');
  const [selectedTextColor, setSelectedTextColor] = React.useState('#111111');

  const normalizeColorToHex = React.useCallback((value?: unknown) => {
    if (typeof value !== 'string') return '#111111';
    const trimmed = value.trim();
    if (!trimmed) return '#111111';

    const shortHex = /^#([0-9a-f]{3})$/i.exec(trimmed);
    if (shortHex) {
      const [r, g, b] = shortHex[1].split('');
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
    }

    const fullHex = /^#([0-9a-f]{6})$/i.exec(trimmed);
    if (fullHex) return `#${fullHex[1].toLowerCase()}`;

    const rgb = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(trimmed);
    if (rgb) {
      const [r, g, b] = rgb.slice(1, 4).map((part) => {
        const parsed = Number(part);
        const clamped = Math.max(0, Math.min(parsed, 255));
        return clamped.toString(16).padStart(2, '0');
      });
      return `#${r}${g}${b}`;
    }

    return '#111111';
  }, []);

  const readFileAsDataUrl = React.useCallback(
    (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('Failed to read image file.'));
        reader.readAsDataURL(file);
      }),
    []
  );

  const toImageSrc = React.useCallback(
    async (file: File) => {
      if (onImageUpload) return onImageUpload(file);
      return readFileAsDataUrl(file);
    },
    [onImageUpload, readFileAsDataUrl]
  );

  const insertImageFiles = React.useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));
      if (imageFiles.length === 0) return;

      for (const file of imageFiles) {
        try {
          const src = await toImageSrc(file);
          if (!src) continue;
          editorRef.current?.chain().focus().setImage({ src, alt: file.name }).run();
        } catch (error) {
          console.error(error);
        }
      }
    },
    [toImageSrc]
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      ResizableImage.configure({
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? '',
      }),
    ],
    content: normalizedValue,
    onUpdate: ({ editor: nextEditor }) => {
      if (skipSyncRef.current) return;
      const nextHtml = nextEditor.getHTML();
      lastAppliedExternalValueRef.current = nextHtml;
      setHtmlSource(nextHtml);
      onChange(nextHtml);
    },
    editorProps: {
      handleDrop(view, event) {
        const files = Array.from(event.dataTransfer?.files ?? []).filter((file) =>
          file.type.startsWith('image/')
        );
        if (files.length === 0) return false;

        event.preventDefault();
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        if (typeof pos === 'number') {
          editorRef.current?.chain().focus().setTextSelection(pos).run();
        }
        void insertImageFiles(files);
        return true;
      },
      handlePaste(_view, event) {
        const files = Array.from(event.clipboardData?.files ?? []).filter((file) =>
          file.type.startsWith('image/')
        );
        if (files.length === 0) return false;

        event.preventDefault();
        void insertImageFiles(files);
        return true;
      },
    },
    editable: !disabled,
  });

  editorRef.current = editor;

  React.useEffect(() => {
    if (!editor) return;

    const syncToolbarState = () => {
      try {
        const rawAttrs = editor.getAttributes('textStyle');
        const attrs =
          rawAttrs && typeof rawAttrs === 'object'
            ? (rawAttrs as {
                color?: unknown;
                fontFamily?: unknown;
                fontSize?: unknown;
              })
            : {};

        const nextFontFamily = typeof attrs.fontFamily === 'string' ? attrs.fontFamily : '';
        const nextFontSize = typeof attrs.fontSize === 'string' ? attrs.fontSize : '';

        setSelectedFontFamily(nextFontFamily);
        setSelectedFontSize(nextFontSize);
        setSelectedTextColor(normalizeColorToHex(attrs.color));
      } catch (error) {
        console.error(error);
        setSelectedFontFamily('');
        setSelectedFontSize('');
        setSelectedTextColor('#111111');
      }
    };

    syncToolbarState();
    editor.on('selectionUpdate', syncToolbarState);
    editor.on('transaction', syncToolbarState);

    return () => {
      editor.off('selectionUpdate', syncToolbarState);
      editor.off('transaction', syncToolbarState);
    };
  }, [editor, normalizeColorToHex]);

  React.useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  React.useEffect(() => {
    if (!editor) return;
    if (lastAppliedExternalValueRef.current === normalizedValue) {
      if (htmlSource !== normalizedValue) {
        setHtmlSource(normalizedValue);
      }
      return;
    }
    skipSyncRef.current = true;
    try {
      editor.commands.setContent(normalizedValue || '<p></p>', false);
      lastAppliedExternalValueRef.current = normalizedValue;
      setHtmlSource(normalizedValue);
    } finally {
      skipSyncRef.current = false;
    }
  }, [normalizedValue, htmlSource, editor]);

  React.useEffect(() => {
    if (normalizedValue === htmlSource) return;
    setHtmlSource(normalizedValue);
  }, [normalizedValue, htmlSource]);

  const handleSwitchMode = React.useCallback(
    (nextMode: 'visual' | 'html') => {
      if (nextMode === mode) return;

      if (nextMode === 'html') {
        setHtmlSource(editor?.getHTML() ?? normalizedValue);
        setMode('html');
        return;
      }

      const nextHtml = htmlSource || '<p></p>';
      if (editor) {
        try {
          skipSyncRef.current = true;
          editor.commands.setContent(nextHtml, false);
        } catch (error) {
          console.error(error);
        } finally {
          skipSyncRef.current = false;
        }
      }
      onChange(nextHtml);
      setMode('visual');
    },
    [editor, htmlSource, mode, onChange, normalizedValue]
  );

  const rootStyle = React.useMemo(
    () =>
      ({
        ['--rte-min-height' as any]: `${Math.max(minHeight, 120)}px`,
      }) as React.CSSProperties,
    [minHeight]
  );

  const safeTextColor = /^#[0-9a-f]{6}$/i.test(selectedTextColor)
    ? selectedTextColor
    : '#111111';

  return (
    <div className={cn(styles.root, className)} style={rootStyle}>
      <div className={styles.frame}>
        {mode === 'visual' && (
          <div className={styles.visualPane}>
            <div className={cn(styles.toolbar, toolbarClassName)}>
              <select
                className={styles.toolbarSelect}
                value={selectedFontFamily}
                onChange={(event) => {
                  const next = event.target.value;
                  if (!editor) return;
                  if (!next) {
                    editor.chain().focus().unsetFontFamily().run();
                    return;
                  }
                  editor.chain().focus().setFontFamily(next).run();
                }}
                aria-label="Font Family"
                title="Font Family"
                disabled={disabled}
              >
                <option value="">Font</option>
                <option value="var(--font-family-primary)">Primary</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="'Courier New', monospace">Courier New</option>
              </select>
              <select
                className={styles.toolbarSelect}
                value={selectedFontSize}
                onChange={(event) => {
                  const next = event.target.value;
                  if (!editor) return;
                  if (!next) {
                    editor.chain().focus().unsetFontSize().run();
                    return;
                  }
                  editor.chain().focus().setFontSize(next).run();
                }}
                aria-label="Font Size"
                title="Font Size"
                disabled={disabled}
              >
                <option value="">Size</option>
                <option value="12px">12</option>
                <option value="14px">14</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="20px">20</option>
                <option value="24px">24</option>
                <option value="28px">28</option>
                <option value="32px">32</option>
              </select>
              <label className={styles.toolbarColorLabel} title="Text Color">
                <input
                  type="color"
                  className={styles.toolbarColorInput}
                  value={safeTextColor}
                  onChange={(event) => {
                    if (!editor) return;
                    const next = event.target.value;
                    setSelectedTextColor(next);
                    editor.chain().focus().setColor(next).run();
                  }}
                  aria-label="Text Color"
                  disabled={disabled}
                />
              </label>
              <button
                type="button"
                className={styles.toolbarButton}
                data-active={editor?.isActive('bold') ? 'true' : 'false'}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                aria-label="Bold"
                title="Bold"
                disabled={disabled}
              >
                <Bold size={16} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.toolbarButton}
                data-active={editor?.isActive('italic') ? 'true' : 'false'}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                aria-label="Italic"
                title="Italic"
                disabled={disabled}
              >
                <Italic size={16} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.toolbarButton}
                data-active={editor?.isActive('bulletList') ? 'true' : 'false'}
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                aria-label="Bullet List"
                title="Bullet List"
                disabled={disabled}
              >
                <List size={16} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.toolbarButton}
                data-active={editor?.isActive('orderedList') ? 'true' : 'false'}
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                aria-label="Ordered List"
                title="Ordered List"
                disabled={disabled}
              >
                <ListOrdered size={16} aria-hidden />
              </button>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => editor?.chain().focus().unsetColor().run()}
                aria-label="Clear Color"
                title="Clear Color"
                disabled={disabled}
              >
                A
              </button>
              <button
                type="button"
                className={styles.toolbarButton}
                onClick={() => editor?.chain().focus().setParagraph().run()}
                aria-label="Paragraph"
                title="Paragraph"
                disabled={disabled}
              >
                <Pilcrow size={16} aria-hidden />
              </button>
            </div>
            <div className={cn(styles.editor, editorClassName)}>
              <EditorContent editor={editor} />
            </div>
          </div>
        )}
        {mode === 'html' && (
          <textarea
            className={styles.htmlEditor}
            value={htmlSource}
            onChange={(event) => {
              const next = event.target.value;
              setHtmlSource(next);
              onChange(next);
            }}
            spellCheck={false}
            disabled={disabled}
            aria-label="HTML editor"
          />
        )}
      </div>
      <div className={styles.tabs} role="tablist" aria-label="Editor mode">
        <button
          type="button"
          className={styles.tabButton}
          data-active={mode === 'visual' ? 'true' : 'false'}
          role="tab"
          aria-selected={mode === 'visual'}
          onClick={() => handleSwitchMode('visual')}
          disabled={disabled}
        >
          Visual
        </button>
        <button
          type="button"
          className={styles.tabButton}
          data-active={mode === 'html' ? 'true' : 'false'}
          role="tab"
          aria-selected={mode === 'html'}
          onClick={() => handleSwitchMode('html')}
          disabled={disabled}
        >
          HTML
        </button>
      </div>
    </div>
  );
}
