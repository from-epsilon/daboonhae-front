import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { CompareProvider } from './store/CompareContext.jsx';
import { ProductsProvider } from './store/ProductsContext.jsx';
import { PurposeProvider } from './store/PurposeContext.jsx';
// DS 토큰 먼저 정의되어야 global.css에서 var(--brand-green) 등 참조 가능 (cascade 순서)
import './styles/design-tokens.css';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ProductsProvider>
        <PurposeProvider>
          <CompareProvider>
            <App />
          </CompareProvider>
        </PurposeProvider>
      </ProductsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
