import { useState, useEffect } from 'react';
import { Store, Truck, ThumbsUp, BadgeDollarSign, Shield, MapPin, Users, Package, CheckCircle, Building2 } from 'lucide-react';
import styles from './FeatureCard.module.css';
import { homepageAPI } from '../../services/api';

interface FeatureCardData {
  featuresBar: Array<{
    icon: string;
    count: string;
    text: string;
  }>;
  saleTimerActive: boolean;
  countdownEndDate: string;
  offerText: string;
  discountText: string;
  infoBadges: Array<{
    icon: string;
    topText: string;
    bottomText: string;
  }>;
}

const defaultData: FeatureCardData = {
  featuresBar: [
    { icon: "Store", count: "100+", text: "Experience Stores Across<br/>India" },
    { icon: "Truck", count: "350+", text: "Delivery Centers<br/>Across India" },
    { icon: "ThumbsUp", count: "10 Lakh +", text: "Satisfied Customers" },
    { icon: "BadgeDollarSign", count: "Lowest Price", text: "Guarantee" },
    { icon: "Shield", count: "36 Months*", text: "Warranty" },
  ],
  saleTimerActive: true,
  countdownEndDate: "2025-10-01T23:59:59",
  offerText: "Visit Your Nearest Store & Get Extra UPTO",
  discountText: "₹ 25,000 INSTANT DISCOUNT",
  infoBadges: [
    { icon: "Users", topText: "20 Lakh+", bottomText: "Customers" },
    { icon: "Package", topText: "Free", bottomText: "Delivery" },
    { icon: "CheckCircle", topText: "Best", bottomText: "Warranty*" },
    { icon: "Building2", topText: "15 Lakh sq. ft.", bottomText: "Mfg. Unit" },
  ],
};

const iconMap: { [key: string]: any } = {
  Store,
  Truck,
  ThumbsUp,
  BadgeDollarSign,
  Shield,
  MapPin,
  Users,
  Package,
  CheckCircle,
  Building2,
};

const FeaturesAndCTA = () => {
  const [data, setData] = useState<FeatureCardData>(defaultData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await homepageAPI.getHomepageContent('feature-card');
        
        if (response.data && response.data.content) {
          setData({
            featuresBar: response.data.content.featuresBar || defaultData.featuresBar,
            saleTimerActive: response.data.content.saleTimerActive !== undefined ? response.data.content.saleTimerActive : defaultData.saleTimerActive,
            countdownEndDate: response.data.content.countdownEndDate || defaultData.countdownEndDate,
            offerText: response.data.content.offerText || defaultData.offerText,
            discountText: response.data.content.discountText || defaultData.discountText,
            infoBadges: response.data.content.infoBadges || defaultData.infoBadges
          });
        }
      } catch (error) {
        console.error('Error fetching feature card data:', error);
        // Keep default data if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateTimeLeft = () => {
    // Set your target end date here
    const endDate = new Date(data.countdownEndDate);
    const difference = +endDate - +new Date();
    let timeLeft = {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    };

    if (difference > 0) {
      timeLeft = {
        days: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, "0"),
        minutes: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, "0"),
        seconds: String(Math.floor((difference / 1000) % 60)).padStart(2, "0"),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    if (!data.saleTimerActive) {
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [data.saleTimerActive, data.countdownEndDate]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
    );
  }

  return (
    <div className={styles.FeatureCardcontainer}>
      {/* Top Features Bar */}
      <div className={styles.featuresBar}>
        {data.featuresBar.map((feature, index) => {
          const IconComponent = iconMap[feature.icon] || Store;
          return (
            <div key={index} className={styles.featureItem}>
              <div className={styles.iconOrange}>
                <IconComponent className={styles.icon} />
              </div>
              <div>
                <div className={styles.featureCount}>{feature.count}</div>
                <div className={styles.featureText} dangerouslySetInnerHTML={{ __html: feature.text }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA Bar */}
      <div className={styles.ctaBar}>
        {/* Combined Timer and Offer Box */}
        <div className={styles.combinedBox} style={{ display: 'flex', gap: data.saleTimerActive ? 'var(--spacing-md)' : 0 }}>
          {/* Timer - Only show if active */}
          {data.saleTimerActive && (
            <div className={styles.timerBox}>
              <div className={styles.timerNumbers}>
                <div className={styles.saleLabel}>SALE</div>
                <span>{timeLeft.days}</span>
                <span className={styles.colon}>:</span>
                <span>{timeLeft.hours}</span>
                <span className={styles.colon}>:</span>
                <span>{timeLeft.minutes}</span>
                <span className={styles.colon}>:</span>
                <span>{timeLeft.seconds}</span>
              </div>
              <div className={styles.timerLabels}>
                <div className={styles.endsIn}>Ends In</div>
                <span>Days</span>
                <span>Hrs</span>
                <span>Mins</span>
                <span>Secs</span>
              </div>
            </div>
          )}

          {/* Store Offer */}
          <div className={styles.offerBox} style={{ flex: data.saleTimerActive ? 'none' : 1 }}>
            <div className={styles.iconOrange}>
              <MapPin className={styles.iconMedium} />
            </div>
            <div>
              <div className={styles.offerText}>{data.offerText}</div>
              <div className={styles.discountText}>{data.discountText}</div>
            </div>
          </div>
        </div>

        {/* Info Badges */}
        <div className={styles.infoBadges}>
          {data.infoBadges.map((badge, index) => {
            const IconComponent = iconMap[badge.icon] || Users;
            return (
              <div key={index} className={styles.badgeItem}>
                <div className={styles.iconOrange}>
                  <IconComponent className={styles.iconSmall} />
                </div>
                <div className={styles.badgeText}>
                  <div>{badge.topText}</div>
                  <div>{badge.bottomText}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FeaturesAndCTA;