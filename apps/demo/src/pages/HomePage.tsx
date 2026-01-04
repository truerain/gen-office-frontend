import { Button } from '@gen-office/primitives';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome to Gen-Office</h1>
        <p className="subtitle">
          A comprehensive React component library and framework for back-office applications
        </p>
      </div>

      <div className="content">
        <section className="section">
          <h2>🎨 Design System</h2>
          <p>
            Gen-Office provides a complete design system with:
          </p>
          <ul>
            <li>11+ Primitive components (Button, Input, Select, Dialog, etc.)</li>
            <li>DataGrid with virtual scrolling and pagination</li>
            <li>LG brand guidelines integration</li>
            <li>Dark/Light theme support</li> 
          </ul>
        </section>

        <section className="section">
          <h2>📦 Packages</h2>
          <div className="grid">
            <div className="card">
              <h3>@gen-office/primitives</h3>
              <p>Core UI components built on Radix UI</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/primitives"> Explore → </Link>
              </Button>
            </div>
            <div className="card">
              <h3>@gen-office/theme</h3>
              <p>Theme system with CSS variables</p>
            </div>
          </div>
        </section>

        <section className="section">
          <h2>🚀 Quick Start</h2>
          <pre className="code-block">
            <code>{`pnpm add @gen-office/primitives
pnpm add @gen-office/datagrid

import { Button, Input } from '@gen-office/primitives';
import { DataGrid } from '@gen-office/datagrid';`}</code>
          </pre>
        </section>
      </div>
    </div>
  );
}

export default HomePage;