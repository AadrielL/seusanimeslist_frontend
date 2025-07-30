// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // IMPORTANTE: Importa BrowserRouter aqui
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* IMPORTANTE: Envolve o App com BrowserRouter para que os hooks de roteamento funcionem */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);