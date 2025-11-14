import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface Product {
  id?: number;
  slug?: string;
  image: string;
  title: string;
  description: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
  carouselClass?: string;
  carouselId?: string;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products, carouselClass = 'owl-carousel_1', carouselId }) => {
  const uniqueClass = carouselId || carouselClass;
  const navigate = useNavigate();
  const { addToCart, state } = useApp();

  const handleBuyNow = async (product: Product) => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    // If product has variants, navigate to product detail page for variant selection
    if ((product as any).variants && (product as any).variants.length > 0) {
      if (product.slug) {
        navigate(`/products-details/${product.slug}`);
      }
      return;
    }

    if (product.id) {
      try {
        await addToCart(product.id, 1);
        navigate('/cart');
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to add item to cart';
        alert(errorMsg);
      }
    }
  };

  const handleAddToCart = async (product: Product) => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    // If product has variants, navigate to product detail page for variant selection
    if ((product as any).variants && (product as any).variants.length > 0) {
      if (product.slug) {
        navigate(`/products-details/${product.slug}`);
      }
      return;
    }

    if (product.id) {
      try {
        await addToCart(product.id, 1);
        // Sidebar will open automatically via context
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to add item to cart';
        alert(errorMsg);
      }
    }
  };

  const handleProductClick = (product: Product) => {
    if (product.slug) {
      navigate(`/products-details/${product.slug}`);
    }
  };

  useEffect(() => {
    // Initialize Owl Carousel
    if (typeof window.$ !== 'undefined' && window.$.fn.owlCarousel) {
      const $carousel = window.$(`.${uniqueClass}`);
      $carousel.owlCarousel({
        loop: true,
        margin: 15,
        nav: false,
        dots: false,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true,
        responsive: {
          0: { items: 2 },
          576: { items: 2 },
          768: { items: 3 },
          992: { items: 4 }
        }
      });
    }
  }, [uniqueClass]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i className="bi bi-star-fill" key={`full-${i}`}></i>);
    }
    if (hasHalfStar) {
      stars.push(<i className="bi bi-star-half" key="half"></i>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i className="bi bi-star" key={`empty-${i}`}></i>);
    }
    return stars;
  };

  return (
    <section className="product-carousel custom_padding_section s_pb">
      <h4 className="mb-3">{title}</h4>
      <div className={`owl-carousel ${uniqueClass} owl-theme`}>
        {products.map((product, index) => (
          <div className="item" key={index}>
            <div className="card product-card position-relative">
              <img 
                src={product.image} 
                className="card-img-top" 
                alt={product.title}
                onClick={() => handleProductClick(product)}
                style={{ cursor: 'pointer' }}
              />
              <span className="heart-icon position-absolute top-0 end-0 p-2">
                <i className="bi bi-heart"></i>
              </span>
              <div className="card-body">
                <h6 
                  className="product-title"
                  onClick={() => handleProductClick(product)}
                  style={{ cursor: 'pointer' }}
                >
                  {product.title}
                </h6>
                <p className="product-desc">{product.description}</p>
                <div className="d-flex justify-content-start">
                  <div className="mb-2 text-warning">
                    {renderStars(product.rating)}
                    <span className="text-muted ms-1">({product.reviews} reviews)</span>
                  </div>
                </div>
                <p className="product-price">
                  &#8377;{product?.price} <span className="old-price">&#8377;{product?.oldPrice}</span>
                </p>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-warning flex-grow-1"
                    onClick={() => handleBuyNow(product)}
                  >
                    Buy Now
                  </button>
                  <button 
                    className="btn btn-outline-dark"
                    onClick={() => handleAddToCart(product)}
                  >
                    <i className="bi bi-cart"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;
