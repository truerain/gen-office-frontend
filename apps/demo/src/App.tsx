import { MDIContainer, useMDIStore } from '@gen-office/mdi';
import { Button } from '@gen-office/ui';
import { UserList } from './components/UserList';
import { ProductList } from './components/ProductList';

function App() {
  const addTab = useMDIStore((state) => state.addTab);

  const handleOpenUsers = () => {
    addTab({
      title: '사용자 관리',
      icon: <span>👥</span>,
      content: <UserList />,
    });
  };

  const handleOpenProducts = () => {
    addTab({
      title: '제품 목록',
      icon: <span>📦</span>,
      content: <ProductList />,
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 툴바 */}
      <div className="h-14 border-b flex items-center gap-2 px-4 bg-white">
        <h1 className="text-xl font-bold text-primary-700">
          Gen-Office MSW Demo
        </h1>
        <div className="flex-1" />
        <Button onClick={handleOpenUsers}>사용자 관리</Button>
        <Button onClick={handleOpenProducts} variant="outline">
          제품 목록
        </Button>
      </div>

      {/* MDI 영역 */}
      <MDIContainer className="flex-1" />
    </div>
  );
}

export default App;