import React from 'react';
import ContentDisplayPage from '../components/ContentDisplayPage';

function PrintedMaterialsPage({ onNavigate }) {
  return (
    <ContentDisplayPage 
      pageTitle="المواد المطبوعة"
      category="printedMaterials"
      onBack={() => onNavigate('home')}
    />
  );
}

export default PrintedMaterialsPage;
