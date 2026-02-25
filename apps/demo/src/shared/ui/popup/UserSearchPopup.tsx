import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button, Input } from '@gen-office/ui';

import { commonUserApi, type CommonUser } from '@/shared/api/commonUser';

import styles from './UserSearchPopup.module.css';

type UserSearchPopupProps = {
  initialKeyword?: string;
  onSelectUser: (selection: { value: string; label: string; data: CommonUser }) => void;
  onClose: () => void;
};

export const USER_SEARCH_POPUP_CONTENT_CLASS_NAME = styles.content;

export function UserSearchPopup({
  initialKeyword = '',
  onSelectUser,
  onClose,
}: UserSearchPopupProps) {
  const [userSearchInput, setUserSearchInput] = useState(initialKeyword);
  const [userSearchKeyword, setUserSearchKeyword] = useState(initialKeyword.trim());

  const { data: userSearchResults, isFetching: isUserSearchLoading } = useQuery({
    queryKey: ['shared-user-search-popup', userSearchKeyword],
    queryFn: async () => {
      const keyword = userSearchKeyword.trim();
      const list = await commonUserApi.list({
        q: keyword || undefined,
      });
      return Array.isArray(list) ? list : [];
    },
  });

  const userSearchResultList = useMemo(() => {
    if (!Array.isArray(userSearchResults)) return [];
    return userSearchResults;
  }, [userSearchResults]);

  return (
    <div className={styles.body}>
      <div className={styles.searchRow}>
        <Input
          value={userSearchInput}
          onChange={(event) => setUserSearchInput(event.target.value)}
          placeholder="User ID or name"
          clearable={true}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            setUserSearchKeyword(userSearchInput.trim());
          }}
        />
        <Button type="button" size="sm" onClick={() => setUserSearchKeyword(userSearchInput.trim())}>
          Search
        </Button>
      </div>
      <div className={styles.result}>
        {isUserSearchLoading ? (
          <div className={styles.message}>Loading...</div>
        ) : userSearchResultList.length === 0 ? (
          <div className={styles.message}>No users found.</div>
        ) : (
          <ul className={styles.list}>
            {userSearchResultList.map((user) => (
              <li key={user.userId}>
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => {
                    const value = String(user.userId);
                    const label = `${user.empName ?? '-'} ${user.titleName ?? ''}`;
                    onSelectUser({ value, label, data: user });
                    onClose();
                  }}
                >
                  <span className={styles.itemTitle}>
                    {user.empName ?? '-'} {user.titleName ?? ''} ({user.empNo}) / {user.orgName}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
