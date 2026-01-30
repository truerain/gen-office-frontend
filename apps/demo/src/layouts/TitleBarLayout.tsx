import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@gen-office/ui';
import { useTheme } from '@gen-office/theme';
import { LogOut, Moon, Settings, Sun } from 'lucide-react';
import { useAppStore } from '@/app/store/appStore';
import { getIconComponent } from '@/app/menu/model/iconMapper';
import type { MenuTreeItem } from '@/types/menu.types';
import lgLogo from '@/shared/assets/lg_logo_213x56.avif';
import styles from './Layout.module.css';
import titleBarStyles from './TitleBarLayout.module.css';
import { LayoutSettingsDialog } from './LayoutSettingsDialog';

interface TitleBarLayoutProps {
  menuTree: MenuTreeItem[];
  onOpenPage: (menuId: string, title: string, icon: ReactNode) => void;
  onOpenHome?: () => void;
  children: ReactNode;
}

export function TitleBarLayout({
  menuTree,
  onOpenPage,
  onOpenHome,
  children,
}: TitleBarLayoutProps) {
  const { mode, setMode } = useTheme();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const layoutMode = useAppStore((state) => state.layoutMode);
  const setLayoutMode = useAppStore((state) => state.setLayoutMode);

  const handleThemeToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const handleMenuClick = (item: MenuTreeItem) => {
    const icon = getIconComponent(item.icon, 16);
    onOpenPage(item.menuId, item.label, icon);
    setOpenMenuId(null);
    setIsAnyMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (onOpenHome) {
      onOpenHome();
    }
  };

  const handleMenuOpenChange = (menuId: string, open: boolean) => {
    if (open) {
      setOpenMenuId(menuId);
      setIsAnyMenuOpen(true);
    } else if (openMenuId === menuId) {
      setOpenMenuId(null);
      setIsAnyMenuOpen(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isAnyMenuOpen) return;

    const target = e.target as HTMLElement;
    const isOverMenu = target.closest(`[data-menu-id]`);

    if (isOverMenu) {
      const hoveredMenuId = (isOverMenu as HTMLElement).getAttribute('data-menu-id');
      if (hoveredMenuId && hoveredMenuId !== openMenuId) {
        setOpenMenuId(hoveredMenuId);
      }
    }
  };

  const renderSubMenu = (item: MenuTreeItem): React.ReactNode => {
    const icon = getIconComponent(item.icon, 16);

    if (!item.children || item.children.length === 0) {
      return (
        <DropdownMenuItem
          key={item.menuId}
          onClick={() => handleMenuClick(item)}
        >
          <span className={titleBarStyles.menuItemIcon}>{icon}</span>
          <span>{item.label}</span>
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuSub key={item.menuId}>
        <DropdownMenuSubTrigger>
          <span className={titleBarStyles.menuItemIcon}>{icon}</span>
          <span>{item.label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className={titleBarStyles.dropdownContent}>
          {item.children.map(child => renderSubMenu(child))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  };

  return (
    <div className={styles.titleBarLayout}>
      <header className={titleBarStyles.titleBar}>
        <div className={titleBarStyles.leftSection}>
          <div className={titleBarStyles.logoSection} onClick={handleLogoClick}>
            <img src={lgLogo} alt="LG Logo" className={titleBarStyles.logo} />
          </div>

          <nav className={titleBarStyles.navigation} ref={navigationRef}>
            {menuTree.map((category) => {
              const icon = getIconComponent(category.icon, 18);

              return (
                <DropdownMenu
                  key={category.menuId}
                  modal={false}
                  open={openMenuId === category.menuId}
                  onOpenChange={(open) => handleMenuOpenChange(category.menuId, open)}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={titleBarStyles.navButton}
                      data-menu-id={category.menuId}
                      onMouseMove={(e) => handleMouseMove(e)}
                    >
                      <span className={titleBarStyles.navIcon}>{icon}</span>
                      <span>{category.label}</span>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    className={titleBarStyles.dropdownContent}
                    onMouseMove={(e) => handleMouseMove(e)}
                  >
                    <DropdownMenuLabel>{category.label}</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    {category.children?.map(item => renderSubMenu(item))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </nav>
        </div>

        <div className={titleBarStyles.userSection}>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={titleBarStyles.userButton}>
              <Settings size={18} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={titleBarStyles.dropdownContent}>
              <DropdownMenuLabel>설정</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleThemeToggle}>
                {mode === 'light' ? (
                  <>
                    <Moon size={16} />
                    <span>다크 모드</span>
                  </>
                ) : (
                  <>
                    <Sun size={16} />
                    <span>라이트 모드</span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings size={16} />
                <span>환경설정</span>
              </DropdownMenuItem>

              <DropdownMenuItem>
                <LogOut size={16} />
                <span>로그아웃</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <LayoutSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        value={layoutMode}
        onConfirm={setLayoutMode}
      />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
