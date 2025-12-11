
import MainLayout from './layouts/MainLayout';
import { TabProvider } from './context/TabContext';
import { ConfigProvider } from 'antd';
import koKR from 'antd/locale/ko_KR';
import 'antd/dist/reset.css'; // or import './index.css' if reset is included there? Vite usually handles CSS.

function App() {
  return (
    <ConfigProvider locale={koKR}>
      <TabProvider>
        <MainLayout />
      </TabProvider>
    </ConfigProvider>
  );
}

export default App;

