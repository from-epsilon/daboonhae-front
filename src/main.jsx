import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import { CompareProvider } from './store/CompareContext.jsx';
import { ProductsProvider } from './store/ProductsContext.jsx';
import { PurposeProvider } from './store/PurposeContext.jsx';
import { WishlistProvider } from './store/WishlistContext.jsx';
import { AuthProvider } from './store/AuthContext.jsx';
import { initAnalytics } from './lib/analytics.js';
// DS 토큰 먼저 정의되어야 global.css에서 var(--brand-green) 등 참조 가능 (cascade 순서)
import './styles/design-tokens.css';
import './styles/global.css';

initAnalytics();

function AppProviders() {
  return (
    <AuthProvider>
      <ProductsProvider>
        <PurposeProvider>
          <CompareProvider>
            <WishlistProvider>
              <App />
            </WishlistProvider>
          </CompareProvider>
        </PurposeProvider>
      </ProductsProvider>
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    path: '*',
    element: <AppProviders />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>,
);
