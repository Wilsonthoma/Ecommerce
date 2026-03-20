// src/components/shop/ShopHeader.jsx
import React from 'react';
import PageHeader from '../layout/PageHeader';

const ShopHeader = ({ totalProducts }) => {
  const shopHeaderImage = "https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1600";

  return (
    <PageHeader 
      title="OUR COLLECTION" 
      subtitle={`${totalProducts} products available`}
      image={shopHeaderImage}
    />
  );
};

export default ShopHeader;