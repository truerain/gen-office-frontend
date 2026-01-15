export type GenGridHandle<TData> = {
  /** 현재 내부 data 스냅샷 */
  getData: () => TData[];

  /** baseline으로 되돌림 (dirty 제거 + data를 baseline으로 복원) */
  revertAll: () => void;

  /** 현재 data를 baseline으로 승인(저장 성공 후 호출) */
  acceptChanges: () => void;

  /** 새 데이터셋 로드 (data/baseline 교체 + 상태 초기화) */
  load: (nextData: TData[]) => void;

  /** mount 시점 defaultData로 되돌림 */
  hardReset: () => void;

  /** dirty 상태 */
  isDirty: () => boolean;
};
