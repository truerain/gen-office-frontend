import React from 'react';
import { Tabs, Dropdown } from 'antd';
import { useTabs, Tab } from '../context/TabContext';

const TabManager: React.FC = () => {
  const { tabs, activeKey, setActiveKey, closeTab, closeOtherTabs, closeAllTabs } = useTabs();

  const handleChange = (key: string) => {
    setActiveKey(key);
  };

  const onEdit = (targetKey: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove' && typeof targetKey === 'string') {
      closeTab(targetKey);
    }
  };

  // Custom context menu logic
  const items = tabs.map((tab: Tab) => {
    const menuItems = [
      {
        label: 'Close',
        key: 'close',
        disabled: tab.closable === false,
      },
      {
        label: 'Close Others',
        key: 'closeOthers',
      },
      {
        label: 'Close All',
        key: 'closeAll',
      }
    ];

    const onMenuClick = ({ key: actionKey }: { key: string }) => {
      if (actionKey === 'close') {
        closeTab(tab.key);
      } else if (actionKey === 'closeOthers') {
        closeOtherTabs(tab.key);
      } else if (actionKey === 'closeAll') {
        closeAllTabs();
      }
    };

    const label = (
      <Dropdown menu={{ items: menuItems, onClick: onMenuClick }} trigger={['contextMenu']}>
        <span style={{ display: 'inline-block', width: '100%', height: '100%' }}>
          {tab.label}
        </span>
      </Dropdown>
    );

    return {
      label: label,
      key: tab.key,
      children: <div style={{ height: 'calc(100vh - 110px)', overflow: 'auto', padding: '16px' }}>{tab.content}</div>,
      closable: tab.closable !== false,
    };
  });


  return (
    <div className="mdi-tab-manager">
      <Tabs
        hideAdd
        onChange={handleChange}
        activeKey={activeKey}
        type="editable-card"
        onEdit={onEdit}
        items={items}
        tabBarStyle={{ margin: 0, background: '#f0f2f5' }}
      />
    </div>
  );
};

export default TabManager;

