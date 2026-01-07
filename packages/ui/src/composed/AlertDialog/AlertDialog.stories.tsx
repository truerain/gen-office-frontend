// packages/ui/src/composed/AlertDialog/AlertDialog.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AlertDialog } from './AlertDialog';
import { Button } from '../../core/Button';
import type { AlertDialogProps } from './AlertDialog.types';

// component를 제거하고 title만 지정
const meta: Meta = {
  title: 'Composed/AlertDialog',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

// Interactive wrapper component
const InteractiveAlertDialog = (props: Omit<AlertDialogProps, 'open' | 'onOpenChange'>) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <AlertDialog open={open} onOpenChange={setOpen} {...props} />
    </>
  );
};

export const Info: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="info"
      title="정보"
      description="이것은 정보 메시지입니다."
      onConfirm={() => console.log('Confirmed!')}
    />
  ),
};

export const Warning: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="warning"
      title="경고"
      description="계속하시겠습니까? 이 작업은 중요한 변경을 수행합니다."
      onConfirm={() => console.log('Confirmed!')}
    />
  ),
};

export const Error: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="error"
      title="오류 발생"
      description="작업을 수행하는 중 오류가 발생했습니다."
      onConfirm={() => console.log('Confirmed!')}
    />
  ),
};

export const Success: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="success"
      title="성공"
      description="작업이 성공적으로 완료되었습니다."
      onConfirm={() => console.log('Confirmed!')}
    />
  ),
};

export const DeleteConfirmation: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="error"
      title="정말 삭제하시겠습니까?"
      description="이 작업은 되돌릴 수 없습니다. 삭제된 데이터는 복구할 수 없습니다."
      confirmText="삭제"
      onConfirm={() => console.log('Deleted!')}
    />
  ),
};

export const WithoutCancelButton: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="info"
      title="알림"
      description="확인 버튼만 있는 알림입니다."
      hideCancelButton={true}
      onConfirm={() => console.log('Confirmed!')}
    />
  ),
};

export const AsyncConfirm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    const handleConfirm = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('비동기 작업 완료!');
    };

    return (
      <>
        <Button onClick={() => setOpen(true)}>비동기 확인</Button>
        
        <AlertDialog
          open={open}
          onOpenChange={setOpen}
          title="비동기 작업"
          description="확인 버튼을 누르면 2초 후 작업이 완료됩니다."
          variant="info"
          onConfirm={handleConfirm}
        />
      </>
    );
  },
};

export const LongDescription: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="warning"
      title="매우 긴 설명이 있는 알림"
      description="이것은 매우 긴 설명입니다. 때로는 사용자에게 많은 정보를 제공해야 할 수 있습니다. 예를 들어, 서비스 약관 동의, 중요한 정책 변경 사항, 또는 복잡한 작업에 대한 상세한 설명이 필요할 수 있습니다. AlertDialog는 이러한 긴 텍스트도 적절히 처리할 수 있어야 합니다."
      onConfirm={() => console.log('Confirmed!')}
    />
  ),
};

export const WithStyledDescription: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="warning"
      title="포맷팅된 설명"
      description={
        <>
          다음 항목들이 <strong>영구적으로 삭제</strong>됩니다:
          <ul style={{ marginTop: '0.5rem', marginBottom: '0.5rem', paddingLeft: '1.5rem' }}>
            <li>모든 고객 데이터 (1,234건)</li>
            <li>관련 거래 내역 (5,678건)</li>
            <li>첨부 파일 및 문서</li>
          </ul>
          <em>이 작업은 되돌릴 수 없습니다.</em>
        </>
      }
      confirmText="삭제"
      onConfirm={() => console.log('Deleted with styled description!')}
    />
  ),
};

export const WithLinks: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="info"
      title="약관 동의"
      description={
        <>
          계속하려면 다음 약관에 동의해야 합니다:
          <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
            • <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>서비스 이용약관</a>
            <br />
            • <a href="#" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>개인정보 처리방침</a>
          </div>
          모든 약관을 읽고 동의하셨습니까?
        </>
      }
      confirmText="동의합니다"
      onConfirm={() => console.log('Agreed!')}
    />
  ),
};

export const WithHighlight: Story = {
  render: () => (
    <InteractiveAlertDialog
      variant="error"
      title="중요 알림"
      description={
        <>
          <span style={{ 
            backgroundColor: 'var(--color-status-error-light, #fee2e2)', 
            padding: '0.125rem 0.375rem',
            borderRadius: '0.25rem',
            fontWeight: '600'
          }}>
            주의!
          </span>
          {' '}이 작업은 <strong>24시간 이내</strong>에만 취소할 수 있습니다.
          <br />
          <br />
          계속하시겠습니까?
        </>
      }
      onConfirm={() => console.log('Confirmed with highlight!')}
    />
  ),
};