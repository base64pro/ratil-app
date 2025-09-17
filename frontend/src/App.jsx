import React, { useState } from 'react';
import { useAuth } from './context/AuthContext'; // <-- 1. استيراد useAuth

// --- استيراد صفحات العرض ---
import HomePage from './views/HomePage.jsx';
import LoginPage from './views/LoginPage.jsx';
import PrintedMaterialsPage from './views/PrintedMaterialsPage.jsx';
import BillboardsPage from './views/BillboardsPage.jsx';
import EventsPage from './views/EventsPage.jsx';
import ExhibitionPage from './views/ExhibitionPage.jsx';
import AdminDashboard from './views/AdminDashboard.jsx';

function App() {
  // --- 2. استخدام السياق بدلاً من الحالة المحلية للمصادقة ---
  const { user, logout } = useAuth(); 

  // --- ستبقى هذه الحالة المحلية لإدارة التنقل بين الصفحات ---
  const [activePage, setActivePage] = useState('home');

  // --- دالة الخروج الكاملة الآن ---
  const handleLogout = () => {
    logout(); // استدعاء دالة الخروج من السياق
    setActivePage('home'); // إعادة تعيين الصفحة إلى الرئيسية بعد الخروج
  };
  
  const navigateTo = (page) => {
    setActivePage(page);
  };
  
  // --- 3. التحقق من وجود المستخدم من السياق مباشرة ---
  if (!user) {
    // إذا لم يكن هناك مستخدم، نعرض صفحة تسجيل الدخول دائمًا
    // لم نعد بحاجة لتمرير onLoginSuccess لأن LoginPage سيستخدم السياق مباشرةً
    return <LoginPage />;
  }

  // إذا كان هناك مستخدم، نعرض الصفحات بناءً على activePage
  const renderPage = () => {
    switch (activePage) {
      case 'home':
        // تمرير دالة الخروج إلى الصفحة الرئيسية لإضافتها لاحقًا
        return <HomePage onNavigate={navigateTo} user={user} onLogout={handleLogout} />;
      case 'printedMaterials':
        return <PrintedMaterialsPage onBack={() => navigateTo('home')} />;
      case 'billboards':
        return <BillboardsPage onBack={() => navigateTo('home')} />;
      case 'events':
        return <EventsPage onBack={() => navigateTo('home')} />;
      case 'exhibition':
        return <ExhibitionPage onBack={() => navigateTo('home')} />;
      case 'adminDashboard':
        // تمرير دالة الخروج أيضًا إلى لوحة التحكم
        return <AdminDashboard onBack={() => navigateTo('home')} onLogout={handleLogout} />;
      default:
        // الصفحة الافتراضية للمستخدم المسجل هي 'home'
        return <HomePage onNavigate={navigateTo} user={user} onLogout={handleLogout} />;
    }
  };

  return (
    <>
      {renderPage()}
    </>
  );
}

export default App;