import { useState } from 'react';
import type { ReactNode } from 'react';
import type { MenuTreeItem } from '@/types/menu.types';
import { getIconComponent } from '@/app/menu/model/iconMapper';
import lgLogo from '@/shared/assets/HIC_MIS.png';
import { useAppStore } from '@/app/store/appStore';
import { useTheme } from '@gen-office/theme';
import { LayoutSettingsDialog } from './LayoutSettingsDialog';
import { ChevronLeft, ChevronRight, LogOut, Moon, Settings, Sun } from 'lucide-react';
import styles from './Layout.module.css';

interface LeftPanelLayoutProps {
  menuTree: MenuTreeItem[];
  onOpenPage: (menuId: string, title: string, icon: ReactNode) => void;
  onOpenHome?: () => void;
  children: ReactNode;
}

export function LeftPanelLayout({
  menuTree,
  onOpenPage,
  onOpenHome,
  children,
}: LeftPanelLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const layoutMode = useAppStore((state) => state.layoutMode);
  const setLayoutMode = useAppStore((state) => state.setLayoutMode);
  const { mode, setMode } = useTheme();

  const handleThemeToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };
  const handleMenuClick = (item: MenuTreeItem) => {
    const icon = getIconComponent(item.icon, 16);
    onOpenPage(item.menuId, item.label, icon);
  };

  const renderMenuItems = (items: MenuTreeItem[], depth = 0) => {
    return items.map((item) => {
      const icon = getIconComponent(item.icon, 16);
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        return (
          <div key={item.menuId} className={styles.navSection}>
            <div className={styles.navSectionTitle}>
              <span className={styles.navIcon}>{icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </div>
            <div className={`${styles.navItems} ${depth > 0 ? styles.nested : ''}`}>
              {renderMenuItems(item.children ?? [], depth + 1)}
            </div>
          </div>
        );
      }

      return (
        <button
          key={item.menuId}
          type="button"
          className={styles.navItem}
          onClick={() => handleMenuClick(item)}
        >
          <span className={styles.navIcon}>{icon}</span>
          <span className={styles.navLabel}>{item.label}</span>
        </button>
      );
    });
  };

  return (
    <div className={styles.leftPanelLayout}>
      <aside
        className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}
      >
        <div className={styles.sidebarHeader}>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            type="button"
            className={styles.logoButton}
            onClick={onOpenHome}
          >
            <img src={lgLogo} alt="LG Logo" className={styles.sidebarLogo} />
          </button>
        </div>
        <nav className={styles.nav}>{renderMenuItems(menuTree)}</nav>
        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.settingsButton}
            onClick={() => setSettingsOpen(true)}
          >
            <Settings size={16} />
            <span className={styles.navLabel}>Settings</span>
          </button>
          <button
            type="button"
            className={styles.settingsButton}
            onClick={handleThemeToggle}
          >
            {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span className={styles.navLabel}>{mode === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button type="button" className={styles.settingsButton}>
            <LogOut size={16} />
            <span className={styles.navLabel}>Logout</span>
          </button>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>

      <LayoutSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        value={layoutMode}
        onConfirm={setLayoutMode}
      />
    </div>
  );
}
