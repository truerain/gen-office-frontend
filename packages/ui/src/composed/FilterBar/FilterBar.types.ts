// packages/ui/src/composed/FilterBar/FilterBar.types.ts
import type { ReactNode } from 'react';

export type FilterFieldOption = { label: string; value: string | number };

type FilterFieldBase<TFilters> = {
  key: keyof TFilters;
  title?: string;
  flex?: number;
  width?: string;
  className?: string;
  /** Trigger onSearch when pressing Enter in this field (text only). */
  enterToSearch?: boolean;
};

export type FilterField<TFilters> =
  | (FilterFieldBase<TFilters> & {
      type: 'text' | 'search' | 'select';
      label?: string;
      placeholder?: string;
      options?: FilterFieldOption[];
    })
  | (FilterFieldBase<TFilters> & {
      type: 'custom';
      render: (
        value: TFilters[keyof TFilters],
        onChange: (next: unknown) => void
      ) => ReactNode;
    });

export type SimpleFilterBarProps<TFilters> = {
  value: TFilters;
  fields: FilterField<TFilters>[];
  onChange: (next: TFilters) => void;
  actions?: ReactNode;
  onSearch?: () => void;
  searchLabel?: string;
  className?: string;
};
