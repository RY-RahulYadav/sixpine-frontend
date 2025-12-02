import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { advertisementAPI } from '../../services/api';

interface Advertisement {
  id: number;
  title: string;
  description?: string;
  image: string;
  button_text: string;
  button_link?: string;
  discount_percentage?: number;
}

const AdBanner: React.FC = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await advertisementAPI.getActiveAdvertisements();
        console.log('AdBanner API Response:', response.data);
        
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
          console.log('AdBanner advertisements loaded:', ads.length);
        } else {
          console.log('AdBanner: No advertisements found');
          setAdvertisements([]);
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        setAdvertisements([]);
      }
    };

    fetchAdvertisements();
  }, []);

  useEffect(() => {
    if (advertisements.length > 1) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % advertisements.length);
          setIsAnimating(false);
        }, 1000); // Half of animation duration
      }, 5000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, [advertisements.length]);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (advertisements.length > 0) {
      const currentAd = advertisements[currentIndex];
      if (currentAd.button_link) {
        if (currentAd.button_link.startsWith('http')) {
          window.open(currentAd.button_link, '_blank');
        } else {
          navigate(`/products-details/${currentAd.button_link}`);
        }
      }
    }
  };

  const getDisplayText = () => {
    if (advertisements.length === 0) {
      return 'Advertisement for new / Best selling';
    }

    const currentAd = advertisements[currentIndex];
    if (currentAd.discount_percentage) {
      return `Special Offer: ${currentAd.discount_percentage}% Off`;
    }
    return currentAd.title || 'Advertisement for new / Best selling';
  };

  const getCurrentAd = () => {
    if (advertisements.length === 0) return null;
    return advertisements[currentIndex];
  };

  const currentAd = getCurrentAd();

  return (
    <div 
      className="p-2 w-100 bg-light"
      style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Text - Center with animation */}
      <div
        style={{
          overflow: 'hidden',
          position: 'relative',
          minWidth: '200px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <strong
          key={currentIndex}
          style={{
            margin: 0,
            position: 'absolute',
            whiteSpace: 'nowrap',
            animation: isAnimating ? 'slideRightToLeft 0.6s ease-in-out' : 'none',
            animationFillMode: 'forwards'
          }}
        >
          {getDisplayText()}
        </strong>
      </div>

      {/* Button - Right side of text */}
      {currentAd && (
        <button
          onClick={handleButtonClick}
          style={{
            backgroundColor: '#ffa41c',
            border: '1px solid #ff8f00',
            color: '#0f1111',
            padding: '6px 16px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fa8900';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffa41c';
          }}
        >
          {currentAd.button_text || 'Check Now'}
        </button>
      )}

      <style>{`
        @keyframes slideRightToLeft {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AdBanner;
