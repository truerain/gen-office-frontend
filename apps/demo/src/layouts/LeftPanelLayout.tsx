import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, LogOut, Megaphone, Moon, Settings, Sun } from 'lucide-react';

import { useTheme } from '@gen-office/theme';
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
  DropdownMenuTrigger,
} from '@gen-office/ui';

import type { MenuTreeItem } from '@/types/menu.types';
import { getIconComponent } from '@/app/menu/model/iconMapper';
import { useAppStore } from '@/app/store/appStore';
import { noticeApi, useNoticeListQuery } from '@/pages/admin/notice/api/notice';
import type { Notice } from '@/pages/admin/notice/model/types';
import { NoticeDraftPanel, type NoticeDraft } from '@/pages/admin/notice/NoticeDraftPanel';
import { resolveApiErrorMessage } from '@/shared/api/errorMessage';
import { LayoutSettingsDialog } from './LayoutSettingsDialog';

import styles from './LeftPanelLayout.module.css';
import lgLogo from '@/shared/assets/HIC_MIS.png';

interface LeftPanelLayoutProps {
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

export function LeftPanelLayout({
  menuTree,
  onOpenPage,
  onOpenHome,
  onLogout,
  children,
}: LeftPanelLayoutProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [noticeViewerOpen, setNoticeViewerOpen] = useState(false);
  const [noticeViewerDraft, setNoticeViewerDraft] = useState<NoticeDraft | null>(null);
  const [isNoticeDetailLoading, setIsNoticeDetailLoading] = useState(false);
  const [hoverTooltip, setHoverTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const layoutMode = useAppStore((state) => state.layoutMode);
  const setLayoutMode = useAppStore((state) => state.setLayoutMode);
  const addNotification = useAppStore((state) => state.addNotification);
  const { mode, setMode } = useTheme();
  const noticeQueryParams = useMemo(() => ({}), []);
  const { data: noticeList = [], isLoading: isNoticeListLoading } = useNoticeListQuery(noticeQueryParams);

  const handleThemeToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
  };

  const showTooltip = (event: React.MouseEvent<HTMLElement>, text: string) => {
    if (!isCollapsed || !text) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setHoverTooltip({
      text,
      x: rect.right + 8,
      y: rect.top + rect.height / 2,
    });
  };

  const hideTooltip = () => {
    setHoverTooltip(null);
  };

  const handleMenuClick = (item: MenuTreeItem) => {
    const icon = getIconComponent(item.icon, 16);
    onOpenPage(item.menuId, item.label, icon);
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

  const renderMenuItems = (items: MenuTreeItem[], depth = 0) => {
    return items.map((item) => {
      const icon = getIconComponent(item.icon, 16);
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        return (
          <div key={item.menuId} className={styles.navSection}>
            <div
              className={styles.navSectionTitle}
              onMouseEnter={(e) => showTooltip(e, item.label)}
              onMouseLeave={hideTooltip}
            >
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
          onMouseEnter={(e) => showTooltip(e, item.label)}
          onMouseLeave={hideTooltip}
        >
          <span className={styles.navIcon}>{icon}</span>
          <span className={styles.navLabel}>{item.label}</span>
        </button>
      );
    });
  };

  return (
    <div className={styles.leftPanelLayout}>
      <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <button
            type="button"
            className={styles.collapseButton}
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button type="button" className={styles.logoButton} onClick={onOpenHome}>
            <img src={lgLogo} alt="LG Logo" className={styles.sidebarLogo} />
          </button>
        </div>
        <nav className={styles.nav}>{renderMenuItems(menuTree)}</nav>
        <div className={styles.sidebarFooter}>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={styles.settingsButton}
                onMouseEnter={(e) => showTooltip(e, '공지사항')}
                onMouseLeave={hideTooltip}
              >
                <Megaphone size={16} />
                <span className={styles.navLabel}>공지사항</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
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
          <button
            type="button"
            className={styles.settingsButton}
            onClick={() => setSettingsOpen(true)}
            onMouseEnter={(e) => showTooltip(e, 'Settings')}
            onMouseLeave={hideTooltip}
          >
            <Settings size={16} />
            <span className={styles.navLabel}>Settings</span>
          </button>
          <button
            type="button"
            className={styles.settingsButton}
            onClick={handleThemeToggle}
            onMouseEnter={(e) => showTooltip(e, mode === 'light' ? 'Dark Mode' : 'Light Mode')}
            onMouseLeave={hideTooltip}
          >
            {mode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span className={styles.navLabel}>{mode === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button
            type="button"
            className={styles.settingsButton}
            onClick={() => void onLogout?.()}
            onMouseEnter={(e) => showTooltip(e, 'Logout')}
            onMouseLeave={hideTooltip}
          >
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
      {hoverTooltip && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={styles.floatingTooltip}
              style={{ left: hoverTooltip.x, top: hoverTooltip.y }}
            >
              {hoverTooltip.text}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}
