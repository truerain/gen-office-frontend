import React from 'react'
import ReactDOM from 'react-dom/client';
import './index.css'
import App from './App.tsx'

// MSW 개발 환경에서만 활성화
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');

  return worker.start({
    onUnhandledRequest: 'bypass', // 처리되지 않은 요청은 그냥 통과
  });
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
