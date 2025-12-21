import { useMDIStore } from '../store/useMDIStore';

export const TabContent = () => {
  const { tabs, activeTabId } = useMDIStore();

  const activeTab = tabs.find((tab) => tab.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        탭을 열어주세요
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      {activeTab.content}
    </div>
  );
};