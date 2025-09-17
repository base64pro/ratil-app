import React from 'react';
import ContentDisplayPage from '../components/ContentDisplayPage';

function PrintedMaterialsPage({ onBack }) {
  return (
    <ContentDisplayPage 
      pageTitle="المواد المطبوعة"
      category="printedMaterials"
      onBack={onBack}
    />
  );
}

export default PrintedMaterialsPage;

