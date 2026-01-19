// packages/gen-grid/src/index.ts

// 1. 메인 컴포넌트
export { GenGrid } from './GenGrid';

// 2. 타입 정의 (타입 전용 export를 사용하여 번들 최적화)
export type { GenGridProps } from './GenGrid.types';
export type { GenGridHandle } from './types/GenGridHandle';

// 3. 내부 상태나 특정 로직을 확장하고 싶은 개발자를 위한 Provider
export { GenGridProvider, useGenGridContext } from './core/context/GenGridProvider';

// 4. (추가 제안) 사용자가 정의할 수 있는 컬럼 메타나 상수
// export type { CustomColumnMeta } from './features/editing/types';

// 5. 유틸 함수들 (필요시)