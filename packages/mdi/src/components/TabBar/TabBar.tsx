// packages/mdi/src/components/TabBar/TabBar.tsx
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { TabBarProps } from '../../types';
import { useMDIStore } from '../../store/mdiStore';
import { Tab } from '../Tab';
import { cn } from '@gen-office/utils';
import styles from './TabBar.module.css';

export const TabBar = ({ position, className }: TabBarProps) => {
  const tabs = useMDIStore(state => state.tabs);
  const activeTabId = useMDIStore(state => state.activeTabId);
  const setActiveTab = useMDIStore(state => state.setActiveTab);
  const removeTab = useMDIStore(state => state.removeTab);
  const closeOtherTabs = useMDIStore(state => state.closeOtherTabs);
  const closeAllClosableTabs = useMDIStore(state => state.closeAllClosableTabs);

  const [contextMenu, setContextMenu] = useState<{ tabId: string; x: number; y: number } | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ left: number; top: number } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const hasClosableTabs = useMemo(() => tabs.some((tab) => tab.closable !== false), [tabs]);
  const canCloseOthers = useMemo(() => tabs.length > 1, [tabs.length]);
  const contextTab = useMemo(
    () => (contextMenu ? tabs.find((tab) => tab.id === contextMenu.tabId) ?? null : null),
    [contextMenu, tabs]
  );
  const canCloseCurrent = contextTab?.closable !== false;

  useLayoutEffect(() => {
    if (!contextMenu) {
      setContextMenuPosition(null);
      return;
    }
    const menu = contextMenuRef.current;
    if (!menu) {
      setContextMenuPosition({ left: contextMenu.x, top: contextMenu.y });
      return;
    }

    const viewportPadding = 8;
    const rect = menu.getBoundingClientRect();
    const maxLeft = Math.max(viewportPadding, window.innerWidth - rect.width - viewportPadding);
    const maxTop = Math.max(viewportPadding, window.innerHeight - rect.height - viewportPadding);

    const nextLeft = Math.min(Math.max(contextMenu.x, viewportPadding), maxLeft);
    const nextTop = Math.min(Math.max(contextMenu.y, viewportPadding), maxTop);

    setContextMenuPosition((prev) => {
      if (prev && prev.left === nextLeft && prev.top === nextTop) return prev;
      return { left: nextLeft, top: nextTop };
    });
  }, [contextMenu]);

  useEffect(() => {
    if (!contextMenu) return;

    const close = () => setContextMenu(null);
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-mdi-tab-context-menu="true"]')) return;
      close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('mousedown', onMouseDown, true);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('resize', close);
    window.addEventListener('scroll', close, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown, true);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [contextMenu]);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        styles.tabBar,
        styles[position],
        className
      )}
      role="tablist"
      aria-orientation="horizontal"
    >
      <div className={styles.tabListWrap}>
        <div className={styles.tabList}>
          {tabs.map(tab => (
            <Tab
              key={tab.id}
              tab={tab}
              isActive={tab.id === activeTabId}
              onClick={() => setActiveTab(tab.id)}
              onContextMenu={(event) => {
                event.preventDefault();
                setActiveTab(tab.id);
                setContextMenu({ tabId: tab.id, x: event.clientX, y: event.clientY });
              }}
              onClose={() => removeTab(tab.id)}
            />
          ))}
        </div>
      </div>
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{
            left: contextMenuPosition?.left ?? contextMenu.x,
            top: contextMenuPosition?.top ?? contextMenu.y,
          }}
          role="menu"
          data-mdi-tab-context-menu="true"
        >
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={() => {
              if (!contextTab || !canCloseCurrent) return;
              removeTab(contextTab.id);
              setContextMenu(null);
            }}
            disabled={!canCloseCurrent}
          >
            Close
          </button>
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={() => {
              if (!contextTab) return;
              closeOtherTabs(contextTab.id);
              setContextMenu(null);
            }}
            disabled={!canCloseOthers}
          >
            Close Others
          </button>
          <button
            type="button"
            className={styles.contextMenuItem}
            onClick={() => {
              closeAllClosableTabs();
              setContextMenu(null);
            }}
            disabled={!hasClosableTabs}
          >
            Close All
          </button>
        </div>
      )}
    </div>
  );
};
