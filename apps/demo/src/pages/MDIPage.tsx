// apps/demo/src/pages/MDIPage.tsx
import { Badge } from '@gen-office/primitives';
import { Layers, Check, Code } from 'lucide-react';
import styles from './MDIPage.module.css';

function MDIPage() {
  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerIcon}>
          <Layers size={40} />
        </div>
        <div>
          <h1>MDI (Multiple Document Interface)</h1>
          <p className={styles.subtitle}>
            Tab-based multi-document interface system with complete state preservation
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {/* Notice */}
        <div className={styles.notice}>
          <div className={styles.noticeIcon}>
            <Check size={20} />
          </div>
          <div>
            <h3>You're Already Using MDI!</h3>
            <p>
              This entire demo application is built with the MDI system. 
              Try opening multiple tabs using the quick action buttons in the header to see it in action!
            </p>
          </div>
        </div>

        {/* Features */}
        <section className={styles.section}>
          <h2>Key Features</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <h3>🔄 State Preservation</h3>
              <p>All tabs remain mounted with display:none, preserving complete component state including form inputs, scroll positions, and component-specific data.</p>
            </div>
            
            <div className={styles.featureCard}>
              <h3>🎯 Zustand Store</h3>
              <p>Centralized state management using Zustand for efficient tab lifecycle management and state updates.</p>
            </div>
            
            <div className={styles.featureCard}>
              <h3>🎨 Customizable UI</h3>
              <p>Flexible tab positioning (top/bottom), configurable maximum tabs, custom icons, and full CSS customization.</p>
            </div>
            
            <div className={styles.featureCard}>
              <h3>♿ Accessible</h3>
              <p>Built with ARIA attributes for keyboard navigation and screen reader support.</p>
            </div>
          </div>
        </section>

        {/* Usage */}
        <section className={styles.section}>
          <h2>Basic Usage</h2>
          <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
              <Code size={16} />
              <span>App.tsx</span>
            </div>
            <pre><code>{`import { MDIContainer, useMDIStore } from '@gen-office/mdi';
import '@gen-office/mdi/index.css';

function App() {
  const addTab = useMDIStore((state) => state.addTab);
  
  const handleOpenTab = () => {
    addTab({
      id: 'user-123',
      title: 'User Details',
      content: <UserDetailPage userId="123" />,
      icon: <User size={16} />,
      closable: true,
    });
  };
  
  return (
    <div>
      <button onClick={handleOpenTab}>Open Tab</button>
      <MDIContainer 
        tabPosition="top"
        maxTabs={10}
      />
    </div>
  );
}`}</code></pre>
          </div>
        </section>

        {/* API Reference */}
        <section className={styles.section}>
          <h2>API Reference</h2>
          
          <div className={styles.apiSection}>
            <h3>MDIContainer Props</h3>
            <table className={styles.apiTable}>
              <thead>
                <tr>
                  <th>Prop</th>
                  <th>Type</th>
                  <th>Default</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>tabPosition</code></td>
                  <td><Badge variant="secondary">top | bottom</Badge></td>
                  <td><code>"top"</code></td>
                  <td>Position of the tab bar</td>
                </tr>
                <tr>
                  <td><code>maxTabs</code></td>
                  <td><Badge variant="secondary">number</Badge></td>
                  <td><code>undefined</code></td>
                  <td>Maximum number of tabs allowed</td>
                </tr>
                <tr>
                  <td><code>emptyContent</code></td>
                  <td><Badge variant="secondary">ReactNode</Badge></td>
                  <td><code>undefined</code></td>
                  <td>Content to show when no tabs are open</td>
                </tr>
                <tr>
                  <td><code>className</code></td>
                  <td><Badge variant="secondary">string</Badge></td>
                  <td><code>undefined</code></td>
                  <td>Additional CSS class name</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.apiSection}>
            <h3>useMDIStore Hook</h3>
            <table className={styles.apiTable}>
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Parameters</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>addTab</code></td>
                  <td><code>(tab: TabConfig)</code></td>
                  <td>Add a new tab or switch to existing tab with same id</td>
                </tr>
                <tr>
                  <td><code>removeTab</code></td>
                  <td><code>(id: string)</code></td>
                  <td>Remove a tab by id</td>
                </tr>
                <tr>
                  <td><code>setActiveTab</code></td>
                  <td><code>(id: string)</code></td>
                  <td>Switch to a different tab</td>
                </tr>
                <tr>
                  <td><code>updateTab</code></td>
                  <td><code>(id: string, updates: Partial&lt;TabConfig&gt;)</code></td>
                  <td>Update tab properties</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.apiSection}>
            <h3>TabConfig Interface</h3>
            <div className={styles.codeBlock}>
              <pre><code>{`interface TabConfig {
  id: string;              // Unique identifier
  title: string;           // Tab title
  content: React.ReactNode; // Tab content
  icon?: React.ReactNode;  // Optional icon
  closable?: boolean;      // Can the tab be closed? (default: true)
}`}</code></pre>
            </div>
          </div>
        </section>

        {/* Advanced Usage */}
        <section className={styles.section}>
          <h2>Advanced Examples</h2>
          
          <div className={styles.exampleSection}>
            <h3>Dynamic Tab Content</h3>
            <div className={styles.codeBlock}>
              <pre><code>{`const openUserTab = (userId: string) => {
  addTab({
    id: \`user-\${userId}\`,
    title: \`User #\${userId}\`,
    content: <UserDetail userId={userId} />,
    icon: <User size={16} />,
  });
};

// Multiple users can be opened in separate tabs
openUserTab('123');
openUserTab('456');
openUserTab('789');`}</code></pre>
            </div>
          </div>

          <div className={styles.exampleSection}>
            <h3>Unclosable Home Tab</h3>
            <div className={styles.codeBlock}>
              <pre><code>{`useEffect(() => {
  addTab({
    id: 'home',
    title: 'Home',
    content: <HomePage />,
    icon: <Home size={16} />,
    closable: false, // User cannot close this tab
  });
}, []);`}</code></pre>
            </div>
          </div>

          <div className={styles.exampleSection}>
            <h3>Max Tabs Limit</h3>
            <div className={styles.codeBlock}>
              <pre><code>{`const tabs = useMDIStore((state) => state.tabs);
const maxTabs = 5;

const handleOpenTab = () => {
  if (tabs.length >= maxTabs) {
    alert('Maximum tabs reached!');
    return;
  }
  
  addTab({
    id: generateId(),
    title: 'New Tab',
    content: <div>Content</div>,
  });
};`}</code></pre>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className={styles.section}>
          <h2>Best Practices</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tip}>
              <h4>✅ Use Unique IDs</h4>
              <p>Always use unique IDs for tabs. Opening a tab with an existing ID will switch to that tab instead of creating a duplicate.</p>
            </div>
            
            <div className={styles.tip}>
              <h4>✅ State Preservation</h4>
              <p>All tabs remain mounted, so component state, form inputs, and scroll positions are automatically preserved.</p>
            </div>
            
            <div className={styles.tip}>
              <h4>✅ Lazy Loading</h4>
              <p>For better performance with many tabs, consider lazy loading tab content using React.lazy() and Suspense.</p>
            </div>
            
            <div className={styles.tip}>
              <h4>⚠️ Avoid Nested MDI</h4>
              <p>Don't nest MDIContainer inside another MDIContainer. Use a single container at the application level.</p>
            </div>
          </div>
        </section>

        {/* Try It */}
        <section className={styles.callToAction}>
          <h2>Try It Yourself!</h2>
          <p>
            This demo app is a perfect example of MDI in action. 
            Use the quick action buttons in the header to open Primitives, DataGrid, or Settings tabs.
            Notice how each tab preserves its state when you switch between them.
          </p>
        </section>
      </div>
    </div>
  );
}

export default MDIPage;