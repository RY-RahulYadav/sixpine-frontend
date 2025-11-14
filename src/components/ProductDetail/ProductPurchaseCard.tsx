import React, { useState } from 'react';

interface ProductPurchaseCardProps {
  product: any;
  selectedVariant?: any;
  onAddToCart: () => void;
  onBuyNow?: () => void;
}

const ProductPurchaseCard: React.FC<ProductPurchaseCardProps> = ({
  product,
  selectedVariant,
  onAddToCart,
  onBuyNow
}) => {
  const [quantity, setQuantity] = useState(1);

  // Shared box style so both panels have the same width and a visible subtle dark-gray border
  // Slightly darker gray so the border is visible on white backgrounds
  const boxStyle: React.CSSProperties = { border: '1px solid #bdbdbd', width: '100%', borderRadius: 8 };

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= (product?.stock_quantity || 1)) {
      setQuantity(value);
    }
  };

  const currentPrice = selectedVariant?.effective_price || product?.price || 0;
  const totalPrice = currentPrice * quantity;

  return (
    <div className="details_info">
      <div className="card cart_summary_top" style={boxStyle}>
        <div className="card-body">
          <strong>Purchase Summary</strong>
          <div className="deatailsnbn">
            <p>
              {quantity} x {product?.title} - <span>₹{currentPrice.toLocaleString()}</span>
            </p>
            <p className="fw-bold">
              Total: <span>₹{totalPrice.toLocaleString()}</span>
            </p>
          </div>
          
          <div className="quantity-section mb-3">
            <label className="form-label small">Quantity:</label>
            <div className="d-flex align-items-center gap-2">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                type="number"
                className="form-control form-control-sm text-center"
                style={{ width: '60px' }}
                value={quantity}
                min="1"
                max={product?.stock_quantity || 1}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              />
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= (product?.stock_quantity || 1)}
              >
                +
              </button>
            </div>
          </div>

          <div className="d-flex flex-column gap-2">
            <button
              className="btn btn-warning w-100"
              onClick={onAddToCart}
              disabled={product?.stock_quantity === 0}
            >
              <i className="bi bi-cart-plus me-2"></i>
              Add to Cart
            </button>
            <button 
              className="btn btn-danger w-100"
              onClick={onBuyNow}
              disabled={product?.stock_quantity === 0}
            >
              <i className="bi bi-lightning-fill me-2"></i>
              Buy Now
            </button>
          </div>

          {product?.stock_quantity <= 10 && product?.stock_quantity > 0 && (
            <div className="alert alert-warning alert-sm mt-2">
              <small>Only {product.stock_quantity} left in stock!</small>
            </div>
          )}
        </div>
      </div>

  <div className="small-ad-box mt-3 p-3 border rounded shadow-sm" style={boxStyle}>
        <img
          src="https://webdori.in/sixpine/assets/img/furniture-products/sofa2.jpg"
          className="img-fluid mb-2"
          alt="Promo Product"
        />
        <p>
          <strong>Special Offer:</strong> 20% Off
        </p>
        <a href="#" className="btn btn-sm btn-primary w-100">
          Check Now
        </a>
      </div>

      {/* <div className="row">
        <div className="cart_side_fixed">
          <div className="sub_total text-center">
            <h6 className="text-center">Sub Total</h6>
            <p className="text-center text-danger">₹29,999</p>
            <button className="btn btn-primary">Go to Cart</button>
          </div>

          <div className="border-bottom pb-2 mb-2 text-center">
            <img
              src="assets/img/furniture-products/bed.jpg"
              className="img-fluid mb-2"
              alt="Product"
              width="200"
            />
            <p className="text-danger">₹29,999</p>
            <h6 className="mb-2">Product Title</h6>

            <div className="d-flex justify-content-center align-items-center gap-2">
              <button className="btn btn-outline-danger btn-sm">
                <i className="bi bi-trash"></i>
              </button>
              <input
                type="text"
                className="form-control form-control-sm text-center"
                value="1"
                style={{ width: '50px' }}
                readOnly
              />
              <button className="btn btn-outline-secondary btn-sm">+</button>
            </div>
          </div>

          <div className="border-bottom pb-3 text-center">
            <div className="hand_m p-3 border rounded d-inline-block" style={{ background: '#fff' }}>
              <h5 className="fw-bold">HAND MADE</h5>
              <p className="mb-0">
                WITH <i className="fa fa-heart text-danger"></i> LOVE
              </p>
            </div>

            <p className="text-danger mb-2 fw-bold" style={{ fontSize: '1.2rem' }}>
              ₹29,999
            </p>

            <div className="d-flex justify-content-center align-items-center gap-2">
              <button className="btn btn-outline-danger btn-sm">
                <i className="bi bi-trash"></i>
              </button>
              <input
                type="text"
                className="form-control form-control-sm text-center"
                value="1"
                style={{ width: '50px' }}
                readOnly
              />
              <button className="btn btn-outline-secondary btn-sm">+</button>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default ProductPurchaseCard;
