import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const CategoryTabs: React.FC = () => {
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveMobileDropdown(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileDropdown = (category: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (activeMobileDropdown === category) {
      setActiveMobileDropdown(null);
      setDropdownPosition(null);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      const maxWidth = Math.min(500, window.innerWidth - 20);
      const left = Math.max(10, Math.min(rect.left, window.innerWidth - maxWidth - 10));
      
      setDropdownPosition({
        top: rect.bottom + scrollTop + 8,
        left: left
      });
      setActiveMobileDropdown(category);
    }
  };
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
      <div className="scroll-tabs d-flex d-md-none" ref={dropdownRef}>
        <div className="mobile-category-item">
          <button 
            className="mobile-category-link"
            onClick={(e) => toggleMobileDropdown('all', e)}
          >
            All
            <i className={`bi bi-chevron-${activeMobileDropdown === 'all' ? 'up' : 'down'} ms-1`}></i>
          </button>
          {activeMobileDropdown === 'all' && dropdownPosition && (
            <div 
              className="mobile-dropdown-menu"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                right: 'auto',
                width: `min(500px, calc(100vw - ${dropdownPosition.left * 2}px))`
              }}
            >
              <div className="mobile-mega-menu-grid">
                {allCategories.map((category, idx) => (
                  <div className="mobile-mega-menu-column" key={idx}>
                    <h6 className="mobile-mega-menu-title">{category.title}</h6>
                    <ul className="mobile-mega-menu-list">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link to={`/products?search=${encodeURIComponent(item)}`} onClick={() => {
                            setActiveMobileDropdown(null);
                            setDropdownPosition(null);
                          }}>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mobile-category-item">
          <button 
            className="mobile-category-link"
            onClick={(e) => toggleMobileDropdown('sofa', e)}
          >
            Sofa & Couches
            <i className={`bi bi-chevron-${activeMobileDropdown === 'sofa' ? 'up' : 'down'} ms-1`}></i>
          </button>
          {activeMobileDropdown === 'sofa' && dropdownPosition && (
            <div 
              className="mobile-dropdown-menu"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                right: 'auto',
                width: `min(500px, calc(100vw - ${dropdownPosition.left * 2}px))`
              }}
            >
              <div className="mobile-mega-menu-grid">
                {sofaCouchesMega.map((col, idx) => (
                  <div className="mobile-mega-menu-column" key={idx}>
                    <h6 className="mobile-mega-menu-title">{col.title}</h6>
                    <ul className="mobile-mega-menu-list">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link to={`/products?search=${encodeURIComponent(item)}`} onClick={() => {
                            setActiveMobileDropdown(null);
                            setDropdownPosition(null);
                          }}>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mobile-category-item">
          <button 
            className="mobile-category-link"
            onClick={(e) => toggleMobileDropdown('sofa-chairs', e)}
          >
            Sofa Chairs
            <i className={`bi bi-chevron-${activeMobileDropdown === 'sofa-chairs' ? 'up' : 'down'} ms-1`}></i>
          </button>
          {activeMobileDropdown === 'sofa-chairs' && dropdownPosition && (
            <div 
              className="mobile-dropdown-menu"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                right: 'auto',
                width: `min(500px, calc(100vw - ${dropdownPosition.left * 2}px))`
              }}
            >
              <div className="mobile-mega-menu-grid">
                {sofaChairsMega.map((col, idx) => (
                  <div className="mobile-mega-menu-column" key={idx}>
                    <h6 className="mobile-mega-menu-title">{col.title}</h6>
                    <ul className="mobile-mega-menu-list">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link to={`/products?search=${encodeURIComponent(item)}`} onClick={() => {
                            setActiveMobileDropdown(null);
                            setDropdownPosition(null);
                          }}>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mobile-category-item">
          <button 
            className="mobile-category-link"
            onClick={(e) => toggleMobileDropdown('rocking', e)}
          >
            Rocking Chairs
            <i className={`bi bi-chevron-${activeMobileDropdown === 'rocking' ? 'up' : 'down'} ms-1`}></i>
          </button>
          {activeMobileDropdown === 'rocking' && dropdownPosition && (
            <div 
              className="mobile-dropdown-menu"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                right: 'auto',
                width: `min(500px, calc(100vw - ${dropdownPosition.left * 2}px))`
              }}
            >
              <div className="mobile-mega-menu-grid">
                {rockingChairsMega.map((col, idx) => (
                  <div className="mobile-mega-menu-column" key={idx}>
                    <h6 className="mobile-mega-menu-title">{col.title}</h6>
                    <ul className="mobile-mega-menu-list">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link to={`/products?search=${encodeURIComponent(item)}`} onClick={() => {
                            setActiveMobileDropdown(null);
                            setDropdownPosition(null);
                          }}>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mobile-category-item">
          <button 
            className="mobile-category-link"
            onClick={(e) => toggleMobileDropdown('ottomans', e)}
          >
            Ottomans
            <i className={`bi bi-chevron-${activeMobileDropdown === 'ottomans' ? 'up' : 'down'} ms-1`}></i>
          </button>
          {activeMobileDropdown === 'ottomans' && dropdownPosition && (
            <div 
              className="mobile-dropdown-menu"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                right: 'auto',
                width: `min(500px, calc(100vw - ${dropdownPosition.left * 2}px))`
              }}
            >
              <div className="mobile-mega-menu-grid">
                {ottomansMega.map((col, idx) => (
                  <div className="mobile-mega-menu-column" key={idx}>
                    <h6 className="mobile-mega-menu-title">{col.title}</h6>
                    <ul className="mobile-mega-menu-list">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link to={`/products?search=${encodeURIComponent(item)}`} onClick={() => {
                            setActiveMobileDropdown(null);
                            setDropdownPosition(null);
                          }}>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mobile-category-item">
          <button 
            className="mobile-category-link"
            onClick={(e) => toggleMobileDropdown('beds', e)}
          >
            Beds & Sofa Cum Beds
            <i className={`bi bi-chevron-${activeMobileDropdown === 'beds' ? 'up' : 'down'} ms-1`}></i>
          </button>
          {activeMobileDropdown === 'beds' && dropdownPosition && (
            <div 
              className="mobile-dropdown-menu"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                right: 'auto',
                width: `min(500px, calc(100vw - ${dropdownPosition.left * 2}px))`
              }}
            >
              <div className="mobile-mega-menu-grid">
                {bedsMega.map((col, idx) => (
                  <div className="mobile-mega-menu-column" key={idx}>
                    <h6 className="mobile-mega-menu-title">{col.title}</h6>
                    <ul className="mobile-mega-menu-list">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link to={`/products?search=${encodeURIComponent(item)}`} onClick={() => {
                            setActiveMobileDropdown(null);
                            setDropdownPosition(null);
                          }}>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mobile-category-item">
          <button 
            className="mobile-category-link"
            onClick={(e) => toggleMobileDropdown('luxury', e)}
          >
            Luxury
            <i className={`bi bi-chevron-${activeMobileDropdown === 'luxury' ? 'up' : 'down'} ms-1`}></i>
          </button>
          {activeMobileDropdown === 'luxury' && dropdownPosition && (
            <div 
              className="mobile-dropdown-menu"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                right: 'auto',
                width: `min(500px, calc(100vw - ${dropdownPosition.left * 2}px))`
              }}
            >
              <div className="mobile-mega-menu-grid">
                {luxuryMega.map((col, idx) => (
                  <div className="mobile-mega-menu-column" key={idx}>
                    <h6 className="mobile-mega-menu-title">{col.title}</h6>
                    <ul className="mobile-mega-menu-list">
                      {col.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link to={`/products?search=${encodeURIComponent(item)}`} onClick={() => {
                            setActiveMobileDropdown(null);
                            setDropdownPosition(null);
                          }}>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
