import React from 'react';
import ProductCard from './ProductCard';

interface Product {
  id: number;
  title: string;
  description: string;
  image: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice: number;
  discount: number;
  badge?: string;
  deliveryDate: string;
  sponsored?: boolean;
}

interface ProductGridProps {
  products: Product[];
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, sortBy, onSortChange }) => {
  return (
    <div className="product-grid-container">
      {/* Results Header */}
      <div className="results-header">
        <div className="results-info">
          <h5 className="results-title">Results</h5>
          <p className="results-subtitle">
            Check each product page for other buying options.
          </p>
        </div>
        <div className="sort-dropdown">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            className="form-select form-select-sm"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Avg. Customer Review</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="products-list">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <nav aria-label="Product pagination">
          <ul className="pagination justify-content-center">
            <li className="page-item disabled">
              <a className="page-link" href="#" tabIndex={-1}>
                Previous
              </a>
            </li>
            <li className="page-item active">
              <a className="page-link" href="#">
                1
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                2
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                3
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                ...
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                26
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#">
                Next
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default ProductGrid;
