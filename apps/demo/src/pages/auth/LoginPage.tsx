import { useState } from 'react';
import { useAppStore } from '@/app/store/appStore';
import { login } from '@/shared/api/auth';
import styles from './LoginPage.module.css';

type LoginPageProps = {
  onLoggedIn?: () => void;
};

export default function LoginPage({ onLoggedIn }: LoginPageProps) {
  const setUser = useAppStore((state) => state.setUser);
  const addNotification = useAppStore((state) => state.addNotification);
  const [empNo, setEmpNo] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!empNo.trim() || !password.trim()) {
      addNotification('사번과 비밀번호를 입력해 주세요.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const result = await login({ empNo: empNo.trim(), password });
      const user = result?.user ?? {
        id: empNo.trim(),
        name: empNo.trim(),
        email: '',
        role: 'user',
      };
      setUser(user);
      onLoggedIn?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : '로그인에 실패했습니다.';
      addNotification(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.title}>Gen-Office 로그인</div>
          <div className={styles.subtitle}>사번과 비밀번호를 입력하세요.</div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="empNo">
              사번 (empNo)
            </label>
            <input
              id="empNo"
              className={styles.input}
              type="text"
              value={empNo}
              onChange={(e) => setEmpNo(e.target.value)}
              autoComplete="username"
              disabled={submitting}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              비밀번호
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={submitting}
            />
          </div>
          <div className={styles.actions}>
            <button className={styles.button} type="submit" disabled={submitting}>
              {submitting ? '로그인 중...' : '로그인'}
            </button>
            <div className={styles.help}>세션 기반 인증(JSESSIONID)을 사용합니다.</div>
          </div>
        </form>
      </div>
    </div>
  );
}
