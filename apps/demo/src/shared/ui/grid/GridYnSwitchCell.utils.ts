type YnValue = 'Y' | 'N';

type GridYnSwitchSpaceHandlerParams = {
  value?: unknown;
  commitValue?: (value: YnValue) => void;
};

const toYn = (value: unknown): YnValue => (value === 'Y' ? 'Y' : 'N');

export const handleGridYnSwitchSpace = ({
  value,
  commitValue,
}: GridYnSwitchSpaceHandlerParams) => {
  const next: YnValue = toYn(value) === 'Y' ? 'N' : 'Y';
  commitValue?.(next);
};

