import React, { useState } from 'react';

interface ProductFiltersProps {
  selectedFilters: {
    brands: string[];
    priceRange: number[];
    storage: string[];
    rating: number | null;
    deliveryDay: string[];
  };
  onFilterChange: (filterType: string, value: any) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ selectedFilters, onFilterChange }) => {
  const [showMoreBrands, setShowMoreBrands] = useState(false);

  const brands = [
    'Redmi',
    'Samsung',
    'OnePlus',
    'realme',
    'Motorola',
    'Lava',
    'Itel',
    'Xiaomi',
    'Vivo',
    'Oppo',
  ];

  const storageOptions = ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'];

  const handleBrandChange = (brand: string) => {
    const updatedBrands = selectedFilters.brands.includes(brand)
      ? selectedFilters.brands.filter((b) => b !== brand)
      : [...selectedFilters.brands, brand];
    onFilterChange('brands', updatedBrands);
  };

  const handleStorageChange = (storage: string) => {
    const updatedStorage = selectedFilters.storage.includes(storage)
      ? selectedFilters.storage.filter((s) => s !== storage)
      : [...selectedFilters.storage, storage];
    onFilterChange('storage', updatedStorage);
  };

  const handleDeliveryChange = (delivery: string) => {
    const updatedDelivery = selectedFilters.deliveryDay.includes(delivery)
      ? selectedFilters.deliveryDay.filter((d) => d !== delivery)
      : [...selectedFilters.deliveryDay, delivery];
    onFilterChange('deliveryDay', updatedDelivery);
  };

  return (
    <div className="filters-container">
      <h5 className="filters-title">Filters</h5>

      {/* Deals & Discounts */}
      <div className="filter-section">
        <h6 className="filter-heading">Deals & Discounts</h6>
        <div className="filter-option">
          <label className="filter-label">Great Indian Festival</label>
        </div>
      </div>

      {/* Delivery Day */}
      <div className="filter-section">
        <h6 className="filter-heading">Delivery Day</h6>
        <div className="filter-option">
          <input
            type="checkbox"
            id="tomorrow"
            checked={selectedFilters.deliveryDay.includes('tomorrow')}
            onChange={() => handleDeliveryChange('tomorrow')}
          />
          <label htmlFor="tomorrow" className="filter-label">
            Get It by Tomorrow
          </label>
        </div>
        <div className="filter-option">
          <input
            type="checkbox"
            id="2days"
            checked={selectedFilters.deliveryDay.includes('2days')}
            onChange={() => handleDeliveryChange('2days')}
          />
          <label htmlFor="2days" className="filter-label">
            Get It in 2 Days
          </label>
        </div>
      </div>

      {/* Brands */}
      <div className="filter-section">
        <h6 className="filter-heading">Brands</h6>
        {brands.slice(0, showMoreBrands ? brands.length : 6).map((brand) => (
          <div className="filter-option" key={brand}>
            <input
              type="checkbox"
              id={brand}
              checked={selectedFilters.brands.includes(brand)}
              onChange={() => handleBrandChange(brand)}
            />
            <label htmlFor={brand} className="filter-label">
              {brand}
            </label>
          </div>
        ))}
        {brands.length > 6 && (
          <button
            className="see-more-btn"
            onClick={() => setShowMoreBrands(!showMoreBrands)}
          >
            <i className={`bi bi-chevron-${showMoreBrands ? 'up' : 'down'}`}></i>{' '}
            {showMoreBrands ? 'See less' : 'See more'}
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="filter-section">
        <h6 className="filter-heading">Price</h6>
        <div className="price-range">
          <div className="d-flex justify-content-between mb-2">
            <span className="price-label">₹{selectedFilters.priceRange[0]}</span>
            <span className="price-label">₹{selectedFilters.priceRange[1]}+</span>
          </div>
          <input
            type="range"
            className="form-range"
            min="135"
            max="25000"
            value={selectedFilters.priceRange[1]}
            onChange={(e) =>
              onFilterChange('priceRange', [135, parseInt(e.target.value)])
            }
          />
          <button className="btn btn-sm btn-outline-secondary w-100 mt-2">Go</button>
        </div>
        <div className="price-options mt-2">
          <div className="filter-option">
            <label className="filter-label">Up to ₹16,000</label>
          </div>
          <div className="filter-option">
            <label className="filter-label">₹16,000 - ₹25,000</label>
          </div>
          <div className="filter-option">
            <label className="filter-label">Over ₹25,000</label>
          </div>
        </div>
      </div>

      {/* Storage Capacity */}
      <div className="filter-section">
        <h6 className="filter-heading">Storage Capacity</h6>
        {storageOptions.map((storage) => (
          <div className="filter-option" key={storage}>
            <input
              type="checkbox"
              id={storage}
              checked={selectedFilters.storage.includes(storage)}
              onChange={() => handleStorageChange(storage)}
            />
            <label htmlFor={storage} className="filter-label">
              {storage}
            </label>
          </div>
        ))}
      </div>

      {/* Customer Rating */}
      <div className="filter-section">
        <h6 className="filter-heading">Customer Rating</h6>
        {[4, 3, 2, 1].map((rating) => (
          <div className="filter-option" key={rating}>
            <label className="filter-label">
              {'★'.repeat(rating)}
              {'☆'.repeat(5 - rating)} & Up
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductFilters;
