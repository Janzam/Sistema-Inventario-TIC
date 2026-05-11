import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; 
import './index.css';
import { StockProvider } from './context/StockContext';
import { ToastProvider } from './components/Toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <StockProvider>
        <App />
      </StockProvider>
    </ToastProvider>
  </React.StrictMode>
);
