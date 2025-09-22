import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';

// --- Import Pages ---
import HomePage from './views/HomePage.jsx';
import LoginPage from './views/LoginPage.jsx';
import PrintedMaterialsPage from './views/PrintedMaterialsPage.jsx';
import BillboardsPage from './views/BillboardsPage.jsx';
import EventsPage from './views/EventsPage.jsx';
import ExhibitionPage from './views/ExhibitionPage.jsx';
import AdminDashboard from './views/AdminDashboard.jsx';
import PortfolioPage from './views/PortfolioPage.jsx'; // Import the new portfolio page

function App() {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');

  const navigateTo = (page) => {
    setActivePage(page);
  };

  // --- START: MODIFICATION ---
  // The login page is now a route, not the default for non-users.
  // We check roles to protect the admin dashboard.
  const renderPage = () => {
    // Protect admin-only pages
    if (activePage === 'adminDashboard' && user.role !== 'admin') {
      return <HomePage onNavigate={navigateTo} />;
    }
     // Protect portfolio page based on user permission
    if (activePage === 'portfolio' && (user.role !== 'admin' || !user.can_access_portfolio)) {
      return <HomePage onNavigate={navigateTo} />;
    }

    switch (activePage) {
      case 'home':
        return <HomePage onNavigate={navigateTo} />;
      case 'printedMaterials':
        return <PrintedMaterialsPage onNavigate={navigateTo} />;
      case 'billboards':
        return <BillboardsPage onNavigate={navigateTo} />;
      case 'events':
        return <EventsPage onNavigate={navigateTo} />;
      case 'exhibition':
        return <ExhibitionPage onNavigate={navigateTo} />;
      case 'portfolio': // New portfolio page route
        return <PortfolioPage onNavigate={navigateTo} />;
      case 'login': // New login page route
        return <LoginPage onLoginSuccess={() => navigateTo('home')} />;
      case 'adminDashboard':
        return <AdminDashboard onBack={() => navigateTo('home')} />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };
  // --- END: MODIFICATION ---

  return <>{renderPage()}</>;
}

export default App;
