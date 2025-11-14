import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ShoppingCardData {
  title: string;
  discount?: string;
  products: string[];
}

const KeepShopping: React.FC = () => {
  const navigate = useNavigate();
  
  const shoppingCards: ShoppingCardData[] = [
    {
      title: 'Keep Shopping For',
      products: [
        'https://webdori.in/sixpine/assets/img/products/1.jpg',
        'https://webdori.in/sixpine/assets/img/products/2.jpg',
        'https://webdori.in/sixpine/assets/img/products/3.jpg',
        'https://webdori.in/sixpine/assets/img/products/4.jpg'
      ]
    },
    {
      title: 'Up to 80% Off',
      discount: '80%',
      products: [
        'https://webdori.in/sixpine/assets/img/products/5.jpg',
        'https://webdori.in/sixpine/assets/img/products/6.jpg',
        'https://webdori.in/sixpine/assets/img/products/7.jpg',
        'https://webdori.in/sixpine/assets/img/products/8.jpg'
      ]
    },
    {
      title: 'Up to 75% Off',
      discount: '75%',
      products: [
        'https://webdori.in/sixpine/assets/img/products/9.jpg',
        'https://webdori.in/sixpine/assets/img/products/10.jpg',
        'https://webdori.in/sixpine/assets/img/products/11.jpg',
        'https://webdori.in/sixpine/assets/img/products/12.jpg'
      ]
    },
    {
      title: 'Up to 59% Off',
      discount: '59%',
      products: [
        'https://webdori.in/sixpine/assets/img/products/4.jpg',
        'https://webdori.in/sixpine/assets/img/products/3.jpg',
        'https://webdori.in/sixpine/assets/img/products/2.jpg',
        'https://webdori.in/sixpine/assets/img/products/1.jpg'
      ]
    }
  ];

  const handleCardClick = () => {
    navigate('/products');
  };

  return (
    <section className="keep-shopping container s_pb">
      <div className="row g-3">
        {shoppingCards.map((card, index) => (
          <div className="col-lg-3 col-6" key={index}>
            <div 
              className="main-card" 
              onClick={handleCardClick}
              style={{ cursor: 'pointer' }}
            >
              {card.discount ? (
                <h6 className="mb-2">Up to <span>{card.discount}</span> Off</h6>
              ) : (
                <h5 className="mb-2">{card.title}</h5>
              )}
              <div className="row g-2">
                {card.products.map((product, idx) => (
                  <div className="col-6" key={idx}>
                    <div className="inner-card">
                      <img src={product} alt="Product" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeepShopping;
