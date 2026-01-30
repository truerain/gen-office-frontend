import { Suspense } from 'react';
import { Button } from '@gen-office/ui';
import { useMDIStore } from '@gen-office/mdi';
import { Box, Grid3x3, Layers, Package } from 'lucide-react';
import { getLazyComponent } from '@/app/config/componentRegistry.dynamic';
import styles from './HomePage.module.css';

function HomePage() {
  const addTab = useMDIStore((state) => state.addTab);

  const openTab = (id: string, title: string, content: React.ReactNode, icon: React.ReactNode) => {
    addTab({
      id,
      title,
      content,
      icon,
      closable: true,
    });
  };

  const openLazyTab = (
    id: string,
    title: string,
    componentName: string,
    icon: React.ReactNode
  ) => {
    const LazyComponent = getLazyComponent(componentName);
    if (!LazyComponent) return;

    openTab(
      id,
      title,
      <Suspense
        fallback={
          <div style={{ padding: '1.5rem', textAlign: 'center' }}>
            Loading...
          </div>
        }
      >
        <LazyComponent />
      </Suspense>,
      icon
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1>Welcome to Gen-Office</h1>
        <p className={styles.subtitle}>
          A comprehensive React component library and framework for back-office applications
        </p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2>🎨 Design System</h2>
          <p>
            Gen-Office provides a complete design system with:
          </p>
          <ul>
            <li>12+ Primitive components (Button, Input, Select, Dialog, etc.)</li>
            <li>MDI (Multiple Document Interface) system</li>
            <li>DataGrid with virtual scrolling and pagination</li>
            <li>LG brand guidelines integration</li>
            <li>Dark/Light theme support</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2>📦 Explore Packages</h2>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <Box size={32} />
              </div>
              <h3>Primitives</h3>
              <p>Core UI components built on Radix UI with full accessibility</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => openLazyTab('primitives', 'Primitives', 'PrimitivesPage', <Box size={16} />)}
              >
                Explore →
              </Button>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <Grid3x3 size={32} />
              </div>
              <h3>DataGrid</h3>
              <p>Powerful data grid with sorting, filtering, and pagination</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openLazyTab('datagrid', 'DataGrid', 'DataGridPage', <Grid3x3 size={16} />)}
              >
                Explore →
              </Button>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <Layers size={32} />
              </div>
              <h3>MDI System</h3>
              <p>Tab-based multiple document interface with state preservation</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openLazyTab('mdi-demo', 'MDI Demo', 'MDIPage', <Layers size={16} />)}
              >
                Explore →
              </Button>
            </div>

            <div className={styles.card}>
              <div className={styles.cardIcon}>
                <Package size={32} />
              </div>
              <h3>Theme System</h3>
              <p>Flexible theme system with CSS variables and dark mode</p>
              <Button variant="outline" size="sm" disabled>
                Coming Soon
              </Button>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2>🚀 Quick Start</h2>
          <pre className={styles.codeBlock}>
            <code>{`# Install packages
pnpm add @gen-office/primitives
pnpm add @gen-office/mdi
pnpm add @gen-office/datagrid

# Import and use
import { Button, Input } from '@gen-office/ui';
import { MDIContainer, useMDIStore } from '@gen-office/mdi';
import { DataGrid } from '@gen-office/datagrid';`}</code>
          </pre>
        </section>

        <section className={styles.section}>
          <h2>✨ Features</h2>
          <div className={styles.features}>
            <div className={styles.feature}>
              <h4>🎯 TypeScript First</h4>
              <p>Full TypeScript support with comprehensive type definitions</p>
            </div>
            <div className={styles.feature}>
              <h4>📱 Responsive</h4>
              <p>Mobile-friendly components that work on all screen sizes</p>
            </div>
            <div className={styles.feature}>
              <h4>♿ Accessible</h4>
              <p>WCAG compliant with proper ARIA attributes</p>
            </div>
            <div className={styles.feature}>
              <h4>🎨 Customizable</h4>
              <p>Easy theming with CSS variables and modules</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HomePage;
