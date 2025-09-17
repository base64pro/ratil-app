import React from 'react';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';

// --- 1. استقبال onLogout و user كـ props ---
function HomePage({ onNavigate, user, onLogout }) {
  
  const buttons = [
    { title: 'المواد المطبوعة', key: 'printedMaterials' },
    { title: 'تاجير لافتات طرقية عملاقة', key: 'billboards' },
    { title: 'تنظيم المؤتمرات والمناسبات', key: 'events' },
    { title: 'معرض بيع الاجهزة والمعدات الطباعية', key: 'exhibition' }
  ];

  return (
    <div className="app-container">
      <ParticleBackground />
      
      {/* --- 2. إضافة الشريط العلوي الجديد --- */}
      <header className="app-header">
        <div className="user-info">
          مرحباً، {user?.username || 'زائر'}
        </div>
        <button onClick={onLogout} className="logout-button">
          تسجيل الخروج
        </button>
      </header>

      <div className="main-content">
        <div className="logo-container">
          <motion.img
            src="/logo.png"
            alt="شعار مجموعة رتيل"
            className="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.95, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        <nav className="navigation-container">
          {buttons.map((button, index) => (
            <motion.button
              key={button.key}
              className="nav-button"
              onClick={() => onNavigate(button.key)}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1, ease: "easeOut" }}
            >
              {button.title}
            </motion.button>
          ))}
          
          {user && user.role === 'admin' && (
            <motion.button
              className="nav-button"
              onClick={() => onNavigate('adminDashboard')}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + buttons.length * 0.1, ease: "easeOut" }}
              style={{ background: 'rgba(0, 86, 179, 0.3)', borderColor: 'rgba(0, 183, 255, 0.4)' }}
            >
              لوحة تحكم الأدمن
            </motion.button>
          )}
        </nav>
      </div>
    </div>
  );
}

export default HomePage;