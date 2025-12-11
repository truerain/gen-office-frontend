// grids/UserGrid/actions.ts
import type { User } from './types';

export class UserGridActions {
  private setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  private setSelectedRows: React.Dispatch<React.SetStateAction<(number | string)[]>>;

  constructor(
    setUsers: React.Dispatch<React.SetStateAction<User[]>>,
    setSelectedRows: React.Dispatch<React.SetStateAction<(number | string)[]>>
  ) {
    this.setUsers = setUsers;
    this.setSelectedRows = setSelectedRows;
  }

  // 편집 처리
  handleEdit = (rowKey: string | number, columnId: string, newValue: any) => {
    console.log('편집됨:', { rowKey, columnId, newValue });

    this.setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === rowKey
          ? { ...user, [columnId]: newValue }
          : user
      )
    );
  };

  // 삭제 처리
  handleDelete = () => {
    this.setUsers(prevUsers => {
      const selectedSet = new Set(this.getSelectedRows());
      return prevUsers.filter(user => !selectedSet.has(user.id));
    });
    this.setSelectedRows([]);
  };

  // 선택된 행 가져오기 (외부에서 주입)
  private getSelectedRows: () => (number | string)[] = () => [];

  setGetSelectedRows = (fn: () => (number | string)[]) => {
    this.getSelectedRows = fn;
  };

  // API 호출 예시
  async saveChanges(modifiedData: User[]) {
    try {
      // await api.updateUsers(modifiedData);
      console.log('저장할 데이터:', modifiedData);
    } catch (error) {
      console.error('저장 실패:', error);
    }
  }

  // 데이터 불러오기
  async loadUsers() {
    try {
      // const users = await api.getUsers();
      // this.setUsers(users);
      console.log('데이터 로드');
    } catch (error) {
      console.error('로드 실패:', error);
    }
  }
}