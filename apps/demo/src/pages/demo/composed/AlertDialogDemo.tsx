// apps/demo/src/pages/demo/Composed/AlertDialogDemo/AlertDialogDemo.tsx
import { useState } from 'react';
import { AlertDialog, Button } from '@gen-office/ui';
import { 
  Info, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  Trash2,
  Save,
  Send,
  Download
} from 'lucide-react';
import { useAppStore } from '@/app/store/appStore';
import styles from './AlertDialogDemo.module.css';

function AlertDialogDemo() {
  const addNotification = useAppStore((state) => state.addNotification);
  const [infoOpen, setInfoOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [asyncOpen, setAsyncOpen] = useState(false);
  const [singleButtonOpen, setSingleButtonOpen] = useState(false);
  const [styledOpen, setStyledOpen] = useState(false);

  // 비동기 작업 시뮬레이션
  const handleAsyncConfirm = async () => {
    console.log('비동기 작업 시작...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('비동기 작업 완료!');
    addNotification('작업이 완료되었습니다!', 'success');
  };

  // 삭제 작업
  const handleDelete = () => {
    console.log('삭제됨');
    addNotification('항목이 삭제되었습니다!', 'success');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>AlertDialog 컴포넌트</h1>
        <p className={styles.description}>
          사용자에게 중요한 정보를 전달하거나 확인이 필요한 액션을 수행할 때 사용하는 Composed 컴포넌트입니다.
        </p>
      </div>

      <div className={styles.content}>
        {/* Variants Section */}
        <section className={styles.section}>
          <h2>Variants</h2>
          <p>4가지 variant로 다양한 상황에 대응할 수 있습니다.</p>
          
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
                <Info size={24} />
              </div>
              <h3>Info</h3>
              <p>일반적인 정보를 전달할 때 사용합니다.</p>
              <Button variant="outline" onClick={() => setInfoOpen(true)}>
                Info 열기
              </Button>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
                <AlertTriangle size={24} />
              </div>
              <h3>Warning</h3>
              <p>주의가 필요한 작업을 수행할 때 사용합니다.</p>
              <Button variant="outline" onClick={() => setWarningOpen(true)}>
                Warning 열기
              </Button>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
                <XCircle size={24} />
              </div>
              <h3>Error</h3>
              <p>위험한 작업이나 오류를 표시할 때 사용합니다.</p>
              <Button variant="outline" onClick={() => setErrorOpen(true)}>
                Error 열기
              </Button>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon} style={{ backgroundColor: '#d1fae5', color: '#10b981' }}>
                <CheckCircle size={24} />
              </div>
              <h3>Success</h3>
              <p>성공 메시지를 표시할 때 사용합니다.</p>
              <Button variant="outline" onClick={() => setSuccessOpen(true)}>
                Success 열기
              </Button>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className={styles.section}>
          <h2>실제 사용 예시</h2>
          <p>실무에서 자주 사용되는 패턴들입니다.</p>

          <div className={styles.grid}>
            <div className={styles.card}>
              <Trash2 className={styles.useCaseIcon} size={32} />
              <h3>삭제 확인</h3>
              <p>위험한 작업 전 사용자 확인을 받습니다.</p>
              <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 size={16} />
                삭제하기
              </Button>
            </div>

            <div className={styles.card}>
              <Save className={styles.useCaseIcon} size={32} />
              <h3>비동기 작업</h3>
              <p>API 호출 등 비동기 작업을 자동으로 처리합니다.</p>
              <Button onClick={() => setAsyncOpen(true)}>
                <Save size={16} />
                저장하기 (2초 소요)
              </Button>
            </div>

            <div className={styles.card}>
              <Send className={styles.useCaseIcon} size={32} />
              <h3>단일 버튼</h3>
              <p>확인만 필요한 알림에 사용합니다.</p>
              <Button variant="outline" onClick={() => setSingleButtonOpen(true)}>
                <Download size={16} />
                다운로드 완료 알림
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className={styles.section}>
          <h2>주요 기능</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h4>✅ 4가지 Variant</h4>
              <p>info, warning, error, success 타입 지원</p>
            </div>
            <div className={styles.feature}>
              <h4>⚡ 비동기 작업</h4>
              <p>Promise 반환 시 자동 로딩 처리</p>
            </div>
            <div className={styles.feature}>
              <h4>🎨 커스터마이징</h4>
              <p>버튼 텍스트, 취소 버튼 숨김 등</p>
            </div>
            <div className={styles.feature}>
              <h4>♿ 접근성</h4>
              <p>키보드 네비게이션, ESC 키 지원</p>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className={styles.section}>
          <h2>코드 예시</h2>
          <pre className={styles.codeBlock}>
            <code>{`import { AlertDialog, Button } from '@gen-office/ui';

function MyComponent() {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deleteUser(userId);
    // 성공 후 자동으로 닫힘
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>삭제</Button>
      
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="정말 삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다."
        variant="error"
        onConfirm={handleDelete}
      />
    </>
  );
}`}</code>
          </pre>
        </section>

        {/* Advanced Formatting Section */}
        <section className={styles.section}>
          <h2>고급 포맷팅</h2>
          <p>description에 HTML/JSX를 사용하여 강조, 링크, 리스트 등을 추가할 수 있습니다.</p>

          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>포맷팅된 설명</h3>
              <p>강조, 리스트, 이탤릭 등을 사용한 풍부한 콘텐츠</p>
              <Button variant="outline" onClick={() => setStyledOpen(true)}>
                예제 보기
              </Button>
            </div>
          </div>

          <pre className={styles.codeBlock}>
            <code>{`<AlertDialog
  description={
    <>
      다음 항목들이 <strong>영구적으로 삭제</strong>됩니다:
      <ul>
        <li>모든 고객 데이터</li>
        <li>관련 거래 내역</li>
      </ul>
      <em>이 작업은 되돌릴 수 없습니다.</em>
    </>
  }
/>`}</code>
          </pre>
        </section>
      </div>

      {/* AlertDialog Instances */}
      <AlertDialog
        open={infoOpen}
        onOpenChange={setInfoOpen}
        title="정보"
        description="이것은 정보 메시지입니다. Info variant는 일반적인 알림에 사용됩니다."
        variant="info"
        onConfirm={() => console.log('Info confirmed')}
      />

      <AlertDialog
        open={warningOpen}
        onOpenChange={setWarningOpen}
        title="주의"
        description="계속하시겠습니까? 이 작업은 중요한 변경을 수행합니다."
        variant="warning"
        onConfirm={() => console.log('Warning confirmed')}
      />

      <AlertDialog
        open={errorOpen}
        onOpenChange={setErrorOpen}
        title="오류 발생"
        description="작업을 수행하는 중 오류가 발생했습니다. 다시 시도해주세요."
        variant="error"
        confirmText="재시도"
        onConfirm={() => console.log('Error confirmed')}
      />

      <AlertDialog
        open={successOpen}
        onOpenChange={setSuccessOpen}
        title="성공"
        description="작업이 성공적으로 완료되었습니다!"
        variant="success"
        onConfirm={() => console.log('Success confirmed')}
      />

      <AlertDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="정말 삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다. 삭제된 데이터는 복구할 수 없습니다."
        variant="error"
        confirmText="삭제"
        cancelText="취소"
        onConfirm={handleDelete}
      />

      <AlertDialog
        open={asyncOpen}
        onOpenChange={setAsyncOpen}
        title="저장하시겠습니까?"
        description="변경 사항을 저장합니다. 약 2초 정도 소요됩니다."
        variant="info"
        confirmText="저장"
        onConfirm={handleAsyncConfirm}
      />

      <AlertDialog
        open={singleButtonOpen}
        onOpenChange={setSingleButtonOpen}
        title="다운로드 완료"
        description="파일이 성공적으로 다운로드되었습니다."
        variant="success"
        hideCancelButton={true}
        confirmText="확인"
        onConfirm={() => console.log('Download confirmed')}
      />

      <AlertDialog
        open={styledOpen}
        onOpenChange={setStyledOpen}
        title="데이터 삭제 경고"
        description={
          <>
            다음 항목들이 <strong style={{ color: 'var(--color-status-error)' }}>영구적으로 삭제</strong>됩니다:
            <ul style={{ marginTop: '0.75rem', marginBottom: '0.75rem', paddingLeft: '1.5rem' }}>
              <li>모든 고객 데이터 (1,234건)</li>
              <li>관련 거래 내역 (5,678건)</li>
              <li>첨부 파일 및 문서 (234 MB)</li>
            </ul>
            <em style={{ color: 'var(--color-text-secondary)' }}>
              이 작업은 되돌릴 수 없습니다.
            </em>
          </>
        }
        variant="error"
        confirmText="삭제"
        onConfirm={() => console.log('Styled confirmed')}
      />
    </div>
  );
}

export default AlertDialogDemo;
