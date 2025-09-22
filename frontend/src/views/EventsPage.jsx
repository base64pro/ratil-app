import React from 'react';
import ContentDisplayPage from '../components/ContentDisplayPage.jsx';

function EventsPage({ onNavigate }) {
  return (
    <ContentDisplayPage 
      pageTitle="تنظيم المؤتمرات والمناسبات"
      category="events"
      onBack={() => onNavigate('home')}
    />
  );
}

export default EventsPage;
