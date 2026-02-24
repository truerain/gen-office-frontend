import type { Message } from '@/entities/system/message/model/types';

export const mockMessages: Message[] = [
  {
    namespace: 'userEntity',
    messageCd: 'not_found',
    langCd: 'ko',
    messageTxt: '사용자를 찾을 수 없습니다',
    createdAt: '2026-02-23T10:00:00',
    updatedAt: '2026-02-23T10:00:00',
  },
  {
    namespace: 'userEntity',
    messageCd: 'not_found',
    langCd: 'en',
    messageTxt: 'User not found',
    createdAt: '2026-02-23T10:01:00',
    updatedAt: '2026-02-23T10:01:00',
  },
  {
    namespace: 'auth',
    messageCd: 'invalid_credentials',
    langCd: 'ko',
    messageTxt: '아이디 또는 비밀번호가 올바르지 않습니다',
    createdAt: '2026-02-23T10:02:00',
    updatedAt: '2026-02-23T10:02:00',
  },
];
