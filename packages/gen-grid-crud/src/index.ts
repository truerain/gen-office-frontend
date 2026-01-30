import './index.css';

// 앱에서 "제품용 GenGrid"로 쓰고 싶다면 alias로 export
export { GenGridCrud as GenGrid } from './GenGridCrud';
export type { GenGridCrudProps as GenGridProps } from './GenGridCrud.types';

// 원하면 원 이름도 노출
export { GenGridCrud } from './GenGridCrud';
export type { CrudChange, CrudRowId } from './crud/types';
export type { GenGridCrudProps } from './GenGridCrud.types';
