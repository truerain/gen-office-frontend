import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gen-office/theme';
import App from './app/App';
import '@gen-office/theme/index.css';
import '@gen-office/ui/index.css';
import '@gen-office/gen-grid/index.css';
import '@gen-office/gen-grid-crud/index.css';

import './styles/index.css';
import { AppProviders } from './app/providers/AppProvider';
import { initI18n, i18n } from './i18n';
import { I18nextProvider } from 'react-i18next';

const root = ReactDOM.createRoot(document.getElementById('root')!);

initI18n().finally(() => {
  root.render(
    <React.StrictMode>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider defaultMode="light" useLGFont={true}>
          <AppProviders>
            <App />
          </AppProviders>
        </ThemeProvider>
      </I18nextProvider>
    </React.StrictMode>
  );
});
