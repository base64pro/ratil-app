import React from 'react';
import ContentDisplayPage from '../components/ContentDisplayPage.jsx';

function EventsPage({ onBack }) {
  return (
    <ContentDisplayPage 
      pageTitle="تنظيم المؤتمرات والمناسبات"
      category="events"
      onBack={onBack}
    />
  );
}

export default EventsPage;

