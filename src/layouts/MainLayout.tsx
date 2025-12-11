import React from 'react';
import { Layout, Menu, theme } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  FileOutlined,
} from '@ant-design/icons';
import TabManager from '../components/TabManager';
import { useTabs, Tab } from '../context/TabContext';
// Pages are imported to be used as content
import Dashboard from '../pages/Dashboard';
import UserList from '../pages/userlist';
import Settings from '../pages/Settings';

const { Header, Content } = Layout;

const MainLayout: React.FC = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const { openTab } = useTabs();

  // Helper to create menu items
  const createMenuItem = (key: string, label: string, icon?: React.ReactNode, content?: React.ReactNode, children?: any[]) => {
    return {
      key,
      icon,
      label,
      children,
      onClick: content ? () => openTab({ key, label, content, closable: key !== 'dashboard' } as Tab) : undefined
    };
  };

  const menuItems = [
    createMenuItem('dashboard', 'Dashboard', <DashboardOutlined />, <Dashboard />),
    createMenuItem('users', 'Users', <UserOutlined />, <UserList />),
    createMenuItem('settings', 'Settings', <SettingOutlined />, <Settings />),
    {
      key: 'reports',
      icon: <FileOutlined />,
      label: 'Reports',
      children: [
        createMenuItem('sales-report', 'Sales Report', null, <div>Sales Report Data</div>),
        createMenuItem('audit-log', 'Audit Log', null, <div>Audit Logs</div>)
      ]
    },
  ];

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#001529', padding: '0 20px' }}>
        <div className="demo-logo" style={{ color: 'white', marginRight: '50px', fontSize: '18px', fontWeight: 'bold' }}>
          GenOffice
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content
        style={{
          padding: '0 24px',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden', // TabManager handles inner scroll
          background: colorBgContainer
        }}
      >
        <TabManager />
      </Content>
    </Layout>
  );
};

export default MainLayout;
