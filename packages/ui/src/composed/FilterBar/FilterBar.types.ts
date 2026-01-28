// packages/ui/src/composed/FilterBar/FilterBar.types.ts
import type { ReactNode } from 'react';

export type FilterFieldOption = { label: string; value: string | number };

export type FilterField<TFilters> =
  | {
      key: keyof TFilters;
      title?: string;
      type: 'text' | 'search' | 'select';
      label?: string;
      placeholder?: string;
      options?: FilterFieldOption[];
      flex?: number;
      width?: string;
      className?: string;
    }
  | {
      key: keyof TFilters;
      title?: string;
      type: 'custom';
      render: (
        value: TFilters[keyof TFilters],
        onChange: (next: unknown) => void
      ) => ReactNode;
      flex?: number;
      width?: string;
      className?: string;
    };

export type GenericFilterBarProps<TFilters> = {
  value: TFilters;
  fields: FilterField<TFilters>[];
  onChange: (next: TFilters) => void;
  actions?: ReactNode;
  onSearch?: () => void;
  searchLabel?: string;
  className?: string;
};
