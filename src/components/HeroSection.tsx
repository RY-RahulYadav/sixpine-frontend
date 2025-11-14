import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  useEffect(() => {
    // Initialize Owl Carousel for hero slider
    if (typeof window.$ !== 'undefined' && window.$.fn.owlCarousel) {
      const $hero = window.$('.hero-slider');
      $hero.owlCarousel({
        items: 1,
        loop: true,
        margin: 0,
        dots: true,
        nav: false,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        smartSpeed: 700,
        animateOut: 'fadeOut'
      });

      // Per-slide content animations
      function runAnim(e: any) {
        const $current = window.$(e.target).find('.owl-item').eq(e.item.index);
        $current.find('[data-animate]').each(function(this: any) {
          const cls = window.$(this).attr('data-animate');
          window.$(this).removeClass('animate__animated ' + cls);
          void this.offsetWidth;
          window.$(this).addClass('animate__animated ' + cls);
        });
      }
      $hero.on('initialized.owl.carousel changed.owl.carousel', runAnim);
    }
  }, []);

  return (
    <section className="hero-section">
      <div className="owl-carousel hero-slider owl-theme">
        {/* Slide 1 */}
        <div className="hero-slide">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-6 hero-copy">
                <div className="brand_name mb-2">
                  <h4>Sixpine</h4>
                </div>
                <h5 className="eyebrow animate__animated" data-animate="animate__fadeInDown">SALE OFF 50%</h5>
                <h1 className="headline animate__animated" data-animate="animate__fadeInUp">
                  Elegant & Comfortable Furniture
                </h1>
                <p className="sub animate__animated" data-animate="animate__fadeInUp">
                  Discover stylish sofas, modern tables, and timeless pieces crafted to make your home warm and inviting. Upgrade your living space with comfort & durability.
                </p>
                <Link to="/shop" className="btn btn-dark rounded-pill px-4 py-2 animate__animated" data-animate="animate__fadeInUp">Shop now →</Link>
              </div>
              <div className="col-md-6 text-end hero-image">
                <img src="https://file.aiquickdraw.com/imgcompressed/img/compressed_6a37c6cb1e2f2462556bc01b836b7fc8.webp" className="img-fluid animate__animated" data-animate="animate__fadeInRight" alt="Hero 1" />
              </div>
            </div>
          </div>
        </div>

        {/* Slide 2 */}
        <div className="hero-slide">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-md-6 hero-copy">
                <div className="brand_name mb-2">
                  <h4>Sixpine</h4>
                </div>
                <h5 className="eyebrow animate__animated" data-animate="animate__fadeInDown">SALE OFF 50%</h5>
                <h1 className="headline animate__animated" data-animate="animate__fadeInUp">
                  Elegant & Comfortable Furniture
                </h1>
                <p className="sub animate__animated" data-animate="animate__fadeInUp">
                  Discover stylish sofas, modern tables, and timeless pieces crafted to make your home warm and inviting. Upgrade your living space with comfort & durability.
                </p>
                <Link to="/shop" className="btn btn-dark rounded-pill px-4 py-2 animate__animated" data-animate="animate__fadeInUp">Shop now →</Link>
              </div>
              <div className="col-md-6 text-end hero-image">
                <img src="https://file.aiquickdraw.com/imgcompressed/img/compressed_215a8341218b7c5192cd014e00644358.webp" className="img-fluid animate__animated" data-animate="animate__fadeInRight" alt="Hero 2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
