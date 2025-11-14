import { useState, useEffect, useRef } from 'react';
import styles from './heroSection.module.css';
import API from '../../services/api';
import { homepageAPI } from '../../services/api';

interface HeroSlide {
  id: number;
  title: string;
  subtitle: string;
  price: string;
  buttonText: string;
  backgroundColor: string;
  imageSrc: string;
}

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpertOpen, setIsExpertOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slides, setSlides] = useState<HeroSlide[]>([
    {
      id: 1,
      title: "Be the Perfect Host",
      subtitle: "Coffee Table",
      price: "₹ 2,499",
      buttonText: "BUY NOW",
      backgroundColor: "#C4A484",
      imageSrc: "/images/Home/studytable.jpg"
    },
    {
      id: 2,
      title: "Comfort Redefined",
      subtitle: "Sofa Collection",
      price: "₹ 15,999",
      buttonText: "BUY NOW",
      backgroundColor: "#8B7355",
      imageSrc: "/images/Home/furnishing.jpg"
    },
    {
      id: 3,
      title: "Sleep in Style",
      subtitle: "Bedroom Sets",
      price: "₹ 25,999",
      buttonText: "BUY NOW",
      backgroundColor: "#A68B5B",
      imageSrc: "/images/Home/livingroom.jpg"
    }
  ]);
  const [, setLoading] = useState(true);
  const [specialDealBanner, setSpecialDealBanner] = useState<any>(null);
  const [mattressBanner, setMattressBanner] = useState<any>(null);
  const [bottomBanner, setBottomBanner] = useState<any>(null);
  const contactFormRef = useRef<HTMLFormElement>(null);

  // Fetch hero section data from API
  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('hero');
        
        if (response.data && response.data.content) {
          if (response.data.content.slides) {
            setSlides(response.data.content.slides);
          }
          if (response.data.content.specialDealBanner) {
            setSpecialDealBanner(response.data.content.specialDealBanner);
          }
          if (response.data.content.mattressBanner) {
            setMattressBanner(response.data.content.mattressBanner);
          }
          if (response.data.content.bottomBanner) {
            setBottomBanner(response.data.content.bottomBanner);
          }
        }
      } catch (error) {
        console.error('Error fetching hero section data:', error);
        // Keep default slides if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchHeroData();
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

   const togglePopup = () => {
    setIsOpen(!isOpen);
  };

  const toggleExpertPopup = () => {
    setIsExpertOpen(!isExpertOpen);
    if (isExpertOpen) {
      // Reset form when closing
      setIsSubmitting(false);
      if (contactFormRef.current) {
        contactFormRef.current.reset();
      }
    }
  };

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);















  return (
    <div className={`${styles.heroContainer} heroContainer`}>
      <div className={styles.heroWrapper}>
        <div className={styles.heroGrid}>

          {/* Main Carousel */}
          <div
            className={styles.mainCarousel}
            style={{ backgroundColor: slides[currentSlide]?.backgroundColor || '#C4A484' }}
          >
            {/* Navigation Arrows */}
            <button className={`${styles.navArrow} ${styles.navArrowLeft}`} onClick={prevSlide}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <button className={`${styles.navArrow} ${styles.navArrowRight}`} onClick={nextSlide}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* Slide Content */}
            <div className={styles.slideContent}>
              {/* Text Content */}
              <div className={styles.slideText}>
                <p className={styles.slideSubtitle}>{slides[currentSlide]?.title || ''}</p>
                <h1 className={styles.slideTitle}>{slides[currentSlide]?.subtitle || ''}</h1>
                <div className={styles.priceSection}>
                  <p className={styles.startingFrom}>Starting From</p>
                  <div className={styles.priceContainer}>
                    <span className={styles.price}>{slides[currentSlide]?.price || ''}</span>
                    <span className={styles.asterisk}>*</span>
                  </div>
                </div>
                <button className={styles.buyNowBtn}>{slides[currentSlide]?.buttonText || 'BUY NOW'}</button>
              </div>

              {/* Product Image */}
              <div className={styles.productImage}>
                <div className={styles.imagePlaceholder}>
                  {/* Dynamic image source */}
                  <img
                    src={slides[currentSlide]?.imageSrc || ''}
                    alt={slides[currentSlide]?.subtitle || 'Product'}
                    className={styles.productImg}
                  />
                </div>
              </div>
            </div>

            {/* Brand Logo */}
            <div className={styles.brandLogo}>T&C Apply</div>

            {/* Slide Indicators */}
            <div className={styles.slideIndicators}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${currentSlide === index ? styles.active : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>

          {/* Right Side Panels */}
          <div className={styles.rightPanels}>
            {/* Special Deal - Bedroom */}
            <div 
              className={styles.bedroomPanel}
              style={specialDealBanner?.backgroundImage ? {
                backgroundImage: `url(${specialDealBanner.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {}}
            >
              <div className={styles.bedroomContent}>
                <div className={styles.bedroomText}>
                  {/* Special Deal Badge */}
                  <div className={styles.specialDealBadge}>{specialDealBanner?.badgeText || 'SPECIAL DEAL'}</div>
                  <div className={styles.uptoText}>{specialDealBanner?.uptoText || 'UPTO'}</div>
                  <div className={styles.discountPrice}>{specialDealBanner?.discountText || '₹5000 OFF'}</div>
                  <div className={styles.instantDiscount}>{specialDealBanner?.instantDiscountText || 'INSTANT DISCOUNT'}</div>
                  <button className={styles.bedroomBuyBtn}>{specialDealBanner?.buttonText || 'BUY NOW'}</button>
                </div>
              </div>
            </div>

            {/* Mattress Section */}
            <div 
              className={styles.mattressPanel}
              style={mattressBanner?.backgroundImage ? {
                backgroundImage: `url(${mattressBanner.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              } : {}}
            >
              {/* Ships in 2 Days Badge */}
              <div className={styles.shipsBadge}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M16 3H1V16H16V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 8H20L23 11V16H16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="5.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {mattressBanner?.badgeText || 'Ships in 2 Days'}
              </div>

              <div className={styles.mattressContent}>
                <div className={styles.mattressText}>
                  <h3 className={styles.mattressTitle}>{mattressBanner?.title || 'MATTRESS'}</h3>
                  <p className={styles.mattressSubtitle}>{mattressBanner?.subtitle || 'That Turns Sleep into Therapy'}</p>
                  <div className={styles.mattressPriceSection}>
                    <span className={styles.startingText}>{mattressBanner?.startingText || 'Starting From'}</span>
                    <div className={styles.mattressPrice}>{mattressBanner?.price || '₹9,999'}</div>
                    <div className={styles.freeDelivery}>{mattressBanner?.deliveryText || 'FREE Delivery Available'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Support Section */}
        {/* Customer Support Section */}
        <div className={styles.supportButtons}>
          {/* Buy On Phone */}
          <div className={`${styles.supportBtn} ${styles.phoneBtn}`} onClick={togglePopup}>
            <div className={styles.supportIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92V19.92C22 20.52 21.52 21.01 20.92 21.01C9.39 21.01 2.99 14.61 2.99 3.08C2.99 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.05 8.71 5.94C8.87 6.31 8.76 6.76 8.44 7.04L6.9 8.22C8.07 10.86 10.13 12.92 12.77 14.09L13.95 12.55C14.23 12.23 14.68 12.12 15.05 12.28C15.94 12.64 16.91 12.83 17.91 12.83C18.51 12.83 18.99 13.31 18.99 13.91V16.91H22V16.92Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div className={styles.supportText}>
              <div>Buy On</div>
              <div>Phone</div>
            </div>
          </div>

          {/* Get Expert Help */}
          <div className={`${styles.supportBtn} ${styles.expertBtn}`} onClick={toggleExpertPopup}>
            <div className={styles.supportIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.54 20.54 16 20 16H7L3 20V4C3 3.46 3.46 3 4 3H20C20.54 3 21 3.46 21 4V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.supportText}>
              <div>Get Expert</div>
              <div>Help</div>
            </div>
          </div>
        </div>

        {/* Side Popup */}
       {isOpen && (
  <div className={styles.popupOverlay} onClick={togglePopup}>
    <div className={styles.popupContent} onClick={(e) => e.stopPropagation()}>
      {/* Close Icon */}
      <button className={styles.closeIcon} onClick={togglePopup}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Header */}
      <div className={styles.popupHeader}>
        <div className={styles.bulletPoint}>● 8 Experts Online Now To Assist You</div>
        <h3 className={styles.popupTitle}>Talk To A Furniture Expert Now</h3>
        <p className={styles.popupTime}>Available between 10 AM - 7 PM</p>
      </div>

      {/* Phone Number with Icon */}
      <div className={styles.phoneDisplay}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={styles.phoneIcon}>
          <path d="M22 16.92V19.92C22 20.52 21.52 21.01 20.92 21.01C9.39 21.01 2.99 14.61 2.99 3.08C2.99 2.48 3.48 2 4.08 2H7.08C7.68 2 8.16 2.48 8.16 3.08C8.16 4.08 8.35 5.05 8.71 5.94C8.87 6.31 8.76 6.76 8.44 7.04L6.9 8.22C8.07 10.86 10.13 12.92 12.77 14.09L13.95 12.55C14.23 12.23 14.68 12.12 15.05 12.28C15.94 12.64 16.91 12.83 17.91 12.83C18.51 12.83 18.99 13.31 18.99 13.91V16.91H22V16.92Z" stroke="#ff5722" strokeWidth="2"/>
        </svg>
        <a href="tel:9897268972" className={styles.phoneNumber}>9897268972</a>
      </div>

      {/* OR Divider */}
      <div className={styles.orDivider}>OR</div>

      {/* WhatsApp Button */}
      <a href="https://wa.me/9628209929" target="_blank" rel="noopener noreferrer" className={styles.chatButton}>
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
          alt="WhatsApp" 
          width="20" 
          height="20"
        />
        CHAT NOW
      </a>

      {/* Footer Text */}
      <p className={styles.footerText}>Call us to get <strong>free Sixpine credits</strong></p>
    </div>
  </div>
)}
      {/* Expert Callback Drawer */}
      {isExpertOpen && (
        <div className={styles.popupOverlay} onClick={toggleExpertPopup}>
          <div className={`${styles.popupContent} ${styles.callbackContent}`} style={{marginTop: '80px'}} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeIcon} onClick={toggleExpertPopup}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>

            <div className={styles.callbackHeader}>
              <h3 className={styles.callbackTitle}>Get A Callback From Us</h3>
              <p className={styles.callbackSubtitle}>Our Nearest Store Will Contact You</p>
            </div>

            <form 
              ref={contactFormRef}
              className={styles.callbackForm} 
              onSubmit={async (e) => { 
                e.preventDefault();
                
                // Prevent double submission
                if (isSubmitting) {
                  return;
                }
                
                setIsSubmitting(true);
                
                const form = contactFormRef.current || e.currentTarget;
                if (!form) {
                  setIsSubmitting(false);
                  return;
                }
                
                const formData = new FormData(form);
                const data = {
                  full_name: formData.get('name') as string,
                  pincode: formData.get('pincode') as string,
                  phone_number: formData.get('phone') as string,
                  email: (formData.get('email') as string) || '',
                  message: (formData.get('message') as string) || ''
                };
                
                try {
                  const response = await API.post('/auth/contact/submit/', data);
                  const result = response.data;
                  
                  if (result && result.success) {
                    const successMessage = result.message || 'Thank you! Our team will contact you soon.';
                    setIsSubmitting(false);
                    
                    // Reset form if it still exists
                    if (contactFormRef.current) {
                      contactFormRef.current.reset();
                    }
                    
                    alert(successMessage);
                    
                    // Small delay before closing to ensure alert is processed
                    setTimeout(() => {
                      setIsExpertOpen(false);
                    }, 100);
                  } else {
                    const errorMsg = result?.error || result?.detail || 
                                    (result?.errors ? JSON.stringify(result.errors) : 'Failed to submit. Please try again.');
                    console.error('Contact form error:', result);
                    alert(errorMsg);
                    setIsSubmitting(false);
                  }
                } catch (error: any) {
                  console.error('Contact form error:', error);
                  const errorMessage = error?.response?.data?.error || 
                                     error?.response?.data?.detail ||
                                     error?.message || 
                                     'Network error. Please try again later.';
                  alert(`Failed to submit: ${errorMessage}`);
                  setIsSubmitting(false);
                }
              }}
            >
              <div className={styles.formGroup}>
                <input type="text" name="name" placeholder="Full Name" className={styles.inputField} required disabled={isSubmitting} />
              </div>
              <div className={styles.formGroup}>
                <input type="text" name="pincode" placeholder="Pincode" className={styles.inputField} required disabled={isSubmitting} />
              </div>
              <div className={styles.formGroup}>
                <input type="tel" name="phone" placeholder="Phone Number" className={styles.inputField} required disabled={isSubmitting} />
              </div>
              <div className={styles.formGroup}>
                <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'SUBMIT'}
                </button>
              </div>
            </form>

            <div className={styles.visitBanner}>
              <strong>Visit Us In Person</strong>
            </div>
          </div>
        </div>
      )}
      </div>


      {/* Bottom Banner */}
      <div className={styles.bannerContainer}>
        <img
          src={bottomBanner?.imageUrl || 'https://ii1.pepperfry.com/assets/a08eed1c-bbbd-4e8b-b381-07df5fbfe959.jpg'}
          alt={bottomBanner?.altText || 'Sixpine Banner'}
          className={styles.bannerImage}
        />
      </div>

    </div>


  );
};
    

export default HeroSection;