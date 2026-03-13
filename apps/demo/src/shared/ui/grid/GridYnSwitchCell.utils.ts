type YnValue = 'Y' | 'N';

type GridYnSwitchSpaceHandlerParams = {
  value?: unknown;
  commitValue?: (value: YnValue) => void;
  'readonly'?: boolean;
};

const toYn = (value: unknown): YnValue => (value === 'Y' ? 'Y' : 'N');

export const handleGridYnSwitchSpace = ({
  value,
  commitValue,
  readonly: readonlyProp = false,
}: GridYnSwitchSpaceHandlerParams) => {
  if (readonlyProp) return;
  const next: YnValue = toYn(value) === 'Y' ? 'N' : 'Y';
  commitValue?.(next);
};
