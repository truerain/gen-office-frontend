import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@gen-office/theme';
import App from './App.tsx'

import '@gen-office/theme/index.css';
import '@gen-office/ui/index.css';
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultMode="light" useLGFont={true}>
        <App />
    </ThemeProvider>
   </StrictMode>,
)
