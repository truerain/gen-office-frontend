import type { Column, Header, Cell } from '@tanstack/react-table'
import clsx from 'clsx'
import styles from './GenGrid.module.css'

type PinnedSide = 'left' | 'right' | false

function getPinnedSide(col: Column<any, any>): PinnedSide {
  // TanStack v8: getIsPinned() => 'left' | 'right' | false
  return col.getIsPinned?.() ?? false
}

export function getPinnedClassName(col: Column<any, any>) {
  const side = getPinnedSide(col)
  return clsx(
    side && styles.pinned,
    side === 'left' && styles.pinnedLeft,
    side === 'right' && styles.pinnedRight,
  )
}

/**
 * sticky offset은 "style"로 넣어야 함.
 * (CSS만으로는 각 컬럼 폭이 가변이라 계산 불가)
 */
export function getPinnedStyle(col: Column<any, any>): React.CSSProperties {
  const side = getPinnedSide(col)
  if (!side) return {}

  // TanStack v8: getStart('left') / getAfter('right') 사용 가능
  if (side === 'left') {
    return {
      position: 'sticky',
      left: col.getStart?.('left') ?? 0,
    }
  }

  return {
    position: 'sticky',
    right: col.getAfter?.('right') ?? 0,
  }
}

/** 편의: className + style 한번에 */
export function getPinnedProps(col: Column<any, any>) {
  return {
    className: getPinnedClassName(col),
    style: getPinnedStyle(col),
  }
}
