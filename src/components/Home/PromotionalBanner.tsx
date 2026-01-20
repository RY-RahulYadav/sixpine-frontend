import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Package, CheckCircle, Building2 } from 'lucide-react';
import styles from './PromotionalBanner.module.css';
import { homepageAPI } from '../../services/api';

interface InfoBadge {
  icon: string;
  iconUrl?: string;
  topText: string;
  bottomText: string;
}

interface PromotionalBannerData {
  isActive: boolean;
  // Left Box - Sale Timer or Text
  useTimerMode: boolean;
  // Timer Mode fields
  saleText: string;
  saleTextColor: string;
  countdownEndDate: string;
  timerTextColor: string;
  endsInText: string;
  endsInColor: string;
  // Text Mode fields
  mainHeadingText: string;
  mainHeadingColor: string;
  subHeadingText: string;
  subHeadingColor: string;
  leftBoxBackground: string;
  // Middle Section - Offer
  showOfferSection: boolean;
  offerIconUrl: string;
  offerIconColor: string;
  offerText: string;
  offerTextColor: string;
  discountText: string;
  discountTextColor: string;
  // Right Section - Info Badges
  showInfoBadges: boolean;
  infoBadges: InfoBadge[];
  badgeIconColor: string;
  badgeTextColor: string;
  // Container
  containerBackground: string;
  innerBoxBackground: string;
  // Navigate URL
  navigateUrl: string;
}

const defaultData: PromotionalBannerData = {
  isActive: true,
  // Left Box - Sale Timer or Text
  useTimerMode: false,
  // Timer Mode fields
  saleText: 'SALE',
  saleTextColor: '#d60f0f',
  countdownEndDate: '2026-02-15T23:59:59',
  timerTextColor: '#d60f0f',
  endsInText: 'ENDS IN',
  endsInColor: '#d60f0f',
  // Text Mode fields
  mainHeadingText: 'New Year Sale',
  mainHeadingColor: '#d60f0f',
  subHeadingText: 'Limited Time Offer',
  subHeadingColor: '#374151',
  leftBoxBackground: '#ffffff',
  // Middle Section - Offer
  showOfferSection: true,
  offerIconUrl: '',
  offerIconColor: '#f97316',
  offerText: 'Visit Your Nearest Store & Get Extra UPTO',
  offerTextColor: '#6b7280',
  discountText: '₹ 25,000 INSTANT DISCOUNT',
  discountTextColor: '#f97316',
  // Right Section - Info Badges
  showInfoBadges: true,
  infoBadges: [
    { icon: 'Users', iconUrl: '', topText: '20 Lakh+', bottomText: 'Customers' },
    { icon: 'Package', iconUrl: '', topText: 'Free', bottomText: 'Delivery' },
    { icon: 'CheckCircle', iconUrl: '', topText: 'Best', bottomText: 'Warranty*' },
    { icon: 'Building2', iconUrl: '', topText: '15 Lakh sq. ft.', bottomText: 'Mfg. Unit' }
  ],
  badgeIconColor: '#f97316',
  badgeTextColor: '#374151',
  // Container
  containerBackground: '#f0f0f0',
  innerBoxBackground: '#ffffff',
  // Navigate URL
  navigateUrl: ''
};

const iconMap: { [key: string]: any } = {
  Users,
  Package,
  CheckCircle,
  Building2,
  MapPin
};

const PromotionalBanner = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<PromotionalBannerData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('promotional-banner');
        
        if (response.data && response.data.content) {
          setData({
            isActive: response.data.content.isActive !== undefined ? response.data.content.isActive : defaultData.isActive,
            useTimerMode: response.data.content.useTimerMode !== undefined ? response.data.content.useTimerMode : defaultData.useTimerMode,
            saleText: response.data.content.saleText || defaultData.saleText,
            saleTextColor: response.data.content.saleTextColor || defaultData.saleTextColor,
            countdownEndDate: response.data.content.countdownEndDate || defaultData.countdownEndDate,
            timerTextColor: response.data.content.timerTextColor || defaultData.timerTextColor,
            endsInText: response.data.content.endsInText || defaultData.endsInText,
            endsInColor: response.data.content.endsInColor || defaultData.endsInColor,
            mainHeadingText: response.data.content.mainHeadingText || defaultData.mainHeadingText,
            mainHeadingColor: response.data.content.mainHeadingColor || defaultData.mainHeadingColor,
            subHeadingText: response.data.content.subHeadingText || defaultData.subHeadingText,
            subHeadingColor: response.data.content.subHeadingColor || defaultData.subHeadingColor,
            leftBoxBackground: response.data.content.leftBoxBackground || defaultData.leftBoxBackground,
            showOfferSection: response.data.content.showOfferSection !== undefined ? response.data.content.showOfferSection : defaultData.showOfferSection,
            offerIconUrl: response.data.content.offerIconUrl || defaultData.offerIconUrl,
            offerIconColor: response.data.content.offerIconColor || defaultData.offerIconColor,
            offerText: response.data.content.offerText || defaultData.offerText,
            offerTextColor: response.data.content.offerTextColor || defaultData.offerTextColor,
            discountText: response.data.content.discountText || defaultData.discountText,
            discountTextColor: response.data.content.discountTextColor || defaultData.discountTextColor,
            showInfoBadges: response.data.content.showInfoBadges !== undefined ? response.data.content.showInfoBadges : defaultData.showInfoBadges,
            infoBadges: response.data.content.infoBadges || defaultData.infoBadges,
            badgeIconColor: response.data.content.badgeIconColor || defaultData.badgeIconColor,
            badgeTextColor: response.data.content.badgeTextColor || defaultData.badgeTextColor,
            containerBackground: response.data.content.containerBackground || defaultData.containerBackground,
            innerBoxBackground: response.data.content.innerBoxBackground || defaultData.innerBoxBackground,
            navigateUrl: response.data.content.navigateUrl || defaultData.navigateUrl
          });
        }
      } catch (error) {
        console.error('Error fetching promotional banner data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Countdown timer logic
  const calculateTimeLeft = () => {
    const endDate = new Date(data.countdownEndDate);
    const difference = +endDate - +new Date();
    
    if (difference > 0) {
      return {
        days: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
        minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0'),
        seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, '0')
      };
    }
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  };

  useEffect(() => {
    if (!data.isActive || !data.useTimerMode) return;
    
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [data.countdownEndDate, data.isActive, data.useTimerMode]);

  if (loading) {
    return (
      <div className={styles.bannerContainer} style={{ padding: '20px', textAlign: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!data.isActive) {
    return null;
  }

  const handleClick = () => {
    if (data.navigateUrl && data.navigateUrl.trim()) {
      if (data.navigateUrl.startsWith('http')) {
        window.location.href = data.navigateUrl;
      } else {
        navigate(data.navigateUrl);
      }
    }
  };

  return (
    <div className={styles.bannerContainer}>
      <div 
        className={styles.bannerWrapper}
        style={{ backgroundColor: data.containerBackground }}
      >
        <div className={styles.bannerContent}>
          {/* Left Box - Sale Timer and Offer */}
          <div 
            className={styles.leftCombinedBox}
            style={{ backgroundColor: data.innerBoxBackground }}
          >
            {/* Timer or Text Section */}
            <div className={styles.timerBox}>
              {data.useTimerMode ? (
                <>
                  <div className={styles.timerNumbers} style={{ color: data.timerTextColor }}>
                    <span className={styles.saleLabel} style={{ color: data.saleTextColor }}>
                      {data.saleText}
                    </span>
                    <span>{timeLeft.days}</span>
                    <span className={styles.colon}>:</span>
                    <span>{timeLeft.hours}</span>
                    <span className={styles.colon}>:</span>
                    <span>{timeLeft.minutes}</span>
                    <span className={styles.colon}>:</span>
                    <span>{timeLeft.seconds}</span>
                  </div>
                  <div className={styles.timerLabels}>
                    <span className={styles.endsIn} style={{ color: data.endsInColor }}>
                      {data.endsInText}
                    </span>
                    <span>DAYS</span>
                    <span>HRS</span>
                    <span>MINS</span>
                    <span>SECS</span>
                  </div>
                </>
              ) : (
                <div className={styles.textModeContent}>
                  <span className={styles.mainHeading} style={{ color: data.mainHeadingColor }}>
                    {data.mainHeadingText}
                  </span>
                  <span className={styles.subHeading} style={{ color: data.subHeadingColor }}>
                    {data.subHeadingText}
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            {data.showOfferSection && <div className={styles.divider}></div>}

            {/* Offer Section */}
            {data.showOfferSection && (
              <div 
                className={styles.offerBox}
                onClick={handleClick}
                style={{ cursor: data.navigateUrl ? 'pointer' : 'default' }}
              >
                <div className={styles.offerIcon} style={{ color: data.offerIconColor }}>
                  {data.offerIconUrl ? (
                    <img 
                      src={data.offerIconUrl} 
                      alt="Offer icon" 
                      style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                      onError={(e) => {
                        // Fallback to default icon if image fails to load
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<svg></svg>';
                      }}
                    />
                  ) : (
                    <MapPin size={32} />
                  )}
                </div>
                <div className={styles.offerContent}>
                  <span className={styles.offerText} style={{ color: data.offerTextColor }}>
                    {data.offerText}
                  </span>
                  <span className={styles.discountText} style={{ color: data.discountTextColor }}>
                    {data.discountText}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Box - Info Badges */}
          {data.showInfoBadges && (
            <div 
              className={styles.infoBadgesBox}
              style={{ backgroundColor: data.innerBoxBackground }}
            >
              {data.infoBadges.map((badge, index) => {
                const IconComponent = iconMap[badge.icon] || Users;
                return (
                  <div key={index} className={styles.badgeItem}>
                    <div className={styles.badgeIcon} style={{ color: data.badgeIconColor }}>
                      {badge.iconUrl ? (
                        <img 
                          src={badge.iconUrl} 
                          alt={`${badge.topText} icon`} 
                          style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                          onError={(e) => {
                            // Fallback to default icon if image fails to load
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <IconComponent size={28} />
                      )}
                    </div>
                    <div className={styles.badgeTextContent} style={{ color: data.badgeTextColor }}>
                      <span className={styles.badgeTopText}>{badge.topText}</span>
                      <span className={styles.badgeBottomText}>{badge.bottomText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;
