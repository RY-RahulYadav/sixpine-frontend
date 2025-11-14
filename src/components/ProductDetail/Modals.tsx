import React from 'react';
import BackToTop from '../BackToTop';

const Modals: React.FC = () => {
  return (
    <>
      {/* Free Delivery Modal */}
      <div className="modal fade" id="freeDeliveryModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Free Delivery</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <p>
                The Product is eligible for free delivery{' '}
                <a href="free-delivery.html" className="text-success">
                  Learn more
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Replacement Modal */}
      <div className="modal fade" id="replacementModal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">10 Days Replacement</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="row text-center">
                <div className="col">
                  <strong>Replacement Reason</strong>
                  <p>Physical Damage</p>
                </div>
                <div className="col">
                  <strong>Replacement Period</strong>
                  <p>10 days from delivery</p>
                </div>
                <div className="col">
                  <strong>Replacement Policy</strong>
                  <p>Defective, Wrong and Missing Item</p>
                </div>
              </div>

              <div className="d-flex gap-2 align-items-center">
                <span className="fw-bold">Know More</span>
                <i className="fas fa-chevron-down"></i>
              </div>

              <div className="d-flex align-items-start">
                <div className="me-3">
                  <i className="fas fa-box-open fa-2x text-primary"></i>
                </div>
                <div>
                  <strong>Replacement Instructions</strong>
                  <p className="mb-0">
                    Keep the item in its original condition and packaging along with MRP tag and accessories for
                    a successful pick-up.
                  </p>
                </div>
              </div>

              <div className="d-flex gap-2 align-items-center border-top pt-2 mt-2">
                <span className="text-primary fw-bold">Read full returns policy</span>
                <i className="fas fa-chevron-right text-primary"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secure Transaction Modal */}
      <div className="modal fade" id="secureModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Your transaction is secure</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <p>
                We work hard to protect your security and privacy. Our payment security system encrypts your
                information during transmission. We don't share your credit card details with third-party sellers,
                and we don't sell your information to others.{' '}
                <a href="secure-transaction.html" className="text-success">
                  More info
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Offcanvas */}
      <div className="offcanvas offcanvas-end" tabIndex={-1} id="cartOffcanvas" aria-labelledby="cartOffcanvasLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="cartOffcanvasLabel">
            Your Cart
          </h5>
          <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="border-bottom pb-2 mb-3">
              <img src="assets/img/furniture-products/bed.jpg" className="img-fluid" alt="Product" width="200" />
              <div className="flex-grow-1">
                <h6>Product Title</h6>
                <p className="mb-2 text-danger">₹29,999</p>
                <div className="d-flex align-items-center">
                  <button className="btn btn-outline-secondary btn-sm me-1">-</button>
                  <input
                    type="text"
                    className="form-control form-control-sm text-center"
                    defaultValue="1"
                    style={{ width: '50px' }}
                  />
                  <button className="btn btn-outline-secondary btn-sm ms-1">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BackToTop />
    </>
  );
};

export default Modals;
