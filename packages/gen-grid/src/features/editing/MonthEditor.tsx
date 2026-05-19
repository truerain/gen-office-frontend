import { MonthPicker } from '@gen-office/ui';
import type { MonthPickerProps } from '@gen-office/ui';
import type { CellEditorRenderArgs } from './columnMeta';

type MonthEditorProps<TRow> = {
  editor: Pick<CellEditorRenderArgs<TRow>, 'value' | 'onChange' | 'applyValue'>;
  placeholder?: string;
  fromMonth?: Date;
  toMonth?: Date;
  locale?: string;
  format?: MonthPickerProps['format'];
  parse?: MonthPickerProps['parse'];
};

function parseYearMonth(value: string): Date | undefined {
  const normalized = value.trim();
  const match = normalized.match(/^(\d{4})-(\d{2})$/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) return undefined;
  return new Date(year, month - 1, 1);
}

function formatYearMonth(date?: Date): string {
  if (!date) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function MonthEditor<TRow>({
  editor,
  placeholder = 'Select month',
  fromMonth,
  toMonth,
  locale,
  format,
  parse,
}: MonthEditorProps<TRow>) {
  const current = parseYearMonth(String(editor.value ?? ''));
  return (
    <div style={{ width: '100%', minWidth: 0 }} onMouseDown={(event) => event.stopPropagation()}>
      <MonthPicker
        value={current}
        placeholder={placeholder}
        fromMonth={fromMonth}
        toMonth={toMonth}
        locale={locale}
        format={format ?? ((date) => formatYearMonth(date))}
        parse={parse}
        editorOverlay={true}
        onChange={(next) => {
          const nextValue = formatYearMonth(next);
          editor.onChange(nextValue);
          editor.applyValue(nextValue);
        }}
      />
    </div>
  );
}
