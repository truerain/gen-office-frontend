// apps/demo/src/utils/iconMapper.tsx
import * as LucideIcons from 'lucide-react';

/**
 * 문자열 아이콘 이름을 실제 Lucide Icon 컴포넌트로 변환
 */
export const getIconComponent = (iconName: string, size: number = 16): React.ReactNode => {
  // Lucide Icons에서 해당 아이콘 찾기
  const Icon = (LucideIcons as any)[iconName];
  
  if (!Icon) {
    console.warn(`Icon "${iconName}" not found in lucide-react`);
    return null;
  }
  
  return <Icon size={size} />;
};