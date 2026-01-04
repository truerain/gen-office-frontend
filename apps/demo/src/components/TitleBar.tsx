// apps/demo/src/components/TitleBar.tsx
import { useState, useRef } from 'react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@gen-office/primitives';
import { Settings, Moon, Sun, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '@gen-office/theme';
import { menuData } from '../features/system/mocks/menuData';
import { getIconComponent } from '../utils/iconMapper';
import type { MenuItem } from '../types/menu.types';
import lgLogo from '../assets/lg_logo_213x56.avif';
import styles from './TitleBar.module.css';

interface TitleBarProps {
  onOpenPage: (id: string, title: string, icon: React.ReactNode) => void;
  onOpenHome?: () => void;
}

function TitleBar({ onOpenPage, onOpenHome }: TitleBarProps) {
  const { mode, setMode } = useTheme();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);

  const handleThemeToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const handleMenuClick = (item: MenuItem) => {
    const icon = getIconComponent(item.icon, 16);
    onOpenPage(item.id, item.label, icon);
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
      // 메뉴를 닫을 때는 상태만 업데이트
      setOpenMenuId(null);
      setIsAnyMenuOpen(false);
    }
  };

  const handleNavigationMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    // 메뉴가 하나라도 열려있을 때만 실행
    if (!isAnyMenuOpen) return;

    // 마우스 위치에 있는 버튼 찾기
    const target = e.target as HTMLElement;
    const button = target.closest('button[data-menu-id]') as HTMLButtonElement;
    
    if (button) {
      const menuId = button.getAttribute('data-menu-id');
      if (menuId && menuId !== openMenuId) {
        setOpenMenuId(menuId);
      }
    }
    // 버튼이 아닌 곳에서는 아무것도 하지 않음 (메뉴를 닫지 않음)
  };

  return (
    <header className={styles.titleBar}>
      <div className={styles.left}>
        <button className={styles.logo} onClick={handleLogoClick}>
          <img src={lgLogo} alt="LG Logo" className={styles.logoImage} />
        </button>

        {/* Navigation Menu - Data Driven with Hover Support */}
        <nav 
          ref={navigationRef}
          className={styles.navigation}
          onMouseMove={handleNavigationMouseMove}
        >
          {menuData.categories.map((category) => (
            <DropdownMenu 
              key={category.id}
              open={openMenuId === category.id}
              onOpenChange={(open) => handleMenuOpenChange(category.id, open)}
              modal={false}
            >
              <DropdownMenuTrigger asChild>
                <button 
                  className={styles.navButton}
                  data-menu-id={category.id}
                >
                  {getIconComponent(category.icon, 16)}
                  <span>{category.label}</span>
                  <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {category.children?.map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    icon={getIconComponent(item.icon, 16)}
                    onClick={() => handleMenuClick(item)}
                  >
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>
      </div>

      <div className={styles.right}>
        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={styles.userMenuButton}>
              <div className={styles.userAvatar}>
                <Settings size={18} />
              </div>
              <span>Menu</span>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              icon={mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              onClick={handleThemeToggle}
            >
              {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              icon={<Settings size={16} />}
              onClick={() => handleMenuClick({ id: 'settings', label: 'Settings', icon: 'Settings' })}
            >
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              icon={<LogOut size={16} />}
              onClick={() => alert('Logout')}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default TitleBar;