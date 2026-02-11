import { useTranslation } from 'react-i18next';
import styles from './LoadingPage.module.css';

const LoadingPage = () => {
  const { t } = useTranslation('common');

  return (
    <div className={styles.root}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{t('common.loading', 'Loading page...')}</p>
    </div>
  );
};

export default LoadingPage;
