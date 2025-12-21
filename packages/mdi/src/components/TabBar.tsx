import { useMDIStore } from '../store/useMDIStore';
import { Tab } from '../types';

export const TabBar = () => {
  const { tabs, activeTabId, setActiveTab, removeTab } = useMDIStore();

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center border-b bg-gray-50 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            group relative flex items-center gap-2 px-4 py-2 border-r cursor-pointer
            transition-colors min-w-[120px] max-w-[200px]
            ${
              activeTabId === tab.id
                ? 'bg-white border-b-2 border-b-primary-700'
                : 'hover:bg-gray-100'
            }
          `}
          onClick={() => setActiveTab(tab.id)}
          >
          {/* 아이콘 */}
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}

          {/* 제목 */}
          <span className="flex-1 truncate text-sm">
            {tab.title}
            {tab.modified && <span className="ml-1 text-primary-700">*</span>}
          </span>

          {/* 닫기 버튼 */}
          {tab.closable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeTab(tab.id);
              }}
              className="
                flex-shrink-0 w-4 h-4 rounded opacity-0 group-hover:opacity-100
                hover:bg-gray-200 flex items-center justify-center
                transition-opacity
              "
            >
              <span className="text-xs">✕</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};