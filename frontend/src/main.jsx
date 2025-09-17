import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // 1. استيراد المزوّد

// استيراد ملف التصميم الرئيسي
import './styles/main.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. تغليف التطبيق بالكامل بالمزوّد */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);