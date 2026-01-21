import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Package, CheckCircle, Building2 } from 'lucide-react';
import styles from './PromotionalBanner.module.css';

interface InfoBadge {
  icon: string;
  iconUrl?: string;
  topText: string;
  bottomText: string;
}

interface PromotionalBannerData {
  isActive: boolean;
  useTimerMode: boolean;
  saleText: string;
  saleTextColor: string;
  countdownEndDate: string;
  timerTextColor: string;
  endsInText: string;
  endsInColor: string;
  mainHeadingText: string;
  mainHeadingColor: string;
  subHeadingText: string;
  subHeadingColor: string;
  leftBoxBackground: string;
  showOfferSection: boolean;
  offerIconUrl: string;
  offerIconColor: string;
  offerText: string;
  offerTextColor: string;
  discountText: string;
  discountTextColor: string;
  showInfoBadges: boolean;
  infoBadges: InfoBadge[];
  badgeIconColor: string;
  badgeTextColor: string;
  containerBackground: string;
  innerBoxBackground: string;
  navigateUrl: string;
}

interface PromotionalBannerProps {
  data?: Partial<PromotionalBannerData> | null;
  isLoading?: boolean;
}

const defaultData: PromotionalBannerData = {
  isActive: true,
  useTimerMode: false,
  saleText: 'SALE',
  saleTextColor: '#d60f0f',
  countdownEndDate: '2026-02-15T23:59:59',
  timerTextColor: '#d60f0f',
  endsInText: 'ENDS IN',
  endsInColor: '#d60f0f',
  mainHeadingText: 'New Year Sale',
  mainHeadingColor: '#d60f0f',
  subHeadingText: 'Limited Time Offer',
  subHeadingColor: '#374151',
  leftBoxBackground: '#ffffff',
  showOfferSection: true,
  offerIconUrl: '',
  offerIconColor: '#f97316',
  offerText: 'Visit Your Nearest Store & Get Extra UPTO',
  offerTextColor: '#6b7280',
  discountText: '₹ 25,000 INSTANT DISCOUNT',
  discountTextColor: '#f97316',
  showInfoBadges: true,
  infoBadges: [
    { icon: 'Users', iconUrl: '', topText: '20 Lakh+', bottomText: 'Customers' },
    { icon: 'Package', iconUrl: '', topText: 'Free', bottomText: 'Delivery' },
    { icon: 'CheckCircle', iconUrl: '', topText: 'Best', bottomText: 'Warranty*' },
    { icon: 'Building2', iconUrl: '', topText: '15 Lakh sq. ft.', bottomText: 'Mfg. Unit' }
  ],
  badgeIconColor: '#f97316',
  badgeTextColor: '#374151',
  containerBackground: '#f0f0f0',
  innerBoxBackground: '#ffffff',
  navigateUrl: ''
};

const iconMap: { [key: string]: any } = {
  Users,
  Package,
  CheckCircle,
  Building2,
  MapPin
};

const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ data: propData, isLoading: _isLoading = false }) => {
  const navigate = useNavigate();

  // Merge prop data with defaults
  const bannerData: PromotionalBannerData = {
    ...defaultData,
    ...(propData || {})
  };

  const [timeLeft, setTimeLeft] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  // Countdown timer logic
  const calculateTimeLeft = () => {
    const endDate = new Date(bannerData.countdownEndDate);
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
    if (!bannerData.isActive || !bannerData.useTimerMode) return;

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [bannerData.countdownEndDate, bannerData.isActive, bannerData.useTimerMode]);

  if (!bannerData.isActive) {
    return null;
  }

  const handleClick = () => {
    if (bannerData.navigateUrl && bannerData.navigateUrl.trim()) {
      if (bannerData.navigateUrl.startsWith('http')) {
        window.location.href = bannerData.navigateUrl;
      } else {
        navigate(bannerData.navigateUrl);
      }
    }
  };

  return (
    <div className={styles.bannerContainer}>
      <div
        className={styles.bannerWrapper}
        style={{ backgroundColor: bannerData.containerBackground }}
      >
        <div className={styles.bannerContent}>
          {/* Left Box - Sale Timer and Offer */}
          <div
            className={styles.leftCombinedBox}
            style={{ backgroundColor: bannerData.innerBoxBackground }}
          >
            {/* Timer or Text Section */}
            <div className={styles.timerBox}>
              {bannerData.useTimerMode ? (
                <>
                  <div className={styles.timerNumbers} style={{ color: bannerData.timerTextColor }}>
                    <span className={styles.saleLabel} style={{ color: bannerData.saleTextColor }}>
                      {bannerData.saleText}
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
                    <span className={styles.endsIn} style={{ color: bannerData.endsInColor }}>
                      {bannerData.endsInText}
                    </span>
                    <span>DAYS</span>
                    <span>HRS</span>
                    <span>MINS</span>
                    <span>SECS</span>
                  </div>
                </>
              ) : (
                <div className={styles.textModeContent}>
                  <span className={styles.mainHeading} style={{ color: bannerData.mainHeadingColor }}>
                    {bannerData.mainHeadingText}
                  </span>
                  <span className={styles.subHeading} style={{ color: bannerData.subHeadingColor }}>
                    {bannerData.subHeadingText}
                  </span>
                </div>
              )}
            </div>

            {/* Divider */}
            {bannerData.showOfferSection && <div className={styles.divider}></div>}

            {/* Offer Section */}
            {bannerData.showOfferSection && (
              <div
                className={styles.offerBox}
                onClick={handleClick}
                style={{ cursor: bannerData.navigateUrl ? 'pointer' : 'default' }}
              >
                <div className={styles.offerIcon} style={{ color: bannerData.offerIconColor }}>
                  {bannerData.offerIconUrl ? (
                    <img
                      src={bannerData.offerIconUrl}
                      alt="Offer icon"
                      style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<svg></svg>';
                      }}
                    />
                  ) : (
                    <MapPin size={32} />
                  )}
                </div>
                <div className={styles.offerContent}>
                  <span className={styles.offerText} style={{ color: bannerData.offerTextColor }}>
                    {bannerData.offerText}
                  </span>
                  <span className={styles.discountText} style={{ color: bannerData.discountTextColor }}>
                    {bannerData.discountText}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Box - Info Badges */}
          {bannerData.showInfoBadges && (
            <div
              className={styles.infoBadgesBox}
              style={{ backgroundColor: bannerData.innerBoxBackground }}
            >
              {bannerData.infoBadges.map((badge, index) => {
                const IconComponent = iconMap[badge.icon] || Users;
                return (
                  <div key={index} className={styles.badgeItem}>
                    <div className={styles.badgeIcon} style={{ color: bannerData.badgeIconColor }}>
                      {badge.iconUrl ? (
                        <img
                          src={badge.iconUrl}
                          alt={`${badge.topText} icon`}
                          style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <IconComponent size={28} />
                      )}
                    </div>
                    <div className={styles.badgeTextContent} style={{ color: bannerData.badgeTextColor }}>
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
