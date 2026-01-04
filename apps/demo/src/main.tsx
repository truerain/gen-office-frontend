import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@gen-office/theme';
import App from './App';
import '@gen-office/theme/index.css';
import '@gen-office/primitives/index.css';

import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultMode="light">
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);