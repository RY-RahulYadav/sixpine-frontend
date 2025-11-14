import React, { useEffect, useState } from 'react';

interface ProductInfoProps {
  product: any;
  selectedVariant?: any;
  onVariantSelect?: (variant: any) => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ 
  product, 
  selectedVariant, 
  onVariantSelect 
}) => {
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      onVariantSelect?.(product.variants[0]);
    }
  }, [product]);

  // When product loads, set demo fallback selections if backend doesn't provide attributes
  useEffect(() => {
    // demo fallbacks in case backend doesn't send options
    const demoColors = ['Red', 'Blue', 'Black'];
    const demoSizes = ['S', 'M', 'L'];
    const demoPatterns = ['Exact', 'Classic'];

    const backendColors = product?.colors || getAttributeValues('Color');
    const backendSizes = product?.sizes || getAttributeValues('Size');
    const backendPatterns = product?.patterns || getAttributeValues('Pattern');

    // set defaults only when nothing is already selected
    if (!selectedColor) setSelectedColor((backendColors && backendColors.length > 0) ? backendColors[0] : demoColors[0]);
    if (!selectedSize) setSelectedSize((backendSizes && backendSizes.length > 0) ? backendSizes[0] : demoSizes[0]);
    if (!selectedPattern) setSelectedPattern((backendPatterns && backendPatterns.length > 0) ? backendPatterns[0] : demoPatterns[0]);
  }, [product]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={i} className="bi bi-star-fill text-warning"></i>);
    }
    
    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half text-warning"></i>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star text-warning"></i>);
    }
    
    return stars;
  };

  const currentPrice = selectedVariant?.effective_price || product?.price || 0;
  const oldPrice = selectedVariant?.effective_old_price || product?.old_price;

  // Local UI state for options (Color / Size / Pattern)
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  const getAttributeValues = (name: string) => {
    if (!product?.attributes) return [];
    return product.attributes
      .filter((a: any) => a.filter_attribute?.name?.toLowerCase() === name.toLowerCase())
      .map((a: any) => a.value)
      .filter((v: any, i: number, arr: any[]) => v != null && arr.indexOf(v) === i);
  };

  // Provide demo fallbacks so UI always shows controls even if backend omits them
  const demoColors = ['Red', 'Blue', 'Black'];
  const demoSizes = ['S', 'M', 'L'];
  const demoPatterns = ['Exact', 'Classic'];

  const backendColors = product?.colors || getAttributeValues('Color');
  const backendSizes = product?.sizes || getAttributeValues('Size');
  const backendPatterns = product?.patterns || getAttributeValues('Pattern');

  const colors = (backendColors && backendColors.length > 0) ? backendColors : demoColors;
  const sizes = (backendSizes && backendSizes.length > 0) ? backendSizes : demoSizes;
  const patterns = (backendPatterns && backendPatterns.length > 0) ? backendPatterns : demoPatterns;

  return (
    <>
      <h2 className="product-title">{product?.title}</h2>
      <div className="box_bx">
        <p className="text-muted">
          Brand: <span className="fw-bold">{product?.brand?.name || 'Unknown'}</span>
        </p>
        <p className="small d-flex align-items-center gap-2">
          {renderStars(product?.average_rating || 0)}
          <span className="text-muted">({product?.review_count || 0} Reviews)</span>
        </p>
      </div>

      <div className="price-section">
        <div className="d-flex align-items-baseline gap-2 mb-1">
          <h1 className="mb-0 fw-bold" style={{ fontSize: '2rem' }}>₹{currentPrice.toLocaleString()}</h1>
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>/month (3 months)</span>
        </div>
        <p className="mb-2" style={{ fontSize: '0.85rem' }}>
          with <strong>No Cost EMI</strong> on your ICICI Credit Card{' '}
          <a href="#" className="text-primary text-decoration-none">
            All EMI Plans <i className="bi bi-chevron-down"></i>
          </a>
        </p>
        {oldPrice && oldPrice > currentPrice && (
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-danger fw-bold text-white" style={{ fontSize: '1rem', padding: '0.4rem 0.6rem' }}>
              -{product?.discount_percentage}%
            </span>
            <h3 className="mb-0 fw-bold" style={{ fontSize: '1.5rem' }}>₹{currentPrice.toLocaleString()}</h3>
          </div>
        )}
        {oldPrice && oldPrice > currentPrice && (
          <p className="text-muted mb-0" style={{ fontSize: '0.85rem' }}>
            M.R.P: <span className="text-decoration-line-through">₹{oldPrice.toLocaleString()}</span>
          </p>
        )}
      </div>

      

      <div className="availability-section mb-3">
        <p className={`fw-bold ${product?.stock_quantity > 0 ? 'text-success' : 'text-danger'}`}>
          {product?.availability === 'in_stock' && product?.stock_quantity > 0 
            ? `In Stock (${product.stock_quantity} available)`
            : 'Out of Stock'
          }
        </p>
      </div>

      <div className="offers">
        <h6>Available Offers</h6>
        <ul className="list-unstyled list_1">
          <li>
            <i className="bi bi-tag-fill text-success me-2"></i>Free delivery on orders above ₹499
          </li>
          <li>
            <i className="bi bi-tag-fill text-success me-2"></i>EMI available
          </li>
          {product?.is_on_sale && (
            <li>
              <i className="bi bi-tag-fill text-success me-2"></i>Special discount of {product?.discount_percentage}%
            </li>
          )}
        </ul>
      </div>

      <ul className="list-unstyled list_1">
        <li className="d-flex align-items-center">
          <span>
            <i className="bi bi-check-circle-fill text-success me-2"></i> Free Delivery
          </span>
        </li>
        <li className="d-flex align-items-center">
          <span>
            <i className="bi bi-check-circle-fill text-success me-2"></i> 7 Days Replacement
          </span>
        </li>
        <li className="d-flex align-items-center">
          <span>
            <i className="bi bi-check-circle-fill text-success me-2"></i> Secure Transaction
          </span>
        </li>
      </ul>

      {/* Product Variants Selection */}
      {product?.variants && product.variants.length > 0 && (
        <div className="box_b mb-4">
          <h6>Available Variants</h6>
          <div className="row">
            {product.variants.map((variant: any) => (
              <div key={variant.id} className="col-6 col-md-4 mb-2">
                <button
                  className={`btn btn-outline-primary btn-sm w-100 ${
                    selectedVariant?.id === variant.id ? 'active' : ''
                  }`}
                  onClick={() => onVariantSelect?.(variant)}
                >
                  {variant.name}
                  <br />
                  <small>₹{variant.effective_price.toLocaleString()}</small>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Attributes */}
      {product?.attributes && product.attributes.length > 0 && (
        <div className="box_b mb-4">
          <h6>Specifications</h6>
          <div className="specifications-list">
            {product.attributes.map((attr: any, index: number) => (
              <div key={index} className="d-flex justify-content-between py-1 border-bottom">
                <strong>{attr.filter_attribute.name}:</strong>
                <span>{attr.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="product_details_1">
        {/* Options (Color / Size / Pattern) - placed above Key Details */}
        <div className="product-options mb-3">
          {/* Color */}
          {((colors && colors.length > 0) || (sizes && sizes.length > 0) || (patterns && patterns.length > 0)) && (
            <>
              {colors && colors.length > 0 && (
                <div className="variant-row option-row">
                  <strong>Color:</strong>
                  <div className="d-flex flex-wrap gap-2">
                    {colors.map((c: any) => (
                      <button
                        type="button"
                        key={`color-${c}`}
                        className={`btn option-btn ${selectedColor === c ? 'active' : ''}`}
                        onClick={() => setSelectedColor(c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              {sizes && sizes.length > 0 && (
                <div className="variant-row option-row">
                  <strong>Size:</strong>
                  <div className="d-flex flex-wrap gap-2">
                    {sizes.map((s: any) => (
                      <button
                        type="button"
                        key={`size-${s}`}
                        className={`btn option-btn ${selectedSize === s ? 'active' : ''}`}
                        onClick={() => setSelectedSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Pattern */}
              {patterns && patterns.length > 0 && (
                <div className="variant-row option-row">
                  <strong>Pattern:</strong>
                  <div className="d-flex flex-wrap gap-2">
                    {patterns.map((p: any) => (
                      <button
                        type="button"
                        key={`pattern-${p}`}
                        className={`btn option-btn ${selectedPattern === p ? 'active' : ''}`}
                        onClick={() => setSelectedPattern(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="key-details">
          <h6>Key Details</h6>
          <div className="details-grid">
            <div className="detail-box">
              <strong>Brand:</strong> {product?.brand?.name || 'N/A'}
            </div>
            <div className="detail-box">
              <strong>SKU:</strong> {product?.sku || 'N/A'}
            </div>
            <div className="detail-box">
              <strong>Category:</strong> {product?.category?.name || 'N/A'}
            </div>
            {product?.weight && (
              <div className="detail-box">
                <strong>Weight:</strong> {product.weight} kg
              </div>
            )}
            {product?.dimensions && (
              <div className="detail-box">
                <strong>Dimensions:</strong> {product.dimensions}
              </div>
            )}
            <div className="detail-box">
              <strong>Availability:</strong> {product?.availability?.replace('_', ' ') || 'N/A'}
            </div>
          </div>
        </div>

        <div className="about-item">
          <h5>About This Item</h5>
          <div className="description-text">
            {product?.description || product?.short_description || 'No description available.'}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductInfo;
