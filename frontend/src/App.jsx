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
  // The logic is now inverted. Instead of checking if a user exists,
  // we allow access to all pages by default and specifically protect
  // the admin and portfolio pages.
  const renderPage = () => {
    // Rule 1: Protect the Admin Dashboard. If the user is not an admin, show the home page.
    if (activePage === 'adminDashboard' && (!user || user.role !== 'admin')) {
      // Redirect to home if a non-admin tries to access the dashboard
      return <HomePage onNavigate={navigateTo} />;
    }
    
    // Rule 2: Protect the Portfolio. If the user is not an admin with portfolio access, show the home page.
    if (activePage === 'portfolio' && (!user || user.role !== 'admin' || !user.can_access_portfolio)) {
       // Redirect to home if not authorized for portfolio
      return <HomePage onNavigate={navigateTo} />;
    }

    // If the rules above pass, render the requested page.
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
      case 'portfolio': // New portfolio page route for authorized admins
        return <PortfolioPage onNavigate={navigateTo} />;
      case 'login': // The login page is now a specific route
        // After successful login, AuthContext will update the user,
        // and the HomePage will re-render with the correct admin buttons.
        return <LoginPage onLoginSuccess={() => navigateTo('home')} />;
      case 'adminDashboard': // Admin dashboard for authorized admins
        return <AdminDashboard onBack={() => navigateTo('home')} />;
      default:
        return <HomePage onNavigate={navigateTo} />;
    }
  };
  // --- END: MODIFICATION ---

  return <>{renderPage()}</>;
}

export default App;

