export type GenGridValidationTrigger = 'change' | 'blur' | 'commit';

export type GenGridValidationError = {
  code: string;
  messageKey?: string;
  defaultMessage?: string;
};

export type GenGridFieldValidatorContext<TData> = {
  value: unknown;
  row: TData;
  rowId: string;
  columnId: string;
  isCreate: boolean;
  isUpdate: boolean;
  viewData: readonly TData[];
};

export type GenGridFieldValidator<TData> = (
  ctx: GenGridFieldValidatorContext<TData>
) => GenGridValidationError | null | Promise<GenGridValidationError | null>;

export type GenGridValidationRule<TData> =
  | { type: 'required' }
  | { type: 'minLength'; value: number }
  | { type: 'maxLength'; value: number }
  | { type: 'size'; value: number }
  | { type: 'min'; value: number }
  | { type: 'max'; value: number }
  | { type: 'pattern'; value: RegExp }
  | { type: 'oneOf'; value: readonly (string | number | boolean)[] }
  | { type: 'numeric' }
  | { type: 'alphanumeric' }
  | { type: 'email' }
  | { type: 'phone' }
  | { type: 'url' }
  | { type: 'custom'; validate: GenGridFieldValidator<TData> };

export type GenGridFieldValidationMeta<TData> = {
  trim?: boolean;
  validateOn?: GenGridValidationTrigger | readonly GenGridValidationTrigger[];
  rules: readonly GenGridValidationRule<TData>[];
};
