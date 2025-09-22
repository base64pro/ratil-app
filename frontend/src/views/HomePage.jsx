import React from 'react';
import { motion } from 'framer-motion';
import ParticleBackground from '../components/ParticleBackground';
import { useAuth } from '../context/AuthContext'; 

function HomePage({ onNavigate }) {
  const { user, logout, isGuest } = useAuth();
  
  const buttons = [
    { title: 'المواد المطبوعة', key: 'printedMaterials' },
    { title: 'تاجير لافتات طرقية عملاقة', key: 'billboards' },
    { title: 'تنظيم المؤتمرات والمناسبات', key: 'events' },
    { title: 'بيع الاجهزة والمعدات الطباعية', key: 'exhibition' } // MODIFIED TEXT
  ];

  if (user && user.role === 'admin' && user.can_access_portfolio) {
    buttons.push({ title: 'محفظة الروابط والمواد الرقمية', key: 'portfolio' });
  }

  const handleFullScreen = () => {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => console.log(err.message));
    } else {
        document.exitFullscreen();
    }
  };
  
  const isIphone = /iPhone/i.test(navigator.userAgent);

  return (
    <div className="app-container">
      <ParticleBackground />
      
      <header className="app-header">
        <div style={{flex: 1}}></div>
        <div className="user-info">
          مرحباً، {user?.username || 'زائر'}
        </div>
        <div className="header-actions" style={{flex: 1, justifyContent: 'flex-end'}}>
          {!isIphone && (
            <button 
              onClick={handleFullScreen} 
              className="logout-button" 
              style={{ background: 'rgba(80, 150, 255, 0.1)', borderColor: 'rgba(80, 150, 255, 0.3)', color: '#aaccff', order: 1 }}
            >
              ملء الشاشة
            </button>
          )}

          {isGuest ? (
            <button onClick={() => onNavigate('login')} className="logout-button" style={{order: 2}}>
              تسجيل دخول الأدمن
            </button>
          ) : (
            <button onClick={logout} className="logout-button" style={{order: 2}}>
              تسجيل الخروج
            </button>
          )}
        </div>
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

