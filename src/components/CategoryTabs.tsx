import React from 'react';
import { Link } from 'react-router-dom';

const CategoryTabs: React.FC = () => {
  const allCategories = [
    {
      title: 'Sofas',
      items: ['3 Seater', '2 Seater', '1 Seater', 'Sofa Sets']
    },
    {
      title: 'Recliners',
      items: ['1 Seater Recliners', '2 Seater Recliners', '3 Seater Recliners', 'Recliners Sets']
    },
    {
      title: 'Rocking Chairs',
      items: ['Modern', 'Relax in Motion', 'Classic']
    },
    {
      title: 'Beds',
      items: ['Queen Size Beds', 'King Size Beds', 'Single Size Beds', 'Poster Beds', 'Folding Beds']
    },
    {
      title: 'Centre Tables',
      items: ['Coffee Tables', 'Coffee Tables Set']
    },
    {
      title: 'Sectional Sofas',
      items: ['LHS Sectionals', 'RHS Sectionals', 'Corner Sofas']
    },
    {
      title: 'Chaise Loungers',
      items: ['3 Seater Chaise Loungers', '2 Seater Chaise Loungers']
    },
    {
      title: 'Chairs',
      items: ['Arm Chairs', 'Accent Chairs']
    },
    {
      title: 'Sofa Cum Beds',
      items: ['Pull Out Type', 'Convertible Type']
    },
    {
      title: 'Shoe Racks',
      items: ['Shoe Cabinets', 'Shoe Racks']
    },
    {
      title: 'Settees & Benches',
      items: ['Settees', 'Benches']
    },
    {
      title: 'Ottomans',
      items: ['Ottomans with Storage', 'Decorative Ottomans']
    },
    {
      title: 'Sofa Chairs',
      items: ['Lounge Chairs', 'Wing Chairs']
    },
    {
      title: 'Stool & Pouffes',
      items: ['Foot Stools', 'Seating Stools', 'Pouffes']
    }
  ];

  const sofaCouchesMega = [
    {
      title: 'Sofa & Couches',
      items: ['3 Seater Sofas', '2 Seater Sofas', '1 Seater Sofas', 'Sofa Sets']
    },
    {
      title: 'Sectional Sofas',
      items: ['Sectional Sofas', 'LHS Sectional Sofas', 'RHS Sectional Sofas', 'Corner Sofas']
    },
    {
      title: 'Chaise Loungers',
      items: ['3 Seater Chaise Loungers', '2 Seater Chaise Loungers']
    }
  ];

  // Convert sofa chairs into a mini mega-menu (two columns) matching the provided image
  const sofaChairsMega = [
    {
      title: 'Sofa Chairs',
      items: ['Lounge Chairs', 'Wing Chairs']
    },
    {
      title: 'Chairs',
      items: ['Arm Chairs', 'Accent Chairs']
    }
  ];

  // Rocking Chairs as a mini mega-menu (single column) matching the provided image
  const rockingChairsMega = [
    {
      title: 'Rocking Chairs',
      items: ['Modern', 'Relax in Motion', 'Classic']
    }
  ];

  // Ottomans as a mini mega-menu with two columns matching the provided image
  const ottomansMega = [
    {
      title: 'Ottomans',
      items: ['Ottomans with Storage', 'Decorative Ottomans']
    },
    {
      title: 'Stool & Pouffes',
      items: ['Foot Stools', 'Seating Stools', 'Pouffes']
    }
  ];

  // Beds & Sofa Cum Beds as a two-column mega-menu matching the provided image
  const bedsMega = [
    {
      title: 'Beds',
      items: ['Queen Size Beds', 'King Size Beds', 'Single Size Beds', 'Poster Beds', 'Folding Beds']
    },
    {
      title: 'Sofa Cum Beds',
      items: ['Pull Out Type', 'Convertible Type']
    }
  ];

  // Luxury as single-column mega-menu (items from provided image)
  const luxuryMega = [
    {
      title: 'Luxury',
      items: ['Sofas', 'Recliners', 'Chairs', 'Coffee Tables', 'Bedside Tables', 'Beds', 'Chest of Drawers']
    }
  ];

  return (
    <div className="tab-categories mb-0">
      <ul className="nav nav-tabs d-none d-md-flex">
        {/* All Category with Mega Menu */}
        <li className="nav-item dropdown">
          <Link className="nav-link" to="/">All</Link>
          <div className="dropdown-menu mega-menu mega-menu-all">
            <div className="mega-menu-grid">
              {allCategories.map((category, idx) => (
                <div className="mega-menu-column" key={idx}>
                  <h6 className="mega-menu-title">{category.title}</h6>
                  <ul className="mega-menu-list">
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link to={`/products?search=${encodeURIComponent(item)}`}>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>

        {/* Sofa & Couches as Mega Menu (same style as All) */}
        <li className="nav-item dropdown">
          <Link className="nav-link" to="/products?search=Sofa">Sofa & Couches</Link>
          <div className="dropdown-menu mega-menu">
            <div className="mega-menu-grid">
              {sofaCouchesMega.map((col, idx) => (
                <div className="mega-menu-column" key={idx}>
                  <h6 className="mega-menu-title">{col.title}</h6>
                  <ul className="mega-menu-list">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link to={`/products?search=${encodeURIComponent(item)}`}>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>

        {/* Sofa Chairs as mini Mega Menu (same design as All) */}
        <li className="nav-item dropdown">
          <Link className="nav-link" to="/products?search=Sofa Chairs">Sofa Chairs</Link>
          <div className="dropdown-menu mega-menu">
            <div className="mega-menu-grid">
              {sofaChairsMega.map((col, idx) => (
                <div className="mega-menu-column" key={idx}>
                  <h6 className="mega-menu-title">{col.title}</h6>
                  <ul className="mega-menu-list">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link to={`/products?search=${encodeURIComponent(item)}`}>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>

        {/* Rocking Chairs as mini Mega Menu (same design as All) */}
        <li className="nav-item dropdown">
          <Link className="nav-link" to="/products?search=Rocking Chairs">Rocking Chairs</Link>
          <div className="dropdown-menu mega-menu">
            <div className="mega-menu-grid">
              {rockingChairsMega.map((col, idx) => (
                <div className="mega-menu-column" key={idx}>
                  <h6 className="mega-menu-title">{col.title}</h6>
                  <ul className="mega-menu-list">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link to={`/products?search=${encodeURIComponent(item)}`}>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>

        {/* Ottomans as mini Mega Menu (same design as All) */}
        <li className="nav-item dropdown">
          <Link className="nav-link" to="/products?search=Ottomans">Ottomans</Link>
          <div className="dropdown-menu mega-menu">
            <div className="mega-menu-grid">
              {ottomansMega.map((col, idx) => (
                <div className="mega-menu-column" key={idx}>
                  <h6 className="mega-menu-title">{col.title}</h6>
                  <ul className="mega-menu-list">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link to={`/products?search=${encodeURIComponent(item)}`}>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>

        {/* Beds & Sofa Cum Beds as mega-menu (two columns) */}
        <li className="nav-item dropdown">
          <Link className="nav-link" to="/products?search=Beds">Beds & Sofa Cum Beds</Link>
          <div className="dropdown-menu mega-menu">
            <div className="mega-menu-grid">
              {bedsMega.map((col, idx) => (
                <div className="mega-menu-column" key={idx}>
                  <h6 className="mega-menu-title">{col.title}</h6>
                  <ul className="mega-menu-list">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link to={`/products?search=${encodeURIComponent(item)}`}>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>

        {/* Luxury as mini Mega Menu (matching design) */}
        <li className="nav-item dropdown">
          <Link className="nav-link" to="/products?search=Luxury">Luxury</Link>
          <div className="dropdown-menu mega-menu">
            <div className="mega-menu-grid">
              {luxuryMega.map((col, idx) => (
                <div className="mega-menu-column" key={idx}>
                  <h6 className="mega-menu-title">{col.title}</h6>
                  <ul className="mega-menu-list">
                    {col.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <Link to={`/products?search=${encodeURIComponent(item)}`}>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>
      </ul>

      {/* Mobile/Tablet Scrollable Tabs */}
      <div className="scroll-tabs d-flex d-md-none">
        <Link to="/">All</Link>
        <Link to="/products?search=Sofa">Sofa & Couches</Link>
        <Link to="/products?search=Sofa Chairs">Sofa Chairs</Link>
        <Link to="/products?search=Rocking Chairs">Rocking Chairs</Link>
        <Link to="/products?search=Ottomans">Ottomans</Link>
        <Link to="/products?search=Beds">Beds & Sofa Cum Beds</Link>
        <Link to="/products?search=Luxury">Luxury</Link>
      </div>
    </div>
  );
};

export default CategoryTabs;
