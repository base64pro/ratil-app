import React from 'react';
import ContentDisplayPage from '../components/ContentDisplayPage';

function BillboardsPage({ onNavigate }) {
  return (
    <ContentDisplayPage 
      pageTitle="تاجير لافتات طرقية عملاقة"
      category="billboards"
      onBack={() => onNavigate('home')}
    />
  );
}

export default BillboardsPage;
