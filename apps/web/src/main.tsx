import { StrictMode } from 'react';
import '@/lib/auth-storage';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/app/providers';
import { ErrorBoundary } from '@/components/common/error-boundary';
import { App } from '@/App';
import '@/styles/index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Element racine introuvable : verifiez `index.html`.');
}

createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <AppProviders>
        <App />
      </AppProviders>
    </ErrorBoundary>
  </StrictMode>,
);
