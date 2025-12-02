import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useNotification } from "../../context/NotificationContext";
import { advertisementAPI } from "../../services/api";
import styles from "./productdetails.module.css";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import ShareModal from "../ShareModal";
import OfferInfoModal from "./OfferInfoModal";

interface ProductDetailsProps {
  product: any;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const navigate = useNavigate();
  const { addToCart, state } = useApp();
  const { showError, showWarning } = useNotification();
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<{ title: string; description: string } | null>(null);

  // Fetch active advertisements
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await advertisementAPI.getActiveAdvertisements();
        console.log('Advertisement API Response:', response.data);
        
        // Handle different response structures
        let ads = [];
        if (response.data) {
          if (Array.isArray(response.data)) {
            ads = response.data;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            ads = response.data.results;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            ads = response.data.data;
          }
        }
        
        if (ads.length > 0) {
          setAdvertisements(ads);
          setCurrentAdIndex(0);
          console.log('Advertisements loaded:', ads.length);
        } else {
          console.log('No advertisements found');
          setAdvertisements([]);
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setAdvertisements([]);
      }
    };

    fetchAdvertisements();
  }, []);

  // Rotate advertisements every 3 seconds if there are more than one
  useEffect(() => {
    if (advertisements.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
      }, 3000); // Change every 3 seconds

      return () => clearInterval(interval);
    } else if (advertisements.length === 1) {
      // Ensure index is 0 if only one ad
      setCurrentAdIndex(0);
    }
  }, [advertisements.length]);

  // Modal open/close with scroll control
  const openImageModal = () => {
    setIsImageModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleImageClick = (img: string) => {
    setMainImage(img);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Get variant_id from URL params if present
  const [searchParams] = useSearchParams();
  const variantIdFromUrl = searchParams.get('variant') ? parseInt(searchParams.get('variant')!) : null;

  // Extract variant options from product.variants
  const variants = product?.variants || [];
  
  // Get unique colors, sizes, patterns, qualities from variants
  const availableColors = Array.from(new Set(variants.map((v: any) => v.color?.name || v.color_name).filter(Boolean)));
  const availableSizes = Array.from(new Set(variants.map((v: any) => v.size).filter(Boolean)));
  const availablePatterns = Array.from(new Set(variants.map((v: any) => v.pattern).filter(Boolean)));
  const availableQualities = Array.from(new Set(variants.map((v: any) => v.quality).filter(Boolean)));

  // Fallback to available_colors if variants not available (backward compatibility)
  const colors = availableColors.length > 0 ? availableColors : 
    (product?.available_colors?.map((c: any) => c.color__name || c.name) || []);
  const sizes = availableSizes.length > 0 ? availableSizes : (product?.available_sizes || []);
  const patterns = availablePatterns.length > 0 ? availablePatterns : (product?.available_patterns || []);
  const qualities = availableQualities.length > 0 ? availableQualities : (product?.available_qualities || []);

  // Auto-select variant from URL if provided
  const getInitialVariant = () => {
    if (variantIdFromUrl && variants.length > 0) {
      const variantFromUrl = variants.find((v: any) => v.id === variantIdFromUrl);
      if (variantFromUrl) {
      return {
        color: variantFromUrl.color?.name || '',
        size: variantFromUrl.size || '',
        pattern: variantFromUrl.pattern || '',
        quality: variantFromUrl.quality || ''
      };
      }
    }
    // Default to first active variant
    const firstActiveVariant = variants.find((v: any) => v.is_active) || variants[0];
    if (firstActiveVariant) {
      return {
        color: firstActiveVariant.color?.name || colors[0] || "",
        size: firstActiveVariant.size || sizes[0] || "",
        pattern: firstActiveVariant.pattern || patterns[0] || "",
        quality: firstActiveVariant.quality || qualities[0] || ""
      };
    }
    // Fallback to first available
    return {
      color: colors[0] || "",
      size: sizes[0] || "",
      pattern: patterns[0] || "",
      quality: qualities[0] || ""
    };
  };

  const initialVariant = getInitialVariant();

  // State for options
  const [selectedColor, setSelectedColor] = useState<string>(initialVariant.color);
  const [selectedSize, setSelectedSize] = useState<string>(initialVariant.size);
  const [selectedPattern, setSelectedPattern] = useState<string>(initialVariant.pattern);
  const [selectedQuality, setSelectedQuality] = useState<string>(initialVariant.quality);

  // Get ALL unique options from ALL variants (show everything, don't filter)
  const availableOptions = useMemo(() => {
    if (variants.length === 0) {
      return {
        colors: colors,
        sizes: sizes,
        patterns: patterns,
        qualities: qualities
      };
    }

    // Show ALL unique colors from ALL variants
    const allAvailableColors = Array.from(new Set(
      variants.map((v: any) => v.color?.name || v.color_name).filter(Boolean)
    ));

    // Show ALL unique sizes from ALL variants
    const allAvailableSizes = Array.from(new Set(
      variants.map((v: any) => v.size).filter(Boolean)
    ));

    // Show ALL unique patterns from ALL variants
    const allAvailablePatterns = Array.from(new Set(
      variants.map((v: any) => v.pattern).filter(Boolean)
    ));

    // Show ALL unique qualities from ALL variants
    const allAvailableQualities = Array.from(new Set(
      variants.map((v: any) => v.quality).filter(Boolean)
    ));

    return {
      colors: allAvailableColors.length > 0 ? allAvailableColors : colors,
      sizes: allAvailableSizes.length > 0 ? allAvailableSizes : sizes,
      patterns: allAvailablePatterns.length > 0 ? allAvailablePatterns : patterns,
      qualities: allAvailableQualities.length > 0 ? allAvailableQualities : qualities
    };
  }, [variants, colors, sizes, patterns, qualities]);

  // Auto-select compatible options when a selection changes
  // When user selects a color, auto-select the first available size, pattern, and quality from that color's variants
  useEffect(() => {
    if (variants.length === 0) return;
    if (!selectedColor) return;

    // Find the first variant with the selected color
    const firstMatchingVariant = variants.find((v: any) => 
      (v.color?.name || v.color_name) === selectedColor
    );
    
    if (firstMatchingVariant) {
      // Auto-select size if not already selected or if current selection doesn't match
      if (!selectedSize && firstMatchingVariant.size) {
        setSelectedSize(firstMatchingVariant.size);
      } else if (selectedSize) {
        // Check if selected size is available for this color
        const colorVariants = variants.filter((v: any) => 
          (v.color?.name || v.color_name) === selectedColor
        );
        const availableSizesForColor = Array.from(new Set(
          colorVariants.map((v: any) => v.size).filter(Boolean)
        ));
        if (!availableSizesForColor.includes(selectedSize) && firstMatchingVariant.size) {
          setSelectedSize(firstMatchingVariant.size);
        }
      }
    }
  }, [selectedColor, variants]);

  // Auto-select pattern when color or size changes
  useEffect(() => {
    if (variants.length === 0) return;
    if (!selectedColor) return;

    let matchingVariants = variants.filter((v: any) => 
      (v.color?.name || v.color_name) === selectedColor
    );
    
    if (selectedSize) {
      matchingVariants = matchingVariants.filter((v: any) => 
        v.size === selectedSize || (!v.size && !selectedSize)
      );
    }
    
    if (matchingVariants.length === 0) return;
    
    // Auto-select pattern from first matching variant
    const firstVariant = matchingVariants[0];
    if (firstVariant && firstVariant.pattern) {
      if (!selectedPattern) {
        setSelectedPattern(firstVariant.pattern);
      } else {
        // Check if selected pattern is available
        const availablePatterns = Array.from(new Set(
          matchingVariants.map((v: any) => v.pattern).filter(Boolean)
        ));
        if (!availablePatterns.includes(selectedPattern) && firstVariant.pattern) {
          setSelectedPattern(firstVariant.pattern);
        }
      }
    }
  }, [selectedColor, selectedSize, variants]);

  // Auto-select quality when color, size, or pattern changes
  useEffect(() => {
    if (variants.length === 0) return;
    if (!selectedColor) return;

    let matchingVariants = variants.filter((v: any) => 
      (v.color?.name || v.color_name) === selectedColor
    );
    
    if (selectedSize) {
      matchingVariants = matchingVariants.filter((v: any) => 
        v.size === selectedSize || (!v.size && !selectedSize)
      );
    }
    
    if (selectedPattern) {
      matchingVariants = matchingVariants.filter((v: any) => 
        v.pattern === selectedPattern || (!v.pattern && !selectedPattern)
      );
    }
    
    if (matchingVariants.length === 0) return;
    
    // Auto-select quality from first matching variant
    const firstVariant = matchingVariants[0];
    if (firstVariant && firstVariant.quality) {
      if (!selectedQuality) {
        setSelectedQuality(firstVariant.quality);
      } else {
        // Check if selected quality is available
        const availableQualities = Array.from(new Set(
          matchingVariants.map((v: any) => v.quality).filter(Boolean)
        ));
        if (!availableQualities.includes(selectedQuality) && firstVariant.quality) {
          setSelectedQuality(firstVariant.quality);
        }
      }
    }
  }, [selectedColor, selectedSize, selectedPattern, variants]);

  // Find selected variant based on selections - must match ALL selected criteria exactly
  const findSelectedVariant = useMemo(() => {
    if (variants.length === 0) return null;
    
    // Find exact match for all selected criteria
    const exactMatch = variants.find((v: any) => {
      const colorMatch = !selectedColor || (v.color?.name || v.color_name) === selectedColor;
      const sizeMatch = !selectedSize || v.size === selectedSize || (!v.size && !selectedSize);
      const patternMatch = !selectedPattern || v.pattern === selectedPattern || (!v.pattern && !selectedPattern);
      const qualityMatch = !selectedQuality || v.quality === selectedQuality || (!v.quality && !selectedQuality);
      
      return colorMatch && sizeMatch && patternMatch && qualityMatch;
    });
    
    // Return exact match or fallback to first variant
    return exactMatch || variants[0];
  }, [variants, selectedColor, selectedSize, selectedPattern, selectedQuality]);

  const selectedVariant = findSelectedVariant;
  
  // Use variant price (required - variants are the actual products)
  const cartPrice = selectedVariant?.price || 0;
  
  // Get images from selected variant or first variant, then fallback
  const images = selectedVariant?.images?.length > 0
    ? selectedVariant.images.map((img: any) => img.image)
    : selectedVariant?.image
    ? [selectedVariant.image]
    : product?.variants?.[0]?.image
    ? [product.variants[0].image]
    : product?.main_image
    ? [product.main_image]
    : [
    "https://m.media-amazon.com/images/I/61zwcSVl3YL._SX679_.jpg",
    "https://m.media-amazon.com/images/I/614YRo2ONvL._SX679_.jpg",
   "https://m.media-amazon.com/images/I/81B1YNHqwCL._SL1500_.jpg",
    "https://m.media-amazon.com/images/I/717-CNGEtTL._SX679_.jpg",
    "https://m.media-amazon.com/images/I/71HBQDGu1EL._SX679_.jpg"
  ];
  
  const [mainImage, setMainImage] = useState(images[0] || '');
  
  // Update main image when variant changes
  useEffect(() => {
    if (selectedVariant) {
      const variantImages = selectedVariant.images?.length > 0
        ? selectedVariant.images.map((img: any) => img.image)
        : selectedVariant.image
        ? [selectedVariant.image]
        : [];
      if (variantImages.length > 0) {
        setMainImage(variantImages[0]);
      }
    }
  }, [selectedVariant]);

  // Cart Summary
  const [cartQty, setCartQty] = useState(1);

  // Modal for info icons
  interface ModalContent {
    title: string;
    text: string;
    buttons: string[];
  }
  
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  // const handleOpenModal = (type: string) => {
  //   if (type === "delivery") {
  //     setModalContent({
  //       title: "Free Delivery",
  //       text: "Get free doorstep delivery on all orders above ₹20,000.",
  //       buttons: ["Got it", "Shop More"],
  //     });
  //   } else if (type === "replacement") {
  //     setModalContent({
  //       title: "7 Days Replacement",
  //       text: "You can replace this product within 7 days of delivery if it has defects.",
  //       buttons: ["Understood", "See Policy"],
  //     });
  //   } else if (type === "secure") {
  //     setModalContent({
  //       title: "Secure Transaction",
  //       text: "Your payment is protected by end-to-end encryption and secure gateways.",
  //       buttons: ["Okay", "Know More"],
  //     });
  //   }
  // };

  const handleCloseModal = () => {
    setModalContent(null);
  };

  const handleAddToCart = async () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product?.id) {
      try {
        // If product has variants, variant_id is required
        if (variants.length > 0 && !selectedVariant) {
          showWarning('Please select a variant (color, size, or pattern)');
          return;
        }

        await addToCart(product.id, cartQty, selectedVariant?.id);
        // Sidebar will open automatically via context
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to add to cart';
        showError(errorMsg);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product?.id) {
      try {
        // If product has variants, variant_id is required
        if (variants.length > 0 && !selectedVariant) {
          showWarning('Please select a variant (color, size, or pattern)');
          return;
        }

        await addToCart(product.id, cartQty, selectedVariant?.id);
        navigate('/cart');
      } catch (error: any) {
        console.error('Error adding to cart:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Failed to add to cart';
        showError(errorMsg);
      }
    }
  };

  // Truncate product title for breadcrumb
  const truncateTitle = (title: string, maxLength: number = 60): string => {
    if (!title || title.length <= maxLength) {
      return title;
    }
    return title.substring(0, maxLength).trim() + '...';
  };

  return (
    <div className={styles.productPage}>
      {/* Image Modal - Fullscreen */}
      {isImageModalOpen && (
        <div 
          className={styles.imageModalOverlay}
          onClick={closeImageModal}
        >
          <div 
            className={styles.imageModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.closeBtn} onClick={closeImageModal}>
              ✖
            </button>
            
            <div className={styles.modalLayout}>
              {/* Large Image on Left */}
              <div className={styles.modalImageContainer}>
                <img 
                  src={mainImage} 
                  alt="Zoomed" 
                  className={styles.zoomedImage}
                  onContextMenu={handleContextMenu}
                  draggable={false}
                />
              </div>

              {/* Thumbnails on Right */}
              <div className={styles.modalThumbnailsContainer}>
                {images.map((img: string, index: number) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumb ${index}`}
                    className={`${styles.modalThumbnail} ${
                      mainImage === img ? styles.modalThumbnailActive : ""
                    }`}
                    onClick={() => handleImageClick(img)}
                    onContextMenu={handleContextMenu}
                    draggable={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <a href="/">Home</a>
        <a href="/products">Product</a>
        <span title={selectedVariant?.title || product?.title || "Product Name"}>
          {truncateTitle(selectedVariant?.title || product?.title || "Product Name", 60)}
        </span>
      </div>

      <div className={styles.mainLayout}>
        {/* Image Section */}
        <div className={styles.imageSection}>
          <div className={styles.imageWrapper}>
            <div className={styles.shareButton} onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(true); }}>
              <i className="fa-solid fa-share"></i>
            </div>
            <img
              src={mainImage}
              alt="Product"
              className={styles.mainImage}
              onClick={openImageModal}
              onContextMenu={handleContextMenu}
              draggable={false}
            />
          </div>

          {/* Thumbnails below the main image */}
          <div className={styles.thumbnails}>
            {images.map((img: string, index: number) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`${styles.thumbnail} ${
                  mainImage === img ? styles.activeThumb : ""
                }`}
                onClick={() => setMainImage(img)}
                onContextMenu={handleContextMenu}
                draggable={false}
              />
            ))}
          </div>
        </div>

        {/* PART 2 - MIDDLE DETAILS */}
        <div className={styles.details}>
          <h2 className={styles.title}>
            {selectedVariant?.title || product?.title || "PRODUCT TITLE GOES HERE"}
          </h2>
         <p className={styles.brand}>
  <span className={styles.brandLabel}>Brand:</span> <span className={styles.brandName}>{product?.brand || "Sixpine"}</span>
</p>


          {/* Ratings */}
          <div className={styles.ratings}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= Math.floor(product?.average_rating || 0) ? (
                  <FaStar />
                ) : star === Math.ceil(product?.average_rating || 0) && (product?.average_rating || 0) % 1 !== 0 ? (
                  <FaStarHalfAlt />
                ) : (
                  <FaRegStar />
                )}
              </span>
            ))}
            <span>({product?.review_count || 0} Ratings)</span>
          </div>

          {/* Price */}
        <div className={styles.priceBox}>
  {/* Actual Price */}
  <div className={styles.priceRow}>
    {selectedVariant?.old_price && selectedVariant.old_price > selectedVariant.price && (
      <span className={styles.discountBadge}>-{Math.round(((selectedVariant.old_price - selectedVariant.price) / selectedVariant.old_price) * 100)}%</span>
    )}
    <p className={styles.emiPrice}>
    ₹{(selectedVariant?.price || 0).toLocaleString()}
  </p>
  

  </div>

  {/* Discount & Final Price */}
 
  {/* MRP */}
  {selectedVariant?.old_price && selectedVariant.old_price > selectedVariant.price && (
  <p className={styles.mrp}>
      M.R.P.: <span className={styles.strike}>₹{selectedVariant.old_price.toLocaleString()}</span>
  </p>
  )}
  
  {/* EMI Info Note */}
  <div className={styles.emiInfoNote}>
    <AiOutlineInfoCircle className={styles.infoIcon} />
    <span>EMI option available after checkout</span>
  </div>
</div>


          <h4 className={styles.offersTitle}>Available Offers</h4>
          <ul className={styles.offers}>
            {/* Screen Offers from Product */}
            {product?.screen_offer && Array.isArray(product.screen_offer) && product.screen_offer.length > 0 && (
              <>
                {product.screen_offer.map((offer: any, index: number) => {
                  // Handle both string (backward compatibility) and object formats
                  const offerTitle = typeof offer === 'string' ? offer : (offer.title || offer.text || 'Offer');
                  const offerDescription = typeof offer === 'string' 
                    ? 'No additional details available for this offer.' 
                    : (offer.description || 'No additional details available for this offer.');
                  
                  return (
                    <li key={`screen-offer-${index}`} className={styles.offerItem}>
                      <FaCheckCircle className={styles.checkIcon} />
                      <span className={styles.offerText}>{offerTitle}</span>
                      <AiOutlineInfoCircle 
                        className={styles.infoIconRight} 
                        onClick={() => setSelectedOffer({ title: offerTitle, description: offerDescription })}
                      />
                    </li>
                  );
                })}
              </>
            )}
            
            {/* Default offers if no screen offers exist or as additional offers */}
            {/* {(!product?.screen_offer || !Array.isArray(product.screen_offer) || product.screen_offer.length === 0) && (
              <>
                <li>
                  <BsTagFill className={styles.greenIcon} />
                  10% off on using XYZ card
                </li>
                <li>
                  <BsTagFill className={styles.greenIcon} />
                  Shipping on orders above ₹20,000
                </li>
              </>
            )} */}
            
            
           
            
          </ul>

          {/* Options */}
          <div className={styles.options}>
            {availableOptions.colors.length > 0 && (
              <div>
                <strong>Color: </strong>
                {availableOptions.colors.map((color: string, index: number) => (
                  <button
                    key={`color-${index}-${color}`}
                    className={selectedColor === color ? styles.active : ""}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            )}
            {availableOptions.sizes.length > 0 && (
              <div>
                <strong>Size: </strong>
                {availableOptions.sizes.map((size: string, index: number) => (
                  <button
                    key={`size-${index}-${size}`}
                    className={selectedSize === size ? styles.active : ""}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            )}
            {availableOptions.patterns.length > 0 && (
              <div>
                <strong>Pattern: </strong>
                {availableOptions.patterns.map((pattern: string, index: number) => (
                  <button
                    key={`pattern-${index}-${pattern}`}
                    className={selectedPattern === pattern ? styles.active : ""}
                    onClick={() => setSelectedPattern(pattern)}
                  >
                    {pattern}
                  </button>
                ))}
              </div>
            )}
            {availableOptions.qualities.length > 0 && (
              <div>
                <strong>Quality: </strong>
                {availableOptions.qualities.map((quality: string, index: number) => (
                  <button
                    key={`quality-${index}-${quality}`}
                    className={selectedQuality === quality ? styles.active : ""}
                    onClick={() => setSelectedQuality(quality)}
                  >
                    {quality}
                  </button>
                ))}
              </div>
            )}
            {selectedVariant && (
              <div className={styles.variantInfo} key={`stock-${selectedVariant.id || 'default'}`}>
                <small className="text-muted">
                  {selectedVariant.stock_quantity > 0 
                    ? `${selectedVariant.stock_quantity} in stock`
                    : 'Out of stock'}
                </small>
              </div>
            )}
          </div>

          {/* Info Modal */}
          {modalContent && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={handleCloseModal}>
                  ✖
                </button>
                <h2>{modalContent.title}</h2>
                <p>{modalContent.text}</p>
                <div className={styles.modalButtons}>
                  {modalContent.buttons.map((btn, idx) => (
                    <button key={idx} onClick={handleCloseModal}>
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={styles.productDetailsContent}>
            <h3>Key Details</h3>
            <div 
              className={styles.keyDetailsGrid} 
              key={`key-details-${selectedVariant?.id || selectedColor || selectedSize || selectedPattern || selectedQuality || 'default'}`}
            >
              <div className={styles.detailCard}>
                <strong>Brand:</strong> {product?.brand || "Sixpine"}
              </div>
              {selectedVariant?.specifications && selectedVariant.specifications.length > 0 ? (
                [...selectedVariant.specifications]
                  .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                  .filter((spec: any) => spec.name?.toLowerCase() !== 'brand')
                  .map((spec: any, index: number) => (
                    <div 
                      key={`variant-spec-${selectedVariant?.id || 'v'}-${spec.id || index}-${selectedColor || ''}-${selectedSize || ''}`} 
                      className={styles.detailCard}
                    >
                      <strong>{spec.name}:</strong> {spec.value}
                    </div>
                  ))
              ) : (
                product?.specifications
                ?.filter((spec: any) => spec.name?.toLowerCase() !== 'brand')
                ?.map((spec: any, index: number) => (
                    <div key={`product-spec-${spec.id || index}`} className={styles.detailCard}>
                  <strong>{spec.name}:</strong> {spec.value}
              </div>
                  ))
              )}
            </div>

            <h3>About This Item</h3>
            <ul className={styles.aboutItemList}>
              {product?.about_items && product.about_items.length > 0 ? (
                product.about_items.map((item: any, index: number) => (
                  <li key={index}>{item.item}</li>
                ))
              ) : (
                product?.features?.map((feature: any, index: number) => (
                <li key={index}>{feature.feature}</li>
                ))
              )}
            </ul>

            <button
              className={styles.seeMoreBtn}
              onClick={() => {
                const el = document.getElementById("product-info");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
            >
              See More
            </button>
          </div>
        </div>

        {/* PART 3 - RIGHT SIDEBAR */}
        <div className={styles.sidebar}>
          {/* CART SUMMARY */}
          <div className={styles.cartSummary}>
            <h3>CART SUMMARY</h3>
            {/* Delivery Date */}
            {product?.estimated_delivery_days && (
              <div className={styles.deliveryInfo}>
                <p className={styles.deliveryText}>
                  FREE delivery {(() => {
                    const deliveryDays = product.estimated_delivery_days || 4;
                    const deliveryDate = new Date();
                    deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);
                    
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                    
                    const dayName = days[deliveryDate.getDay()];
                    const day = deliveryDate.getDate();
                    const monthName = months[deliveryDate.getMonth()];
                    
                    return `${dayName}, ${day} ${monthName}`;
                  })()}.
                </p>
              </div>
            )}
            <p>
              {cartQty} x Product Title - ₹{cartPrice.toLocaleString()}
            </p>
            <p>
              <strong>Total: ₹{(cartPrice * cartQty).toLocaleString()}</strong>
            </p>

            <div className={styles.cartControls}>
              <button
                onClick={() => cartQty > 1 && setCartQty(cartQty - 1)}
                className={styles.qtyBtn}
              >
                <FaTrash />
              </button>
              <span className={styles.qty}>{cartQty}</span>
              <button
                onClick={() => setCartQty(cartQty + 1)}
                className={styles.qtyBtn}
              >
                +
              </button>
            </div>

            <button className={styles.addCart} onClick={handleAddToCart}>Add to Cart</button>
            <button className={styles.buyNow} onClick={handleBuyNow}>Buy Now</button>
          </div>

          {/* ADVERTISEMENT */}
          {advertisements.length > 0 && advertisements[currentAdIndex] ? (
            <div className={styles.specialOffer}>
              <img
                key={currentAdIndex}
                src={advertisements[currentAdIndex].image || "https://ochaka.vercel.app/images/products/fashion/product-1.jpg"}
                alt={advertisements[currentAdIndex].title || "Advertisement"}
                style={{
                  transition: 'opacity 0.5s ease-in-out',
                }}
                onContextMenu={handleContextMenu}
                draggable={false}
              />
              <p>
                <strong>
                  {advertisements[currentAdIndex].discount_percentage 
                    ? `Special Offer: ${advertisements[currentAdIndex].discount_percentage}% Off`
                    : advertisements[currentAdIndex].title || 'Special Offer'}
                </strong>
              </p>
              <button 
                className={styles.buyNow} 
                onClick={() => {
                  if (advertisements[currentAdIndex]?.button_link) {
                    if (advertisements[currentAdIndex].button_link.startsWith('http')) {
                      window.open(advertisements[currentAdIndex].button_link, '_blank');
                    } else {
                      navigate(`/products-details/${advertisements[currentAdIndex].button_link}`);
                    }
                  }
                }}
              >
                {advertisements[currentAdIndex].button_text || 'Check Now'}
              </button>
            </div>
          ) : (
            <div className={styles.specialOffer}>
              <img
                src="https://ochaka.vercel.app/images/products/fashion/product-1.jpg"
                alt="Advertisement"
                onContextMenu={handleContextMenu}
                draggable={false}
              />
              <p>
                <strong>Special Offer: 20% Off</strong>
              </p>
              <button className={styles.buyNow}>Check Now</button>
            </div>
          )}
        </div>
       
        
      </div>

      {/* Share Modal */}
      <ShareModal
        show={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      {/* Offer Info Modal */}
      <OfferInfoModal
        show={selectedOffer !== null}
        onClose={() => setSelectedOffer(null)}
        title={selectedOffer?.title || ''}
        description={selectedOffer?.description || ''}
      />
    </div>
  );
};

export default ProductDetails;