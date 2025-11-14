import React, { useState } from 'react';

const CustomerReviews: React.FC = () => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [review, setReview] = useState('');

  const handleStarClick = (value: number) => {
    setRating(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ name, review, rating });
    // Handle form submission
  };

  return (
    <div className="custom_padding_section mb-4">
      <div className="row">
        <div className="col-md-6">
          <div className="customer_reviews_1">
            <h5>Customer Reviews</h5>

            <div className="d-flex align-items-center mb-2">
              <span className="wis">5 ★</span>
              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                <div className="progress-bar bg-success" style={{ width: '70%' }}></div>
              </div>
              <span className="ms-2">70%</span>
            </div>

            <div className="d-flex align-items-center mb-2">
              <span className="wis">4 ★</span>
              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                <div className="progress-bar bg-info" style={{ width: '50%' }}></div>
              </div>
              <span className="ms-2">50%</span>
            </div>

            <div className="d-flex align-items-center mb-2">
              <span className="wis">3 ★</span>
              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                <div className="progress-bar bg-primary" style={{ width: '30%' }}></div>
              </div>
              <span className="ms-2">30%</span>
            </div>

            <div className="d-flex align-items-center mb-2">
              <span className="wis">2 ★</span>
              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                <div className="progress-bar bg-warning" style={{ width: '15%' }}></div>
              </div>
              <span className="ms-2">15%</span>
            </div>

            <div className="d-flex align-items-center">
              <span className="wis">1 ★</span>
              <div className="progress flex-grow-1" style={{ height: '8px' }}>
                <div className="progress-bar bg-danger" style={{ width: '5%' }}></div>
              </div>
              <span className="ms-2">5%</span>
            </div>
          </div>

          <div className="mt-3">
            <h6>Add Your Review</h6>
            <div className="mb-2 d-flex align-items-center rating_comment">
              <span className="me-2">Your Rating:</span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((value) => (
                  <i
                    key={value}
                    className={`fa fa-star ${rating >= value ? 'active' : ''}`}
                    data-value={value}
                    onClick={() => handleStarClick(value)}
                    style={{ cursor: 'pointer' }}
                  ></i>
                ))}
              </div>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Write your review here..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary btn-sm">
                Submit Review
              </button>
            </form>
          </div>
        </div>

        <div className="col-md-6">
          <h6>
            <i className="bi bi-star-fill text-warning"></i> Customer Reviews
          </h6>

          <div className="border p-3 rounded bg-light mb-3">
            <div className="d-flex align-items-center mb-2">
              <strong className="me-2">Rahul, 28</strong>
              <div className="text-warning">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star"></i>
              </div>
            </div>
            <p className="fst-italic mb-0">
              "Product quality is excellent, delivery was very fast and packaging was secure. The wooden finish
              looks premium and it fits perfectly in my living room. Would definitely recommend this to friends
              and family."
            </p>
          </div>

          <div className="border p-3 rounded bg-light mb-3">
            <div className="d-flex align-items-center mb-2">
              <strong className="me-2">Neha, 25</strong>
              <div className="text-warning">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-half"></i>
                <i className="bi bi-star"></i>
              </div>
            </div>
            <p className="fst-italic mb-0">
              "Very happy with the purchase, product matches the description perfectly. The cushions are soft and
              comfortable, and the color is exactly as shown in the images. Delivery staff were also very polite."
            </p>
          </div>

          <div className="border p-3 rounded bg-light mb-3">
            <div className="d-flex align-items-center mb-2">
              <strong className="me-2">Amit, 32</strong>
              <div className="text-warning">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
              </div>
            </div>
            <p className="fst-italic mb-0">
              "Absolutely satisfied! Excellent quality and fast delivery. The assembly was simple and the final
              setup looks great. I'm impressed with the durability of the material and overall design. Definitely
              worth the price."
            </p>
          </div>

          <div className="border p-3 rounded bg-light">
            <div className="d-flex align-items-center mb-2">
              <strong className="me-2">Priya, 29</strong>
              <div className="text-warning">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star"></i>
                <i className="bi bi-star"></i>
              </div>
            </div>
            <p className="fst-italic mb-0">
              "Good product, decent quality and timely delivery. The chair is very comfortable and stable, perfect
              for home office use. The material feels sturdy and easy to clean, and I like the minimalistic design
              that matches my home decor."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerReviews;
