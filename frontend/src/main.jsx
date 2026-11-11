import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { Provider } from 'react-redux';
import { store } from './app/store.js';
import { HelmetProvider } from 'react-helmet-async';

import { reportWebVitals } from './utils/reportWebVitals.js';

if (typeof window !== "undefined") {
  window.__IS_DEV__ =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </HelmetProvider>
  </StrictMode>
);

reportWebVitals();