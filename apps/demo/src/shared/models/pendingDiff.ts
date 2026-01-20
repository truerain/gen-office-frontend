// shared/models/pendingDiff.ts

export type PendingDiff<T, TId extends string | number = string> = {
  added: T[];
  modified: T[];
  deleted: { id: TId }[];
};

export function isDiffDirty<T, TId extends string | number>(diff: PendingDiff<T, TId>) {
  return diff.added.length > 0 || diff.modified.length > 0 || diff.deleted.length > 0;
}