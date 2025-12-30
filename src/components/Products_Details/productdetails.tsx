import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useNotification } from "../../context/NotificationContext";
import { advertisementAPI, wishlistAPI, addressAPI } from "../../services/api";
import styles from "./productdetails.module.css";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCheckCircle,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { AiOutlineInfoCircle } from "react-icons/ai";
import ShareModal from "../ShareModal";
import OfferInfoModal from "./OfferInfoModal";

interface ProductDetailsProps {
  product: any;
  onVariantChange?: (variant: any) => void;
}

const ProductDetails = ({ product, onVariantChange }: ProductDetailsProps) => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { addToCart, state } = useApp();
  const { showError, showWarning } = useNotification();
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<{ title: string; description: string } | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<{ city: string; postal_code: string } | null>(null);

  // Amazon-style zoom feature states
  const [isZooming, setIsZooming] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const mainImageRef = useRef<HTMLImageElement>(null);
  const imageSectionContainerRef = useRef<HTMLDivElement>(null);
  const detailsSectionRef = useRef<HTMLDivElement>(null);
  const zoomPanelRef = useRef<HTMLDivElement>(null);
  const [zoomPanelTop, setZoomPanelTop] = useState(0);

  // Zoom configuration
  const LENS_SIZE = 180; // Size of the lens square in pixels
  const ZOOM_FACTOR = 2.5; // How much to zoom in

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

  // Amazon-style zoom handlers
  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    setIsZooming(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageWrapperRef.current || !mainImageRef.current || !imageSectionContainerRef.current) return;

    const wrapperRect = imageWrapperRef.current.getBoundingClientRect();
    const imageRect = mainImageRef.current.getBoundingClientRect();
    const containerRect = imageSectionContainerRef.current.getBoundingClientRect();

    // Update zoom panel top position to follow image wrapper
    const topOffset = wrapperRect.top - containerRect.top;
    setZoomPanelTop(topOffset);

    // Calculate mouse position relative to image
    const mouseX = e.clientX - imageRect.left;
    const mouseY = e.clientY - imageRect.top;

    // Calculate lens position (centered on cursor)
    let lensX = mouseX - LENS_SIZE / 2;
    let lensY = mouseY - LENS_SIZE / 2;

    // Constrain lens within image bounds
    const maxLensX = imageRect.width - LENS_SIZE;
    const maxLensY = imageRect.height - LENS_SIZE;

    lensX = Math.max(0, Math.min(lensX, maxLensX));
    lensY = Math.max(0, Math.min(lensY, maxLensY));

    // Calculate lens position relative to wrapper (for positioning the lens element)
    const lensLeft = lensX + (imageRect.left - wrapperRect.left);
    const lensTop = lensY + (imageRect.top - wrapperRect.top);

    setLensPosition({ x: lensLeft, y: lensTop });

    // Calculate zoom background position (percentage)
    const zoomX = (lensX / imageRect.width) * 100;
    const zoomY = (lensY / imageRect.height) * 100;

    setZoomPosition({ x: zoomX, y: zoomY });
  };

  // Get variant_id from URL params if present
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

  // Track which attribute was changed by user (not by auto-selection)
  const userChangedAttribute = useRef<'color' | 'size' | 'pattern' | 'quality' | null>(null);
  const isAutoSelecting = useRef(false);
  const prevSelections = useRef({ color: '', size: '', pattern: '', quality: '' });

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

  // Smart auto-selection: When user selects one attribute, find first matching variant and auto-select all other attributes
  const findFirstMatchingVariant = (attributeType: 'color' | 'size' | 'pattern' | 'quality', value: string) => {
    if (variants.length === 0) return null;

    return variants.find((v: any) => {
      if (attributeType === 'color') {
        return (v.color?.name || v.color_name) === value;
      } else if (attributeType === 'size') {
        return v.size === value;
      } else if (attributeType === 'pattern') {
        return v.pattern === value;
      } else if (attributeType === 'quality') {
        return v.quality === value;
      }
      return false;
    });
  };

  // Auto-select all other attributes when one attribute is changed by user
  useEffect(() => {
    if (variants.length === 0 || isAutoSelecting.current) {
      // Update prevSelections even if we're auto-selecting
      prevSelections.current = {
        color: selectedColor,
        size: selectedSize,
        pattern: selectedPattern,
        quality: selectedQuality
      };
      return;
    }

    // Check if this is a user-initiated change (not auto-selection)
    if (!userChangedAttribute.current) {
      // Update prevSelections
      prevSelections.current = {
        color: selectedColor,
        size: selectedSize,
        pattern: selectedPattern,
        quality: selectedQuality
      };
      return;
    }

    const changedAttr = userChangedAttribute.current;
    let matchingVariant = null;

    // Find first variant matching the changed attribute
    if (changedAttr === 'color' && selectedColor && selectedColor !== prevSelections.current.color) {
      matchingVariant = findFirstMatchingVariant('color', selectedColor);
    } else if (changedAttr === 'size' && selectedSize && selectedSize !== prevSelections.current.size) {
      matchingVariant = findFirstMatchingVariant('size', selectedSize);
    } else if (changedAttr === 'pattern' && selectedPattern && selectedPattern !== prevSelections.current.pattern) {
      matchingVariant = findFirstMatchingVariant('pattern', selectedPattern);
    } else if (changedAttr === 'quality' && selectedQuality && selectedQuality !== prevSelections.current.quality) {
      matchingVariant = findFirstMatchingVariant('quality', selectedQuality);
    }

    if (matchingVariant) {
      isAutoSelecting.current = true;

      // Auto-select all other attributes from this variant
      const variantColor = matchingVariant.color?.name || matchingVariant.color_name || '';
      const variantSize = matchingVariant.size || '';
      const variantPattern = matchingVariant.pattern || '';
      const variantQuality = matchingVariant.quality || '';

      if (variantColor && variantColor !== selectedColor && changedAttr !== 'color') {
        setSelectedColor(variantColor);
      }
      if (variantSize && variantSize !== selectedSize && changedAttr !== 'size') {
        setSelectedSize(variantSize);
      }
      if (variantPattern && variantPattern !== selectedPattern && changedAttr !== 'pattern') {
        setSelectedPattern(variantPattern);
      }
      if (variantQuality && variantQuality !== selectedQuality && changedAttr !== 'quality') {
        setSelectedQuality(variantQuality);
      }

      // Update prevSelections and reset flags
      prevSelections.current = {
        color: variantColor || selectedColor,
        size: variantSize || selectedSize,
        pattern: variantPattern || selectedPattern,
        quality: variantQuality || selectedQuality
      };

      // Reset flag after state updates
      setTimeout(() => {
        isAutoSelecting.current = false;
        userChangedAttribute.current = null;
      }, 0);
    } else {
      // Update prevSelections even if no match found
      prevSelections.current = {
        color: selectedColor,
        size: selectedSize,
        pattern: selectedPattern,
        quality: selectedQuality
      };
      userChangedAttribute.current = null;
    }
  }, [selectedColor, selectedSize, selectedPattern, selectedQuality, variants]);

  // Find selected variant based on selections - must match ALL selected criteria exactly
  const findSelectedVariant = useMemo(() => {
    if (variants.length === 0) return null;

    // Find exact match for all selected criteria
    // Only return variant if ALL selected attributes match exactly
    const exactMatch = variants.find((v: any) => {
      const variantColor = v.color?.name || v.color_name || '';
      const variantSize = v.size || '';
      const variantPattern = v.pattern || '';
      const variantQuality = v.quality || '';

      // All selected attributes must match exactly
      const colorMatch = !selectedColor || variantColor === selectedColor;
      const sizeMatch = !selectedSize || variantSize === selectedSize;
      const patternMatch = !selectedPattern || variantPattern === selectedPattern;
      const qualityMatch = !selectedQuality || variantQuality === selectedQuality;

      return colorMatch && sizeMatch && patternMatch && qualityMatch;
    });

    // Return exact match only - no fallback to prevent incorrect stock display
    return exactMatch || null;
  }, [variants, selectedColor, selectedSize, selectedPattern, selectedQuality]);

  const selectedVariant = findSelectedVariant;

  // Update URL when selected variant changes
  useEffect(() => {
    if (selectedVariant && selectedVariant.id && slug) {
      const currentVariantId = searchParams.get('variant');
      const newVariantId = selectedVariant.id.toString();

      // Only update URL if variant ID has changed
      if (currentVariantId !== newVariantId) {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('variant', newVariantId);

        // Update URL without page reload
        navigate(`/products-details/${slug}?${newSearchParams.toString()}`, { replace: true });
      }
    }
  }, [selectedVariant, slug, navigate, searchParams]);

  // Notify parent component when selected variant changes
  useEffect(() => {
    if (onVariantChange && selectedVariant) {
      onVariantChange(selectedVariant);
    }
  }, [selectedVariant, onVariantChange]);

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
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Fetch default address
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (!state.isAuthenticated) {
        setDefaultAddress(null);
        return;
      }
      try {
        const response = await addressAPI.getAddresses();
        const addressesData = Array.isArray(response.data) 
          ? response.data 
          : (response.data.results || response.data.data || []);
        
        const addresses = Array.isArray(addressesData) ? addressesData : [];
        const defaultAddr = addresses.find((addr: any) => addr.is_default) || addresses[0];
        
        if (defaultAddr && defaultAddr.city && defaultAddr.postal_code) {
          setDefaultAddress({
            city: defaultAddr.city,
            postal_code: defaultAddr.postal_code
          });
        } else {
          setDefaultAddress(null);
        }
      } catch (error) {
        console.error('Error fetching default address:', error);
        setDefaultAddress(null);
      }
    };
    fetchDefaultAddress();
  }, [state.isAuthenticated]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!state.isAuthenticated || !product?.id) return;
      try {
        const response = await wishlistAPI.getWishlist();
        if (response.data && response.data.results) {
          const wishlistIds = response.data.results.map((item: any) => item.product?.id || item.product_id);
          setIsInWishlist(wishlistIds.includes(product.id));
        }
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };
    checkWishlistStatus();
  }, [state.isAuthenticated, product?.id]);

  // Sync image section container height with details section
  useEffect(() => {
    const syncHeights = () => {
      if (imageSectionContainerRef.current && detailsSectionRef.current) {
        const detailsHeight = detailsSectionRef.current.offsetHeight;
        imageSectionContainerRef.current.style.height = `${detailsHeight}px`;
      }
    };

    // Sync on mount and when content changes
    syncHeights();
    
    // Use ResizeObserver to sync when details section height changes
    const resizeObserver = new ResizeObserver(() => {
      syncHeights();
    });

    if (detailsSectionRef.current) {
      resizeObserver.observe(detailsSectionRef.current);
    }

    // Also sync on window resize
    window.addEventListener('resize', syncHeights);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncHeights);
    };
  }, [product, selectedVariant]);

  // Update zoom panel position to follow image wrapper on scroll
  useEffect(() => {
    const updateZoomPanelPosition = () => {
      if (imageWrapperRef.current && imageSectionContainerRef.current && isZooming) {
        const wrapperRect = imageWrapperRef.current.getBoundingClientRect();
        const containerRect = imageSectionContainerRef.current.getBoundingClientRect();
        
        // Calculate top position relative to container
        const topOffset = wrapperRect.top - containerRect.top;
        setZoomPanelTop(topOffset);
      }
    };

    // Update on scroll and resize
    window.addEventListener('scroll', updateZoomPanelPosition, true);
    window.addEventListener('resize', updateZoomPanelPosition);

    // Initial update
    updateZoomPanelPosition();

    return () => {
      window.removeEventListener('scroll', updateZoomPanelPosition, true);
      window.removeEventListener('resize', updateZoomPanelPosition);
    };
  }, [isZooming]);

  // Update zoom panel position when zooming starts
  useEffect(() => {
    if (isZooming && imageWrapperRef.current && imageSectionContainerRef.current) {
      const wrapperRect = imageWrapperRef.current.getBoundingClientRect();
      const containerRect = imageSectionContainerRef.current.getBoundingClientRect();
      const topOffset = wrapperRect.top - containerRect.top;
      setZoomPanelTop(topOffset);
    }
  }, [isZooming]);

  const handleWishlist = async () => {
    if (!state.isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!product?.id) return;

    setWishlistLoading(true);
    try {
      if (isInWishlist) {
        const response = await wishlistAPI.getWishlist();
        if (response.data && response.data.results) {
          const wishlistItem = response.data.results.find(
            (item: any) => (item.product?.id || item.product_id) === product.id
          );
          if (wishlistItem) {
            await wishlistAPI.removeFromWishlist(wishlistItem.id);
            setIsInWishlist(false);
          }
        }
      } else {
        await wishlistAPI.addToWishlist(product.id);
        setIsInWishlist(true);
      }
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (error: any) {
      console.error('Wishlist error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to update wishlist';
      showError(errorMsg);
    } finally {
      setWishlistLoading(false);
    }
  };

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
  //       title: "10 Days Replacement",
  //       text: "You can replace this product within 10 days of delivery if it has defects.",
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
            <button className={styles.modalCloseBtn} onClick={closeImageModal} aria-label="Close">
              <svg className={styles.closeIcon} fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>

            <div className={styles.modalContent}>
              <div className={styles.modalBody}>
                {/* Left Side - Main Image */}
                <div className={styles.modalImageSection}>
                  <div className={styles.modalImageWrapper}>
                <img
                  src={mainImage}
                      className={styles.modalMainImage} 
                      alt="Main product view"
                  onContextMenu={handleContextMenu}
                  draggable={false}
                />
                    {/* Amazon logo overlay */}
                    <div className={styles.amazonLogoOverlay}>
                      <svg width="24" height="24" viewBox="0 0 56 54">
                        <rect fill="#001e36" width="56" height="54" rx="9.9"/>
                        <path fill="#31a8ff" d="M11.6 37.7V14.1h7.1a13.9 13.9 0 0 1 4.7.7 8.2 8.2 0 0 1 3.1 1.9 7.2 7.2 0 0 1 1.7 2.6 8.7 8.7 0 0 1 .5 3 8.2 8.2 0 0 1-1.4 4.9 7.7 7.7 0 0 1-3.7 2.8 14.7 14.7 0 0 1-5.2.9h-3.3v7.3h-4zm5.1-19.5v7.7h2.1a8.7 8.7 0 0 0 2.6-.4 4 4 0 0 0 1.9-1.2 3.6 3.6 0 0 0 .7-2.4 3.7 3.7 0 0 0-.5-2 3.5 3.5 0 0 0-1.5-1.3 6.9 6.9 0 0 0-2.7-.5h-2.6zM43.5 24.4a13 13 0 0 0-2.7-.8 11.7 11.7 0 0 0-2.6-.3 4.8 4.8 0 0 0-1.4.2 1.2 1.2 0 0 0-.7.4 1.2 1.2 0 0 0-.2.6 1 1 0 0 0 .2.6 2.5 2.5 0 0 0 .8.6c.4.3 1 .5 1.6.8a16.1 16.1 0 0 1 3.5 1.7 5.4 5.4 0 0 1 1.8 1.9 5.1 5.1 0 0 1 .5 2.4 5.3 5.3 0 0 1-.9 3 5.8 5.8 0 0 1-2.6 2.1 10.4 10.4 0 0 1-4.2.7 15 15 0 0 1-3.1-.3 11.5 11.5 0 0 1-2.5-.7v-3.8l.1-.2a.2.2 0 0 1 .2 0 10.8 10.8 0 0 0 3 1.1 11.7 11.7 0 0 0 2.7.4 4.2 4.2 0 0 0 1.9-.3 1 1 0 0 0 .6-1 1.2 1.2 0 0 0-.6-.9 9.2 9.2 0 0 0-2.2-1.1 13.6 13.6 0 0 1-3.3-1.7 5.6 5.6 0 0 1-1.7-1.9 5.1 5.1 0 0 1-.5-2.4 5.3 5.3 0 0 1 .8-2.8 5.6 5.6 0 0 1 2.5-2.1 7.6 7.6 0 0 1 3.7-.9c1 0 2 0 3.1.1a10.6 10.6 0 0 1 2.4.8l.2.2v4l-.1.2z"/>
                      </svg>
                    </div>
                  </div>
              </div>

                {/* Right Side - Product Info & Thumbnails */}
                <div className={styles.modalSidebar}>
                  <h2 className={styles.modalProductTitle}>
                    {selectedVariant?.title || product?.title || "Product Title"}
                  </h2>

                  <div className={styles.modalVariantInfo}>
                    {selectedVariant?.specifications?.find((s: any) => s.name?.toLowerCase() === 'style') && (
                      <div>
                        Style Name: <span className={styles.modalVariantValue}>
                          {selectedVariant.specifications.find((s: any) => s.name?.toLowerCase() === 'style')?.value || 'N/A'}
                        </span>
                      </div>
                    )}
                    {selectedColor && (
                      <div>
                        Pattern Name: <span className={styles.modalVariantValue}>{selectedColor}</span>
                      </div>
                    )}
                    {selectedPattern && (
                      <div>
                        Pattern: <span className={styles.modalVariantValue}>{selectedPattern}</span>
                      </div>
                    )}
                    {selectedQuality && (
                      <div>
                        Quality: <span className={styles.modalVariantValue}>{selectedQuality}</span>
                      </div>
                    )}
                    {selectedSize && (
                      <div>
                        Size: <span className={styles.modalVariantValue}>{selectedSize}</span>
                      </div>
                    )}
                  </div>

                  <div className={styles.modalThumbnailGrid}>
                {images.map((img: string, index: number) => (
                      <div
                    key={index}
                        className={`${styles.modalThumbnailBox} ${mainImage === img ? styles.modalThumbnailActive : ""}`}
                    onClick={() => handleImageClick(img)}
                      >
                        <div 
                          className={styles.modalThumbnailImage}
                          style={{ backgroundImage: `url(${img})` }}
                  />
                      </div>
                ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb - Amazon style */}
      <nav className={styles.breadcrumb}>
        <a href="/">{product?.category?.parent_category?.name || "Home & Kitchen"}</a>
        <span className={styles.breadcrumbSeparator}>›</span>
        <a href="/products">{product?.category?.name || "Furniture"}</a>
        <span className={styles.breadcrumbSeparator}>›</span>
        <a href={`/products?subcategory=${product?.subcategory?.id || ''}`}>{product?.subcategory?.name || "Living Room Furniture"}</a>
        <span className={styles.breadcrumbSeparator}>›</span>
        <span className={styles.breadcrumbCurrent} title={selectedVariant?.title || product?.title || "Product Name"}>
          {truncateTitle(selectedVariant?.title || product?.title || "Sofas & Couches", 40)}
        </span>
      </nav>

      <div className={styles.mainLayout}>
        {/* Image Section with Zoom */}
        <div className={styles.imageSectionContainer} ref={imageSectionContainerRef}>
          <div className={styles.imageSection}>
            <div
              className={styles.imageWrapper}
              ref={imageWrapperRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onMouseMove={handleMouseMove}
            >
              <div className={styles.shareButton} onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(true); }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="#0F1111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="16,6 12,2 8,6" stroke="#0F1111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="2" x2="12" y2="15" stroke="#0F1111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <img
                ref={mainImageRef}
                src={mainImage}
                alt="Product"
                className={styles.mainImage}
                onClick={openImageModal}
                onContextMenu={handleContextMenu}
                draggable={false}
              />
              {/* Zoom Lens Overlay */}
              {isZooming && (
                <div
                  className={styles.zoomLens}
                  style={{
                    left: `${lensPosition.x}px`,
                    top: `${lensPosition.y}px`,
                    width: `${LENS_SIZE}px`,
                    height: `${LENS_SIZE}px`,
                  }}
                />
              )}
            </div>

            {/* Click to see full view - Amazon style */}
            <div className={styles.clickToView} onClick={openImageModal}>
              Click to see full view
            </div>

            {/* Thumbnails below the main image - Amazon style horizontal row */}
            <div className={styles.thumbnailsContainer}>
              <div className={styles.thumbnails}>
                {images.slice(0, 6).map((img: string, index: number) => (
                  <div
                    key={index}
                    className={`${styles.thumbnailWrapper} ${mainImage === img ? styles.activeThumbWrapper : ""}`}
                    onMouseEnter={() => setMainImage(img)}
                    onClick={() => setMainImage(img)}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className={styles.thumbnail}
                      onContextMenu={handleContextMenu}
                      draggable={false}
                    />
                  </div>
                ))}
                {images.length > 6 && (
                  <div
                    className={styles.thumbnailWrapper}
                    onClick={openImageModal}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={styles.moreThumbnailsBox}>
                      <span className={styles.moreThumbnailsText}>+{images.length - 6}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Zoom Panel - Amazon Style (appears on right side) */}
          {isZooming && (
            <div
              ref={zoomPanelRef}
              className={styles.zoomPanel}
              style={{
                backgroundImage: `url(${mainImage})`,
                backgroundSize: `${ZOOM_FACTOR * 100}%`,
                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                top: `${zoomPanelTop}px`,
              }}
            />
          )}
        </div>

        {/* PART 2 - MIDDLE DETAILS */}
        <div className={styles.details} ref={detailsSectionRef}>
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
              <div className={styles.optionGroup}>
                <strong className={styles.optionLabel}>Color:</strong>
                <div className={styles.optionButtons}>
                {availableOptions.colors.map((color: string, index: number) => (
                  <button
                    key={`color-${index}-${color}`}
                    className={selectedColor === color ? styles.active : ""}
                    onClick={() => {
                      userChangedAttribute.current = 'color';
                      setSelectedColor(color);
                    }}
                  >
                    {color}
                  </button>
                ))}
                </div>
              </div>
            )}
            {availableOptions.sizes.length > 0 && (
              <div className={styles.optionGroup}>
                <strong className={styles.optionLabel}>Size:</strong>
                <div className={styles.optionButtons}>
                {availableOptions.sizes.map((size: string, index: number) => (
                  <button
                    key={`size-${index}-${size}`}
                    className={selectedSize === size ? styles.active : ""}
                    onClick={() => {
                      userChangedAttribute.current = 'size';
                      setSelectedSize(size);
                    }}
                  >
                    {size}
                  </button>
                ))}
                </div>
              </div>
            )}
            {availableOptions.patterns.length > 0 && (
              <div className={styles.optionGroup}>
                <strong className={styles.optionLabel}>Pattern:</strong>
                <div className={styles.optionButtons}>
                {availableOptions.patterns.map((pattern: string, index: number) => (
                  <button
                    key={`pattern-${index}-${pattern}`}
                    className={selectedPattern === pattern ? styles.active : ""}
                    onClick={() => {
                      userChangedAttribute.current = 'pattern';
                      setSelectedPattern(pattern);
                    }}
                  >
                    {pattern}
                  </button>
                ))}
                </div>
              </div>
            )}
            {availableOptions.qualities.length > 0 && (
              <div className={styles.optionGroup}>
                <strong className={styles.optionLabel}>Quality:</strong>
                <div className={styles.optionButtons}>
                {availableOptions.qualities.map((quality: string, index: number) => (
                  <button
                    key={`quality-${index}-${quality}`}
                    className={selectedQuality === quality ? styles.active : ""}
                    onClick={() => {
                      userChangedAttribute.current = 'quality';
                      setSelectedQuality(quality);
                    }}
                  >
                    {quality}
                  </button>
                ))}
                </div>
              </div>
            )}
            {selectedVariant ? (
              <div className={styles.variantInfo} key={`stock-${selectedVariant.id || 'default'}`}>
                <small className="text-muted">
                  {selectedVariant.stock_quantity > 0
                    ? `${selectedVariant.stock_quantity} in stock`
                    : 'Out of stock'}
                </small>
              </div>
            ) : (
              <div className={styles.variantInfo}>
                <small className="text-muted">Please select all options</small>
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
                <strong>Brand:&nbsp;</strong> {product?.brand || "Sixpine"}
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
                      <strong>{spec.name}:&nbsp;</strong> {spec.value}
                    </div>
                  ))
              ) : (
                product?.specifications
                  ?.filter((spec: any) => spec.name?.toLowerCase() !== 'brand')
                  ?.map((spec: any, index: number) => (
                    <div key={`product-spec-${spec.id || index}`} className={styles.detailCard}>
                      <strong>{spec.name}:&nbsp;</strong> {spec.value}
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
          {/* Purchase Box */}
          <div className={styles.cartSummary}>
            {/* Big Price */}
            <div className={styles.bigPrice}>
              ₹{(selectedVariant?.price || product?.price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>

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

            {/* Location */}
            <div className={styles.locationInfo}>
              <FaMapMarkerAlt className={styles.locationIcon} />
              <span>
                Delivering to{' '}
                <strong>
                  {defaultAddress ? `${defaultAddress.city} ${defaultAddress.postal_code}` : 'Select location'}
                </strong>
                {' - '}
                <a 
                  href="#" 
                  className={styles.updateLink}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/your-addresses');
                  }}
                >
                  Update location
                </a>
              </span>
            </div>

            {/* Seller Info */}
            <div className={styles.sellerInfo}>
              <span className={styles.sellerLabel}>Shipper / Seller:</span> <span className={styles.sellerName}>{product?.brand || "WOODIE TECHIE ART"}</span>
            </div>

            {/* Payment Info */}
            <div className={styles.paymentInfo}>
              <span className={styles.paymentLabel}>Payment:</span> <span className={styles.paymentText}>Secure transaction</span>
            </div>

            {/* Quantity Selector */}
            <div className={styles.quantitySelector}>
              <label htmlFor="quantity-select">Quantity:</label>
              <select
                id="quantity-select"
                className={styles.quantitySelect}
                value={cartQty}
                onChange={(e) => setCartQty(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <button className={styles.addCart} onClick={handleAddToCart}>Add to Cart</button>
            <button className={styles.buyNow} onClick={handleBuyNow}>Buy Now</button>
            <button 
              className={styles.wishlistBtn} 
              onClick={handleWishlist}
              disabled={wishlistLoading}
            >
              {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            </button>
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