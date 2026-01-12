import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gen-office/theme';
import App from './app/App';
import '@gen-office/theme/index.css';
import '@gen-office/ui/index.css';

import './styles/index.css';
import { AppProviders } from './app/providers/AppProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultMode="light" useLGFont={true}>
      <AppProviders>
        <App />
      </AppProviders>
    </ThemeProvider>
  </React.StrictMode>,
);