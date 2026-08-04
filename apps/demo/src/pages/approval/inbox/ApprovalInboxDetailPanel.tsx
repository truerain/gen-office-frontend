// apps/demo/src/pages/approval/inbox/ApprovalInboxDetailPanel.tsx
// Right-pane detail view for a selected approval document.

import { ArrowLeft, Check, X } from 'lucide-react';

import { Button, Input } from '@gen-office/ui';

import type { ApprovalDocument, ApprovalStep } from '@/pages/approval/inbox/model/types';

import styles from './ApprovalInboxPage.module.css';

const DOC_TYPE_LABEL: Record<ApprovalDocument['docType'], string> = {
  expense: '경비',
  leave: '휴가',
  purchase: '구매',
  contract: '계약',
  general: '일반',
};

const STATUS_LABEL: Record<ApprovalDocument['status'], string> = {
  pending: '대기',
  completed: '완료',
  rejected: '반려',
};

const STEP_STATUS_LABEL: Record<ApprovalStep['status'], string> = {
  pending: '대기',
  approved: '승인',
  rejected: '반려',
  waiting: '예정',
};

function formatDateTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export type ApprovalInboxDetailPanelProps = {
  document: ApprovalDocument | null;
  isLoading?: boolean;
  comment: string;
  onCommentChange: (next: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onBack: () => void;
  canDecide?: boolean;
  isDeciding?: boolean;
};

export function ApprovalInboxDetailPanel({
  document,
  isLoading = false,
  comment,
  onCommentChange,
  onApprove,
  onReject,
  onBack,
  canDecide = false,
  isDeciding = false,
}: ApprovalInboxDetailPanelProps) {
  if (!document) {
    return (
      <div className={styles.detail}>
        <div className={styles.detailToolbar}>
          <Button type="button" variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={onBack}>
            목록
          </Button>
        </div>
        <div className={styles.detailEmpty}>
          {isLoading ? '상세를 불러오는 중...' : '문서를 찾을 수 없습니다.'}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.detail}>
      <div className={styles.detailToolbar}>
        <Button type="button" variant="outline" leftIcon={<ArrowLeft size={16} />} onClick={onBack}>
          목록
        </Button>
      </div>

      <div className={styles.detailHeader}>
        <div>
          <div className={styles.detailDocId}>{document.docId}</div>
          <h2 className={styles.detailTitle}>{document.title}</h2>
        </div>
        <span className={styles.detailStatus} data-status={document.status}>
          {STATUS_LABEL[document.status]}
        </span>
      </div>

      <dl className={styles.detailMeta}>
        <div>
          <dt>함</dt>
          <dd>{document.box === 'request' ? '품의' : '결재함'}</dd>
        </div>
        <div>
          <dt>유형</dt>
          <dd>{DOC_TYPE_LABEL[document.docType]}</dd>
        </div>
        <div>
          <dt>기안자</dt>
          <dd>
            {document.requesterName} ({document.requesterDept})
          </dd>
        </div>
        <div>
          <dt>기안일시</dt>
          <dd>{formatDateTime(document.requestedAt)}</dd>
        </div>
        <div>
          <dt>금액</dt>
          <dd>{document.amount != null ? `${document.amount.toLocaleString('ko-KR')}원` : '-'}</dd>
        </div>
      </dl>

      <section className={styles.detailSection}>
        <h3>요약</h3>
        <p>{document.summary}</p>
      </section>

      <section className={styles.detailSection}>
        <h3>본문</h3>
        <pre className={styles.detailBody}>{document.body}</pre>
      </section>

      <section className={styles.detailSection}>
        <h3>결재선</h3>
        <ol className={styles.stepList}>
          {document.steps.map((step) => (
            <li
              key={step.stepNo}
              data-status={step.status}
              data-current={step.stepNo === document.currentStep}
            >
              <div className={styles.stepMain}>
                <span className={styles.stepNo}>{step.stepNo}</span>
                <span>
                  {step.approverName} · {step.approverDept}
                </span>
                <span className={styles.stepStatus}>{STEP_STATUS_LABEL[step.status]}</span>
              </div>
              <div className={styles.stepMeta}>
                {formatDateTime(step.actedAt)}
                {step.comment ? ` · ${step.comment}` : ''}
              </div>
            </li>
          ))}
        </ol>
      </section>

      {canDecide ? (
        <section className={styles.detailActions}>
          <label className={styles.commentField}>
            <span>의견</span>
            <Input
              value={comment}
              onChange={(event) => onCommentChange(event.target.value)}
              placeholder="승인/반려 의견을 입력하세요 (반려 시 필수)"
              disabled={isDeciding}
            />
          </label>
          <div className={styles.actionButtons}>
            <Button
              type="button"
              variant="primary"
              disabled={isDeciding}
              leftIcon={<Check size={16} aria-hidden />}
              onClick={onApprove}
            >
              승인
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isDeciding}
              leftIcon={<X size={16} aria-hidden />}
              onClick={onReject}
            >
              반려
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
