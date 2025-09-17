import React from 'react';
import ContentDisplayPage from '../components/ContentDisplayPage';

function ExhibitionPage({ onBack }) {
  return (
    <ContentDisplayPage 
      pageTitle="معرض بيع الاجهزة والمعدات الطباعية"
      category="exhibition"
      onBack={onBack}
    />
  );
}

export default ExhibitionPage;

