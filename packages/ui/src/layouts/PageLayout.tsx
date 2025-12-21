import { ReactNode } from 'react';

interface PageLayoutProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-7xl',
  xl: 'max-w-screen-2xl',
  full: 'max-w-full',
};

export const PageLayout = ({
  title,
  description,
  actions,
  children,
  maxWidth = 'lg',
}: PageLayoutProps) => {
  return (
    <div className={`mx-auto px-4 py-6 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth]}`}>
      {(title || description || actions) && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              {title && <h1 className="text-3xl font-bold">{title}</h1>}
              {description && <p className="mt-2 text-gray-600">{description}</p>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
          </div>
        </div>
      )}
      
      <div>{children}</div>
    </div>
  );
};