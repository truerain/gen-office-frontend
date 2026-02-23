export type RichTextEditorProps = {
  value: string;
  onChange: (nextHtml: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  toolbarClassName?: string;
  editorClassName?: string;
  disabled?: boolean;
};
