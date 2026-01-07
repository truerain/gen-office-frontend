import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gen-office/theme';
import App from './App';
import '@gen-office/theme/index.css';
import '@gen-office/ui/index.css';

import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultMode="light" useLGFont={true}>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);