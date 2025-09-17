import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext'; // --- 1. استيراد useAuth ---
import ParticleBackground from '../components/ParticleBackground';

// لم نعد بحاجة إلى onLoginSuccess كـ prop
function LoginPage() {
  const { login } = useAuth(); // --- 2. استخدام دالة login من السياق مباشرة ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // حالة لإظهار/إخفاء كلمة المرور

  const handleSubmit = async (event) => {
    event.preventDefault(); 
    setIsLoading(true);

    try {
      await login(username, password);
      // عند النجاح, سيقوم السياق بتحديث الحالة وسيقوم App.jsx بإعادة التوجيه تلقائيًا
    } catch (err) {
      // رسالة الخطأ يتم عرضها الآن بواسطة دالة login في السياق
      console.error("Login attempt failed in component");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-page-container {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .login-form-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 450px;
          font-family: 'Ithra Bold', sans-serif !important;
        }

        .login-form {
          padding: 3rem 2.5rem;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(15px) saturate(150%);
          -webkit-backdrop-filter: blur(15px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .login-header {
          text-align: center;
          margin-bottom: 1rem;
        }

        .login-logo {
          max-width: 250px;
          margin: 0 auto 1.5rem auto;
          display: block;
          opacity: 0.9;
        }

        .login-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .login-subtitle {
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 400;
        }

        .input-group {
          position: relative; /* Required for password toggle positioning */
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .login-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .login-input {
          width: 100%;
          padding: 14px 16px;
          font-size: 1rem;
          font-family: 'Ithra Bold', sans-serif !important;
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: #ffffff;
          transition: all 0.3s ease;
        }
        
        .login-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 30px #0a0e1a inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }

        .login-input:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
        }

        .password-toggle-icon {
          position: absolute;
          top: 40px; /* Adjust as needed */
          left: 15px;
          cursor: pointer;
          color: #b8c5d6;
          transition: color 0.3s ease;
        }

        .password-toggle-icon:hover {
          color: #ffffff;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          font-family: 'Ithra Bold', sans-serif !important;
          color: var(--dark-bg);
          background: linear-gradient(90deg, #ffffff, #e0e0e0);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .login-form {
            padding: 2.5rem 2rem;
          }
        }

        @media (max-width: 480px) {
          .login-page-container {
            padding: 1rem;
            align-items: flex-start;
            padding-top: 5vh;
          }

          .login-form {
            padding: 2rem 1.5rem;
            gap: 1.2rem;
          }

          .login-logo {
            max-width: 200px;
          }

          .login-title {
            font-size: 1.5rem;
          }

          .login-subtitle {
            font-size: 0.9rem;
          }

          .login-input, .login-button {
            padding: 12px 14px;
            font-size: 0.95rem;
          }
        }
      `}</style>

      <div className="login-page-container">
        <ParticleBackground />
        
        <motion.div
          className="login-form-wrapper"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-header">
              <img src="/logo.png" alt="شعار مجموعة رتيل" className="login-logo" />
              <h1 className="login-title">تسجيل الدخول</h1>
              <p className="login-subtitle">الرجاء إدخال بيانات الاعتماد الخاصة بك</p>
            </div>
            
            <div className="input-group">
              <label htmlFor="username" className="login-label">اسم المستخدم</label>
              <input 
                type="text" 
                id="username" 
                className="login-input" 
                placeholder="ادخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password" className="login-label">كلمة المرور</label>
              <input 
                type={showPassword ? 'text' : 'password'}
                id="password" 
                className="login-input" 
                placeholder="ادخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></>
                  ) : (
                    <><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></>
                  )}
                </svg>
              </span>
            </div>

            <motion.button 
              type="submit" 
              className="login-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isLoading}
            >
              {isLoading ? 'جارِ التحقق...' : 'دخول'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </>
  );
}

export default LoginPage;