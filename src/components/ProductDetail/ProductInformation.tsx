import React from 'react';

interface Product {
  id: number;
  title: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  price: number;
  oldPrice: number;
}

interface ProductInformationProps {
  relatedProducts: Product[];
}

const ProductInformation: React.FC<ProductInformationProps> = ({ relatedProducts }) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`full-${i}`} className="bi bi-star-fill"></i>);
    }
    if (hasHalfStar) {
      stars.push(<i key="half" className="bi bi-star-half"></i>);
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="bi bi-star"></i>);
    }
    return stars;
  };

  return (
    <div className="custom_padding_section mt-5" id="luxury_1">
      <div className="mt-5 product-info-section">
        <h2 className="mb-2 fw-bold">Product information</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card_info_x mb-4 bg-light">
              <p className="text-muted mt-2">
                Brand: <strong className="text-dark">UrbanStyle</strong>
              </p>
              <h5 className="fw-semibold mb-2">
                <i className="bi bi-rulers me-2 text-primary"></i> Measurement
              </h5>
              <p className="mb-0">
                Dimensions: <strong>78" x 60" x 18"</strong> (L x W x H)
                <br /> Suitable for Queen size mattress
              </p>
            </div>

            <div className="card_info_x mb-4">
              <h5 className="fw-semibold mb-2">
                <i className="bi bi-info-circle me-2 text-primary"></i> Item Details
              </h5>
              <ul className="list-unstyled mb-0">
                <li>✔ Solid Sheesham Wood Frame</li>
                <li>✔ Matte Walnut Finish</li>
                <li>✔ Weight Capacity: 200 Kg</li>
                <li>✔ 1 Year Warranty on Manufacturing Defects</li>
              </ul>
            </div>

            <div className="card_info_x">
              <h5 className="fw-semibold mb-2">
                <i className="bi bi-book me-2 text-primary"></i> User Guide
              </h5>
              <p className="mb-0">
                Easy to assemble with included toolkit. Recommended to clean with a dry cloth and avoid direct
                sunlight to maintain polish.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card_info_x mb-4 bg-light">
              <h5 className="fw-semibold mb-2">
                <i className="bi bi-palette me-2 text-primary"></i> Style
              </h5>
              <p className="mb-0">
                Contemporary design with smooth edges and minimalist finish, perfect for modern bedrooms.
              </p>
            </div>

            <div className="p-3 card_info_x mb-4">
              <h5 className="fw-semibold mb-2">
                <i className="bi bi-stars me-2 text-primary"></i> Features
              </h5>
              <ul className="list-unstyled mb-0">
                <li>✦ Premium Wooden Finish</li>
                <li>✦ Scratch Resistant Surface</li>
                <li>✦ Easy Assembly in 20 minutes</li>
                <li>✦ Strong Wooden Slats for Mattress Support</li>
              </ul>
            </div>

            <div className="card_info_x">
              <h5 className="fw-semibold mb-2">
                <i className="bi bi-brush me-2 text-primary"></i> Material & Care
              </h5>
              <p className="mb-0">
                Made from high-quality Sheesham wood.
                <br />
                <strong>Care:</strong> Wipe with a dry soft cloth. Avoid water and harsh chemicals.
              </p>
            </div>
          </div>
        </div>

        <div id="full-details" className="full-description mt-5">
          <h5>Product Description</h5>
          <p>
            Experience premium sound quality with our <b>Wireless Bluetooth Headphones</b>, designed for music
            lovers and professionals alike. Equipped with <b>40mm dynamic drivers</b>, these headphones deliver
            deep bass and crystal-clear treble for an immersive audio experience.
          </p>
          <p>
            Featuring <b>Bluetooth 5.3</b> for seamless connectivity up to 10 meters, these headphones provide
            stable performance with low latency, making them perfect for gaming, calls, and streaming. The{' '}
            <b>noise-cancelling microphone</b> ensures clear communication even in noisy environments.
          </p>
          <p>
            The lightweight design and <b>soft cushioned earcups</b> allow you to enjoy music comfortably for
            hours. With a powerful <b>30-hour battery backup</b> and quick charge support (10 mins charge = 3
            hrs playtime), you'll never miss a beat.
          </p>
          <ul>
            <li>✅ Driver Size: 40mm Dynamic</li>
            <li>✅ Connectivity: Bluetooth 5.3 + AUX support</li>
            <li>✅ Battery Life: Up to 30 Hours</li>
            <li>✅ Charging Port: Type-C Fast Charging</li>
            <li>✅ Extra Features: Noise Cancellation, Foldable Design, Built-in Mic</li>
          </ul>
          <div className="what_box">
            <p>What is in box</p>
           
            <ul className="list-unstyled d-flex gap-1 ps-2">
              <li>Sofa,</li>
              <li>Legs,</li>
              <li>Screws</li>
            </ul>
          </div>
        </div>

        <div className="row mt-5">
        
          <div className="frq_products">
            <div className="d-flex gap-3 flex-wrap">
              {relatedProducts?.slice(0, 3).map((product) => (
                <div key={product.id} className="card product-card position-relative" style={{ width: '250px' }}>
                  <img src={product.image} className="card-img-top" alt={product.title} />
                  <span className="heart-icon position-absolute top-0 end-0 p-2">
                    <i className="bi bi-heart"></i>
                  </span>
                  <div className="card-body">
                    <h6 className="product-title">{product.title}</h6>
                    <p className="product-desc">{product.description}</p>
                    <div className="d-flex justify-content-start">
                      <div className="mb-2 text-warning">
                        {renderStars(product.rating)}
                        <span className="text-muted ms-1">({product.reviews} reviews)</span>
                      </div>
                    </div>
                    <p className="product-price">
                      &#8377;{product.price} <span className="old-price">&#8377;{product.oldPrice}</span>
                    </p>
                    <div className="d-flex gap-2">
                      <button className="btn btn-warning flex-grow-1">Buy Now</button>
                      <button className="btn btn-outline-dark">
                        <i className="bi bi-cart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductInformation;
