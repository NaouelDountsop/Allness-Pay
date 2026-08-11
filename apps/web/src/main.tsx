import { StrictMode } from 'react';
import '@/lib/auth-storage';
import { createRoot } from 'react-dom/client';
import { AppProviders } from '@/app/providers';
import { App } from '@/App';
import '@/styles/index.css';

const container = document.getElementById('root');
if (!container) {
  throw new Error('Element racine introuvable : verifiez `index.html`.');
}

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
);
