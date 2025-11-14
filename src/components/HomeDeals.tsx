import React from 'react';
import { useNavigate } from 'react-router-dom';

interface DealItem {
  image: string;
  title: string;
  description: string;
}

interface DealSection {
  title: string;
  discount: string;
  items: DealItem[];
}

const HomeDeals: React.FC = () => {
  const navigate = useNavigate();

  const handleGoNow = (title: string) => {
    navigate(`/products?search=${encodeURIComponent(title)}`);
  };

  const dealSections: DealSection[] = [
    {
      title: 'for Home Deals',
      discount: 'Up to 80% Off',
      items: [
        {
          image: 'https://webdori.in/sixpine/assets/img/home-deals/1.avif',
          title: 'Flower Bouquet',
          description: 'Beautiful bouquet to brighten your home.'
        },
        {
          image: 'https://webdori.in/sixpine/assets/img/home-deals/2.avif',
          title: 'Wallpaper',
          description: 'Trendy wallpapers to revamp your walls.'
        },
        {
          image: 'https://webdori.in/sixpine/assets/img/home-deals/3.avif',
          title: 'Bouquet Set',
          description: 'Elegant bouquet collection for occasions.'
        },
        {
          image: 'https://webdori.in/sixpine/assets/img/home-deals/4.avif',
          title: 'Home Decor Bouquet',
          description: 'Perfect design for home decoration.'
        }
      ]
    },
    {
      title: 'for Furniture',
      discount: 'Up to 49% Off',
      items: [
        {
          image: 'https://webdori.in/sixpine/assets/img/furniure/1.webp',
          title: 'Luxury Sofa',
          description: 'Stylish sofa for modern living rooms.'
        },
        {
          image: 'https://webdori.in/sixpine/assets/img/furniure/2.webp',
          title: 'Armchair',
          description: 'Comfortable armchair for daily use.'
        },
        {
          image: 'https://webdori.in/sixpine/assets/img/furniure/3.webp',
          title: 'Coffee Table',
          description: 'Modern table with elegant design.'
        },
        {
          image: 'https://webdori.in/sixpine/assets/img/furniure/4.webp',
          title: 'Desk Lamp',
          description: 'Designer lamp for cozy workspaces.'
        }
      ]
    }
  ];

  return (
    <section className="home-deals container s_pb">
      {dealSections.map((section, sectionIndex) => (
        <div className={`deal-block ${sectionIndex > 0 ? 'mt-4' : ''}`} key={sectionIndex}>
          <h4 className="section-title">
            <span className="highlight-text">{section.discount}</span> {section.title}
          </h4>
          <div className="row g-3">
            {section.items.map((item, itemIndex) => (
              <div className="col-lg-3 col-6" key={itemIndex}>
                <div className="deal-card text-center">
                  <img src={item.image} alt={item.title} className="w-100" />
                  <h6 className="deal-title mt-2">{item.title}</h6>
                  <p className="deal-text small text-muted">{item.description}</p>
                  <div className="go_1">
                    <button 
                      onClick={() => handleGoNow(item.title)} 
                      className="btn btn-warning"
                    >
                      Go Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};

export default HomeDeals;
