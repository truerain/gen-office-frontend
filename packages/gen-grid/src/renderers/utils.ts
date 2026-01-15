
// Step2: column meta(표현 힌트) 타입
export type GenGridColumnMeta = {
  align?: 'left' | 'center' | 'right';
  mono?: boolean; // 숫자/코드 컬럼용
};

// Step2: columnDef에서 meta 꺼내는 헬퍼
export function getMeta(columnDef: any): GenGridColumnMeta | undefined {
  return columnDef?.meta as GenGridColumnMeta | undefined;
}
