import { useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { LogOut, Megaphone, Moon, Settings, Sun } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useAppStore } from '@/app/store/appStore';
import { getIconComponent } from '@/app/menu/model/iconMapper';
import { noticeApi, useNoticeListQuery } from '@/pages/admin/notice/api/notice';
import type { Notice } from '@/pages/admin/notice/model/types';
import { NoticeDraftPanel, type NoticeDraft } from '@/pages/admin/notice/NoticeDraftPanel';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';
import type { MenuTreeItem } from '@/types/menu.types';
import { LayoutSettingsDialog } from './LayoutSettingsDialog';

import styles from './TitleBarLayout.module.css';
import lgLogo from '@/shared/assets/HIC_MIS.png';

interface TitleBarLayoutProps {
  menuTree: MenuTreeItem[];
  onOpenPage: (menuId: string, title: string, icon: ReactNode) => void;
  onOpenHome?: () => void;
  onLogout?: () => void | Promise<void>;
  children: ReactNode;
}

function toNoticeDraft(notice: Notice): NoticeDraft {
  return {
    noticeId: notice.noticeId,
    title: String(notice.title ?? ''),
    content: String(notice.content ?? ''),
    dispStartDate: String(notice.dispStartDate ?? ''),
    dispEndDate: String(notice.dispEndDate ?? ''),
    popupYn: String(notice.popupYn ?? 'N'),
    useYn: String(notice.useYn ?? 'Y'),
    fileSetId: String(notice.fileSetId ?? ''),
    readCount: Number(notice.readCount ?? 0),
  };
}

export function TitleBarLayout({
  menuTree,
  onOpenPage,
  onOpenHome,
  onLogout,
  children,
}: TitleBarLayoutProps) {
  const { mode, setMode } = useTheme();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [noticeViewerOpen, setNoticeViewerOpen] = useState(false);
  const [noticeViewerDraft, setNoticeViewerDraft] = useState<NoticeDraft | null>(null);
  const [isNoticeDetailLoading, setIsNoticeDetailLoading] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const layoutMode = useAppStore((state) => state.layoutMode);
  const setLayoutMode = useAppStore((state) => state.setLayoutMode);
  const addNotification = useAppStore((state) => state.addNotification);

  const noticeQueryParams = useMemo(() => ({}), []);
  const { data: noticeList = [], isLoading: isNoticeListLoading } = useNoticeListQuery(noticeQueryParams);

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

  const handleNoticeClick = async (noticeId: number) => {
    try {
      setIsNoticeDetailLoading(true);
      setNoticeViewerOpen(true);
      const detail = await noticeApi.get(noticeId);
      setNoticeViewerDraft(toNoticeDraft(detail));
    } catch (error) {
      const message = resolveApiErrorMessage(error, {
        defaultMessage: '공지사항 상세 정보를 불러오지 못했습니다.',
      });
      addNotification(message, 'error');
      setNoticeViewerOpen(false);
    } finally {
      setIsNoticeDetailLoading(false);
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
          <span className={styles.menuItemIcon}>{icon}</span>
          <span>{item.label}</span>
        </DropdownMenuItem>
      );
    }

    return (
      <DropdownMenuSub key={item.menuId}>
        <DropdownMenuSubTrigger>
          <span className={styles.menuItemIcon}>{icon}</span>
          <span>{item.label}</span>
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className={styles.dropdownContent}>
          {item.children.map(child => renderSubMenu(child))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  };

  return (
    <div className={styles.titleBarLayout}>
      <header className={styles.titleBar}>
        <div className={styles.leftSection}>
          <div className={styles.logoSection} onClick={handleLogoClick}>
            <img src={lgLogo} alt="LG Logo" className={styles.logo} />
          </div>

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
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className={styles.navButton}
                      data-menu-id={category.menuId}
                      onMouseMove={(e) => handleMouseMove(e)}
                    >
                      <span className={styles.navIcon}>{icon}</span>
                      <span>{category.label}</span>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    className={styles.dropdownContent}
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
          <span className={styles.noticeSeparator} aria-hidden="true" />

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button type="button" className={styles.navButton}>
                <span className={styles.navIcon}>
                  <Megaphone size={18} />
                </span>
                <span>공지사항</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={styles.dropdownContent}>
              <DropdownMenuLabel>공지사항</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isNoticeListLoading ? (
                <DropdownMenuItem disabled>
                  <span>불러오는 중...</span>
                </DropdownMenuItem>
              ) : noticeList.length === 0 ? (
                <DropdownMenuItem disabled>
                  <span>공지사항이 없습니다.</span>
                </DropdownMenuItem>
              ) : (
                noticeList.map((notice) => (
                  <DropdownMenuItem
                    key={notice.noticeId}
                    onClick={() => {
                      void handleNoticeClick(notice.noticeId);
                    }}
                  >
                    <span>{notice.title}</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className={styles.userSection}>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger className={styles.userButton}>
              <Settings size={18} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={styles.dropdownContent}>
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

              <DropdownMenuItem onClick={() => void onLogout?.()}>
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
      <Dialog open={noticeViewerOpen} onOpenChange={setNoticeViewerOpen}>
        <DialogContent style={{ width: 'min(1100px, 92vw)', maxWidth: '1100px', height: 'min(88vh, 900px)', display: 'flex', flexDirection: 'column' }}>
          <DialogHeader>
            <DialogTitle>공지사항</DialogTitle>
          </DialogHeader>
          <div style={{ flex: 1, minHeight: 0, display: 'flex' }}>
            {noticeViewerDraft ? (
              <NoticeDraftPanel
                draft={noticeViewerDraft}
                isDetailLoading={isNoticeDetailLoading}
                isSaving={false}
                uploadRequestId={0}
                readOnly
              />
            ) : (
              <div style={{ padding: 12 }}>불러오는 중...</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
