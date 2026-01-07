// apps/demo/src/components/TitleBar.tsx
import { useState, useRef } from 'react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@gen-office/ui';
import { Settings, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '@gen-office/theme';
import { menuTree } from '@/features/system/mocks/menuData';
import { getIconComponent } from '@/utils/iconMapper';
import type { MenuTreeItem } from '@/types/menu.types';
import lgLogo from '@/assets/lg_logo_213x56.avif';
import styles from './TitleBar.module.css';

interface TitleBarProps {
  onOpenPage: (menuId: string, title: string, icon: React.ReactNode) => void;
  onOpenHome?: () => void;
}

export function TitleBar({ onOpenPage, onOpenHome }: TitleBarProps) {
  const { mode, setMode } = useTheme();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);

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
    } else {
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

  // 재귀적으로 서브메뉴 렌더링
  const renderSubMenu = (item: MenuTreeItem): React.ReactNode => {
    const icon = getIconComponent(item.icon, 16);
    
    // 하위 메뉴가 없으면 일반 메뉴 아이템
    if (!item.children || item.children.length === 0) {
      return (
        <DropdownMenuItem
          key={item.menuId}
          onClick={() => handleMenuClick(item)}
        >
          <span className={styles.menuItemIcon}>{icon}</span>
          <span>{item.label}</span>
        </DropdownMenuItem>
      );
    }

    // 하위 메뉴가 있으면 Sub 메뉴
    return (
      <DropdownMenuSub key={item.menuId}>
        <DropdownMenuSubTrigger>
          <span className={styles.menuItemIcon}>{icon}</span>
          <span>{item.label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {item.children.map(child => renderSubMenu(child))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  };

  return (
    <header className={styles.titleBar}>
      {/* Left Section: Logo + Navigation */}
      <div className={styles.leftSection}>
        {/* Logo */}
        <div className={styles.logoSection} onClick={handleLogoClick}>
          <img src={lgLogo} alt="LG Logo" className={styles.logo} />
        </div>

        {/* Navigation */}
        <nav className={styles.navigation} ref={navigationRef}>
          {menuTree.map((category) => {
            const icon = getIconComponent(category.icon, 18);
            
            return (
              <DropdownMenu
                key={category.menuId}
                modal={false}
                open={openMenuId === category.menuId}
                onOpenChange={(open) => handleMenuOpenChange(category.menuId, open)}
              >
                <DropdownMenuTrigger
                  className={styles.navButton}
                  data-menu-id={category.menuId}
                  onMouseMove={(e) => handleMouseMove(e)}
                >
                  <span className={styles.navIcon}>{icon}</span>
                  <span>{category.label}</span>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent
                  align="start"
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

      {/* User Menu */}
      <div className={styles.userSection}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className={styles.userButton}>
            <Settings size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
            
            <DropdownMenuItem>
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
  );
}

