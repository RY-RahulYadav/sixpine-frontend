import React from 'react';

const Breadcrumb: React.FC = () => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        <li className="breadcrumb-item"><a href="#">All</a></li>
        <li className="breadcrumb-item"><a href="#">New Arrivals</a></li>
        <li className="breadcrumb-item"><a href="#">Category</a></li>
        <li className="breadcrumb-item active" aria-current="page">Product Name</li>
      </ol>
    </nav>
  );
};

export default Breadcrumb;
