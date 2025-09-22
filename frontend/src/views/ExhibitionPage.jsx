import React from 'react';
import ContentDisplayPage from '../components/ContentDisplayPage';

function ExhibitionPage({ onNavigate }) {
  return (
    <ContentDisplayPage 
      pageTitle="معرض بيع الاجهزة والمعدات الطباعية"
      category="exhibition"
      onBack={() => onNavigate('home')}
    />
  );
}

export default ExhibitionPage;
