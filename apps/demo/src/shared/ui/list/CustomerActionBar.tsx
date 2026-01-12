// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerActionBar.tsx
import styles from './CustomerActionBar.module.css';

type Props = {
  total: number;

  onCreate: () => void;
  onRefresh: () => void;
  onExport?: () => void;
  onImport?: () => void;

  disabled?: boolean;
};

export default function CustomerActionBar({
  total,
  onCreate,
  onRefresh,
  onExport,
  onImport,
  disabled,
}: Props) {
  return (
    <div className={styles.root}>
      {/* 좌측: 총 건수 */}
      <div className={styles.left}>
        <span className={styles.total}>총 {total.toLocaleString()}건</span>
      </div>

      {/* 우측: 액션 버튼들 */}
      <div className={styles.right}>
        <button
          type="button"
          className={styles.button}
          onClick={onRefresh}
          disabled={disabled}
        >
          새로고침
        </button>

        {onExport && (
          <button
            type="button"
            className={styles.button}
            onClick={onExport}
            disabled={disabled}
          >
            내보내기
          </button>
        )}

        {onImport && (
          <button
            type="button"
            className={styles.button}
            onClick={onImport}
            disabled={disabled}
          >
            가져오기
          </button>
        )}

        <button
          type="button"
          className={`${styles.button} ${styles.primary}`}
          onClick={onCreate}
          disabled={disabled}
        >
          + 추가
        </button>
      </div>
    </div>
  );
}
