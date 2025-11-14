import React from 'react';

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

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);

    return (
      <>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '⯨'}
        {'☆'.repeat(emptyStars)}
      </>
    );
  };

  return (
    <div className="product-card">
      {product.sponsored && (
        <div className="sponsored-tag">
          Sponsored <i className="bi bi-info-circle"></i>
        </div>
      )}

      <div className="row">
        <div className="col-md-3 product-image-col">
          <img src={product.image} alt={product.title} className="product-image" />
        </div>

        <div className="col-md-9 product-details-col">
          <div className="product-info">
            {product.badge && <span className="product-badge">{product.badge}</span>}
            
            <h6 className="product-title">
              <a href="/product-detail">{product.title}</a>
            </h6>
            
            <p className="product-description">{product.description}</p>

            <div className="product-rating">
              <span className="stars">{renderStars(product.rating)}</span>
              <span className="review-count">{product.reviews.toLocaleString()}</span>
            </div>

            <div className="product-buyers">
              <span className="buyers-count">5K+ bought in past month</span>
            </div>

            <div className="product-pricing">
              <span className="current-price">₹{product.price.toLocaleString()}</span>
              <span className="original-price">
                M.R.P: <del>₹{product.originalPrice.toLocaleString()}</del>
              </span>
              <span className="discount">({product.discount}% off)</span>
            </div>

            <div className="product-offers">
              <p className="offer-text">Up to 5% back with Amazon Pay ICICI...</p>
            </div>

            <div className="product-delivery">
              <p className="delivery-info">
                <strong>FREE delivery</strong> <span>{product.deliveryDate}</span>
              </p>
              <p className="delivery-fast">Or fastest delivery Tomorrow, 5 Oct</p>
            </div>

            <button className="btn btn-warning add-to-cart-btn">
              Add to cart
            </button>

            <div className="product-variants">
              <a href="#" className="variant-link">
                +1 other color/pattern
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
