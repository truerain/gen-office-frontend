// apps/demo/src/pages/customer/CustomerInfoPage/components/CustomerActionBar.tsx
import { Button, Badge } from '@gen-office/ui';
import { RefreshCw, Download, Upload } from 'lucide-react';
import styles from './CustomerActionBar.module.css';

interface CustomerActionBarProps {
  total: number;
  onRefresh: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onCreate?: () => void;
}

function CustomerActionBar({
  total,
  onRefresh,
  onExport,
  onImport,
}: CustomerActionBarProps) {
  return (
    <div className={styles.actionBar}>
      <div className={styles.left}>
        <div className={styles.stats}>
          <span className={styles.label}>총 고객</span>
          <Badge variant="secondary">{total.toLocaleString()}</Badge>
        </div>
      </div>

      <div className={styles.right}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          leftIcon={<RefreshCw size={16} />}
        >
          새로고침
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          leftIcon={<Download size={16} />}
        >
          내보내기
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onImport}
          leftIcon={<Upload size={16} />}
        >
          가져오기
        </Button>

      </div>
    </div>
  );
}

export default CustomerActionBar;