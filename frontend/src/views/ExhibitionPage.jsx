import React from 'react';
import ContentDisplayPage from '../components/ContentDisplayPage';

function ExhibitionPage({ onNavigate }) {
  return (
    <ContentDisplayPage 
      pageTitle="بيع الاجهزة والمعدات الطباعية" // MODIFIED TEXT
      category="exhibition"
      onBack={() => onNavigate('home')}
    />
  );
}

export default ExhibitionPage;

