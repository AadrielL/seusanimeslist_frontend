// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // <--- Digite isso COMPLETAMENTE na linha 4ex.css'; // Remova ou comente esta linha

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* Renderiza seu componente App */}
  </React.StrictMode>,
);