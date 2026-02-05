// packages/ui/src/composed/FilterBar/SimpleFilterBar.tsx
import type { SimpleFilterBarProps, FilterField } from './FilterBar.types';
import { FilterBar } from './FilterBar';
import { SearchInput } from './SearchInput';
import { Input } from '../../core/Input';
import { SimpleSelect } from '../../core/Select';
import { Button } from '../../core/Button';
import { Search } from 'lucide-react';

function renderDefaultField<TFilters>(
  field: FilterField<TFilters>,
  value: TFilters,
  onChange: (next: TFilters) => void
) {
  if (field.type === 'custom') return null;

  const key = field.key;
  const fieldValue = value[key] as unknown;
  const setFieldValue = (nextValue: unknown) => {
    onChange({ ...value, [key]: nextValue } as TFilters);
  };

  switch (field.type) {
    case 'search':
      return (
        <SearchInput
          value={String(fieldValue ?? '')}
          onChange={(next) => setFieldValue(next)}
          placeholder={field.placeholder}
          className={field.className}
        />
      );
    case 'select':
      return (
        <SimpleSelect
          value={String(fieldValue ?? '')}
          onValueChange={(next) => setFieldValue(next)}
          placeholder={field.placeholder}
          options={(field.options ?? []).map((opt) => ({
            label: opt.label,
            value: String(opt.value),
          }))}
        />
      );
    case 'text':
    default:
      return (
        <Input
          value={String(fieldValue ?? '')}
          onChange={(e) => setFieldValue(e.target.value)}
          placeholder={field.placeholder}
          className={field.className}
          clearable
        />
      );
  }
}

export function SimpleFilterBar<TFilters>({
  value,
  fields,
  onChange,
  actions,
  onSearch,
  searchLabel = 'Search',
  className,
}: SimpleFilterBarProps<TFilters>) {
  const resolvedActions =
    actions ??
    (onSearch ? (
      <Button onClick={onSearch} variant="primary" size="md" fullWidth={true}>
        <Search size={16} />
        {searchLabel}
      </Button>
    ) : null);

  return (
    <FilterBar actions={resolvedActions} className={className}>
      {fields.map((field) => (
        <FilterBar.Item
          key={String(field.key)}
          title={String(field.title ?? '')}
          flex={field.flex}
          width={field.width}
          className={field.className}
        >
          {field.type === 'custom'
            ? field.render(value[field.key], (next) =>
                onChange({ ...value, [field.key]: next } as TFilters)
              )
            : renderDefaultField(field, value, onChange)}
        </FilterBar.Item>
      ))}
    </FilterBar>
  );
}

export default SimpleFilterBar;
