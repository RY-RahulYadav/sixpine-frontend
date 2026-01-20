import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { productAPI } from '../services/api';

interface NavbarSubcategory {
  id: number;
  name: string;
  slug: string;
  link?: string;
  is_active: boolean;
  sort_order: number;
}

interface NavbarCategory {
  id: number;
  name: string;
  slug: string;
  image?: string;
  is_active: boolean;
  sort_order: number;
  subcategories: NavbarSubcategory[];
}

const CategoryTabs: React.FC = () => {
  const [activeMobileDropdown, setActiveMobileDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<NavbarCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to create product link with category and subcategory using slugs
  const createProductLink = (categorySlug: string, subcategorySlug?: string): string => {
    if (subcategorySlug) {
      return `/products?category=${categorySlug}&subcategory=${subcategorySlug}`;
    }
    return `/products?category=${categorySlug}`;
  };

  // Helper function to handle category link clicks
  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, categorySlug: string, subcategorySlug?: string) => {
    // If already on products page, use navigate to ensure proper URL update
    if (location.pathname === '/products') {
      e.preventDefault();
      const link = createProductLink(categorySlug, subcategorySlug);
      navigate(link, { replace: false });
    }
    // Otherwise, let Link handle it normally
  };

  // Fetch navbar categories with subcategories
  useEffect(() => {
    const fetchNavbarCategories = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getNavbarCategories();
        const navbarCategories: NavbarCategory[] = response.data.results || response.data || [];
        setCategories(navbarCategories);
      } catch (error) {
        console.error('Error fetching navbar categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNavbarCategories();
  }, []);

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

  // Build "All" categories menu from all categories and their subcategories
  const getAllCategoriesMenu = () => {
    return categories.map(category => ({
      title: category.name,
      items: category.subcategories.map(sub => sub.name),
      categorySlug: category.slug,
      subcategories: category.subcategories
    }));
  };

  // Get limited categories for header (max 8 categories + All = 9 total)
  const getHeaderCategories = () => {
    return categories.slice(0, 8); // Get first 8 categories
  };

  if (loading) {
    return (
      <div className="tab-categories mb-0">
        <ul className="nav nav-tabs d-none d-md-flex">
          <li className="nav-item">
            <span className="nav-link">Loading...</span>
          </li>
        </ul>
      </div>
    );
  }

  const allCategoriesMenu = getAllCategoriesMenu();
  const headerCategories = getHeaderCategories(); // Max 8 categories

  return (
    <div className="tab-categories mb-0">
      <ul className="nav nav-tabs d-none d-md-flex">
        {/* All Category with Mega Menu */}
        <li className="nav-item dropdown">
          <Link className="nav-link" to="/">All</Link>
          <div className="dropdown-menu mega-menu mega-menu-all">
            <div className="mega-menu-grid">
              {allCategoriesMenu.map((category, idx) => (
                <div className="mega-menu-column" key={idx}>
                  <h6 className="mega-menu-title">{category.title}</h6>
                  <ul className="mega-menu-list">
                    {category.items.length > 0 ? (
                      category.items.map((item, itemIdx) => {
                        const subcategory = category.subcategories.find(sub => sub.name === item);
                        return (
                          <li key={itemIdx}>
                            <Link 
                              to={createProductLink(category.categorySlug, subcategory?.slug)}
                              onClick={(e) => handleCategoryClick(e, category.categorySlug, subcategory?.slug)}
                            >
                              {item}
                            </Link>
                          </li>
                        );
                      })
                    ) : (
                      <li>
                        <Link 
                          to={createProductLink(category.categorySlug)}
                          onClick={(e) => handleCategoryClick(e, category.categorySlug)}
                        >
                          View All
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>

        {/* Dynamic Category Tabs - Limited to 8 categories (9 total with All) */}
        {headerCategories.map((category) => (
          <li key={category.id} className="nav-item dropdown">
            <Link 
              className="nav-link" 
              to={createProductLink(category.slug)}
              onClick={(e) => handleCategoryClick(e, category.slug)}
            >
              {category.name}
            </Link>
            <div className="dropdown-menu mega-menu">
              <div className="mega-menu-grid">
                <div className="mega-menu-column">
                  <h6 className="mega-menu-title">{category.name}</h6>
                  <ul className="mega-menu-list">
                    {category.subcategories.length > 0 ? (
                      category.subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          <Link 
                            to={createProductLink(category.slug, subcategory.slug)}
                            onClick={(e) => handleCategoryClick(e, category.slug, subcategory.slug)}
                          >
                            {subcategory.name}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <li>
                        <Link 
                          to={createProductLink(category.slug)}
                          onClick={(e) => handleCategoryClick(e, category.slug)}
                        >
                          View All
                        </Link>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        ))}
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
                {allCategoriesMenu.map((category, idx) => (
                  <div className="mobile-mega-menu-column" key={idx}>
                    <h6 className="mobile-mega-menu-title">{category.title}</h6>
                    <ul className="mobile-mega-menu-list">
                      {category.items.length > 0 ? (
                        category.items.map((item, itemIdx) => {
                          const subcategory = category.subcategories.find(sub => sub.name === item);
                          return (
                            <li key={itemIdx}>
                              <Link 
                                to={createProductLink(category.categorySlug, subcategory?.slug)} 
                                onClick={(e) => {
                                  handleCategoryClick(e, category.categorySlug, subcategory?.slug);
                                  setActiveMobileDropdown(null);
                                  setDropdownPosition(null);
                                }}
                              >
                                {item}
                              </Link>
                            </li>
                          );
                        })
                      ) : (
                        <li>
                          <Link 
                            to={createProductLink(category.categorySlug)} 
                            onClick={(e) => {
                              handleCategoryClick(e, category.categorySlug);
                              setActiveMobileDropdown(null);
                              setDropdownPosition(null);
                            }}
                          >
                            View All
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Dynamic Mobile Category Items - Limited to 8 categories */}
        {headerCategories.map((category) => (
          <div key={category.id} className="mobile-category-item">
            <button 
              className="mobile-category-link"
              onClick={(e) => toggleMobileDropdown(`cat-${category.id}`, e)}
            >
              {category.name}
              <i className={`bi bi-chevron-${activeMobileDropdown === `cat-${category.id}` ? 'up' : 'down'} ms-1`}></i>
            </button>
            {activeMobileDropdown === `cat-${category.id}` && dropdownPosition && (
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
                  <div className="mobile-mega-menu-column">
                    <h6 className="mobile-mega-menu-title">{category.name}</h6>
                    <ul className="mobile-mega-menu-list">
                      {category.subcategories.length > 0 ? (
                        category.subcategories.map((subcategory) => (
                          <li key={subcategory.id}>
                            <Link 
                              to={createProductLink(category.slug, subcategory.slug)} 
                              onClick={(e) => {
                                handleCategoryClick(e, category.slug, subcategory.slug);
                                setActiveMobileDropdown(null);
                                setDropdownPosition(null);
                              }}
                            >
                              {subcategory.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li>
                          <Link 
                            to={createProductLink(category.slug)} 
                            onClick={(e) => {
                              handleCategoryClick(e, category.slug);
                              setActiveMobileDropdown(null);
                              setDropdownPosition(null);
                            }}
                          >
                            View All
                          </Link>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
