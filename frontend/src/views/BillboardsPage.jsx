import React from 'react';
import ContentDisplayPage from '../components/ContentDisplayPage';

function BillboardsPage({ onBack }) {
  return (
    <ContentDisplayPage 
      pageTitle="تاجير لافتات طرقية عملاقة"
      category="billboards"
      onBack={onBack}
    />
  );
}

export default BillboardsPage;

