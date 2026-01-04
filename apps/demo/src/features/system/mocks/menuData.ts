// apps/demo/src/mocks/menuData.ts
import type { MenuData } from '../../../types/menu.types';

export const menuData: MenuData = {
  categories: [
    {
      id: 'customer',
      label: '고객관리',
      icon: 'Users',
      children: [
        {
          id: 'customer-info',
          label: '고객정보',
          icon: 'Users',
        },
        {
          id: 'customer-service',
          label: '고객응대',
          icon: 'UserCheck',
        },
        {
          id: 'customer-analysis',
          label: '고객분석',
          icon: 'BarChart3',
        },
      ],
    },
    {
      id: 'finance',
      label: '금융 및 결제',
      icon: 'CreditCard',
      children: [
        {
          id: 'payment-process',
          label: '결제처리',
          icon: 'CreditCard',
        },
        {
          id: 'transfer',
          label: '송금',
          icon: 'Send',
        },
        {
          id: 'subscription',
          label: '구독관리',
          icon: 'RefreshCw',
        },
      ],
    },
    {
      id: 'system',
      label: '시스템관리',
      icon: 'Settings',
      children: [
        {
          id: 'menu-management',
          label: '메뉴관리',
          icon: 'Menu',
        },
        {
          id: 'role-management',
          label: '권한관리',
          icon: 'Shield',
        },
        {
          id: 'role-menu',
          label: '권한별 메뉴관리',
          icon: 'FolderTree',
        },
        {
          id: 'user-management',
          label: '사용자관리',
          icon: 'UserCog',
        },
      ],
    },
    {
      id: 'demo',
      label: 'Demo',
      icon: 'Box',
      children: [
        {
          id: 'primitives',
          label: 'Primitives',
          icon: 'Box',
        },
        {
          id: 'datagrid',
          label: 'DataGrid',
          icon: 'Grid3x3',
        },
        {
          id: 'mdi-demo',
          label: 'MDI Demo',
          icon: 'Layers',
        },
      ],
    },
  ],
};