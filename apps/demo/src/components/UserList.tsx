import { useEffect, useState } from 'react';
import { userApi } from '../api/users';
import type { User } from '../mocks/data/users';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@gen-office/ui';

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userApi.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (id: string) => {
    const user = await userApi.getUser(id);
    setSelectedUser(user);
  };

  const handleCreateUser = async () => {
    const newUser = await userApi.createUser({
      name: '새 사용자',
      email: 'new@example.com',
      role: 'user',
      department: '개발팀',
    });
    alert(`사용자 생성됨: ${newUser.name}`);
    loadUsers();
  };

  const handleUpdateUser = async (id: string) => {
    const updated = await userApi.updateUser(id, {
      department: '업데이트된 부서',
    });
    alert(`사용자 수정됨: ${updated.name}`);
    loadUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      await userApi.deleteUser(id);
      alert('사용자 삭제됨');
      loadUsers();
    }
  };

  if (loading) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>사용자 목록 ({users.length}명)</CardTitle>
            <Button onClick={handleCreateUser}>새 사용자 추가</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {user.avatar && (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">
                      {user.email} • {user.department}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin'
                        ? 'bg-red-100 text-red-700'
                        : user.role === 'user'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewUser(user.id)}
                  >
                    상세
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateUser(user.id)}
                  >
                    수정
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <CardTitle>선택된 사용자 상세</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>ID:</strong> {selectedUser.id}</div>
              <div><strong>이름:</strong> {selectedUser.name}</div>
              <div><strong>이메일:</strong> {selectedUser.email}</div>
              <div><strong>역할:</strong> {selectedUser.role}</div>
              <div><strong>부서:</strong> {selectedUser.department}</div>
            </div>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setSelectedUser(null)}
            >
              닫기
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};