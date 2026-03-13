import type { CSSProperties } from 'react';
import { Switch } from '@gen-office/ui';
import styles from './GridYnSwitchCell.module.css';

type YnValue = 'Y' | 'N';

type GridYnSwitchCellProps = {
  value?: unknown;
  commitValue?: (value: YnValue) => void;
  'readonly'?: boolean;
};

const gridYnSwitchStyle: CSSProperties & Record<`--${string}`, string> = {
  '--switch-width': '1.75rem',
  '--switch-height': '1.0rem',
  '--switch-thumb-size': '0.55rem',
  '--switch-thumb-x': '0.125rem',
  '--switch-thumb-checked-x': '1.125rem',
};

const toYn = (value: unknown): YnValue => (value === 'Y' ? 'Y' : 'N');

export const GridYnSwitchCell = ({
  value,
  commitValue,
  readonly: readonlyProp = false,
}: GridYnSwitchCellProps) => (
  <div className={styles.wrapper}>
    <Switch
      checked={toYn(value) === 'Y'}
      disabled={readonlyProp}
      onCheckedChange={(next) => {
        if (readonlyProp) return;
        commitValue?.(next ? 'Y' : 'N');
      }}
      style={gridYnSwitchStyle}
    />
  </div>
);
