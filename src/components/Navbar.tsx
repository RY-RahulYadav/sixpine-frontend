import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { productAPI, addressAPI } from '../services/api';

interface SearchSuggestion {
  text: string;
  type: 'product' | 'category' | 'brand' | 'search';
  icon: string;
  label?: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, openCartSidebar, logout } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [pincode, setPincode] = useState<string>('110001');
  const [loadingPincode, setLoadingPincode] = useState<boolean>(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);
  const defaultAddressFoundRef = useRef<boolean>(false);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productAPI.getCategories();
        setCategories(response.data.results || response.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch pincode from default address or detect current location
  useEffect(() => {
    // Reset flag when authentication state changes
    defaultAddressFoundRef.current = false;

    const detectCurrentLocation = () => {
      // Don't proceed if default address was already found
      if (defaultAddressFoundRef.current) {
        return;
      }

      if (!navigator.geolocation) {
        console.warn('Geolocation is not supported by this browser');
        setLoadingPincode(false);
        return;
      }

      setLoadingPincode(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Double check - don't update if default address was found
          if (defaultAddressFoundRef.current) {
            setLoadingPincode(false);
            return;
          }

          try {
            const { latitude, longitude } = position.coords;
            // Use reverse geocoding API to get pincode
            // Using a free reverse geocoding service
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            
            // Check again before updating
            if (defaultAddressFoundRef.current) {
              setLoadingPincode(false);
              return;
            }
            
            if (data.postcode) {
              setPincode(data.postcode);
            } else {
              // Fallback: try another service
              try {
                const osmResponse = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                );
                const osmData = await osmResponse.json();
                
                // Check again before updating
                if (defaultAddressFoundRef.current) {
                  setLoadingPincode(false);
                  return;
                }
                
                if (osmData.address && osmData.address.postcode) {
                  setPincode(osmData.address.postcode);
                }
              } catch (err) {
                console.error('Error with OSM geocoding:', err);
              }
            }
          } catch (error) {
            console.error('Error getting pincode from location:', error);
          } finally {
            setLoadingPincode(false);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoadingPincode(false);
          // Keep default pincode if location detection fails
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // Cache for 5 minutes
        }
      );
    };

    const fetchPincode = async () => {
      // First, check if user is authenticated and has default address
      if (state.isAuthenticated) {
        try {
          setLoadingPincode(true);
          const response = await addressAPI.getAddresses();
          const addressesData = Array.isArray(response.data) 
            ? response.data 
            : (response.data.results || response.data.data || []);
          const addresses = Array.isArray(addressesData) ? addressesData : [];
          
          // Find default address first
          const defaultAddress = addresses.find((addr: any) => addr.is_default);
          
          if (defaultAddress && defaultAddress.postal_code) {
            // If default address exists, use its pincode and STOP - don't check current location
            defaultAddressFoundRef.current = true; // Set flag to prevent location detection
            setPincode(defaultAddress.postal_code);
            setLoadingPincode(false);
            return; // Exit early - do not proceed to location detection
          }
          
          // Only reach here if no default address found
          // Now check current location
          setLoadingPincode(false); // Reset loading before location detection
          detectCurrentLocation();
        } catch (error) {
          console.error('Error fetching addresses:', error);
          // On error fetching addresses, try to detect current location
          setLoadingPincode(false);
          detectCurrentLocation();
        }
      } else {
        // If not authenticated, check current location directly
        detectCurrentLocation();
      }
    };

    fetchPincode();
  }, [state.isAuthenticated]);

  // Update search query when URL params change
  useEffect(() => {
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(decodeURIComponent(searchParam));
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setShowLoginDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const response = await productAPI.getSearchSuggestions(query);
      setSuggestions(response.data.suggestions || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce suggestions fetch
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      fetchSuggestions(query);
    }, 300);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    
    if (selectedCategory) {
      params.append('category', selectedCategory);
    }
    
    const queryString = params.toString();
    if (queryString) {
      navigate(`/products?${queryString}`);
    } else if (searchQuery.trim() || selectedCategory) {
      navigate(`/products?${searchQuery.trim() ? `search=${encodeURIComponent(searchQuery.trim())}` : `category=${selectedCategory}`}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    
    if (suggestion.type === 'category') {
      navigate(`/products?category=${encodeURIComponent(suggestion.text.toLowerCase().replace(/\s+/g, '-'))}`);
    } else if (suggestion.type === 'brand') {
      navigate(`/products?brand=${encodeURIComponent(suggestion.text.toLowerCase().replace(/\s+/g, '-'))}`);
    } else {
      navigate(`/products?search=${encodeURIComponent(suggestion.text)}`);
    }
  };

  const getIconClass = (type: string, _icon: string) => {
    switch (type) {
      case 'product':
        return 'bi bi-tag';
      case 'category':
        return 'bi bi-grid-3x3-gap';
      case 'brand':
        return 'bi bi-star';
      case 'search':
        return 'bi bi-search';
      default:
        return 'bi bi-search';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light">
      <div className="container-fluid d-flex flex-wrap align-items-center">
        {/* Logo + Pin Code */}
        <div className="d-flex align-items-center me-2 flex-shrink-0">
          <Link className="navbar-brand me-2" to="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo.png" 
              alt="Sixpine" 
              style={{ 
                height: '60px', 
                width: 'auto',
                maxWidth: '300px',
                objectFit: 'contain'
              }} 
            />
          </Link>
          <div className="pin-code d-none d-lg-flex align-items-center border rounded px-2 py-1">
            <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
            {loadingPincode ? (
              <span style={{ fontSize: '0.85rem' }}>Loading...</span>
            ) : (
              <span>{pincode}</span>
            )}
          </div>
        </div>

        {/* Right Icons for mobile */}
        <ul className="navbar-nav align-items-center d-lg-none order-lg-2 mb-2 mb-lg-0 flex-shrink-0">
          <li className="nav-item">
            {state.isAuthenticated ? (
              <div className="position-relative" ref={profileDropdownRef}>
                <button
                  className="nav-link text-light d-flex align-items-center"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{ background: 'none', border: 'none', padding: '0.5rem' }}
                >
                  <i className="bi bi-person"></i>
                  <span className="d-none d-sm-inline ms-1" style={{ fontSize: '0.85rem' }}>
                    {state.user?.first_name ? `${state.user.first_name} ${state.user.last_name}`.trim() : state.user?.username}
                  </span>
                  <i className="bi bi-chevron-down ms-1 d-none d-sm-inline" style={{ fontSize: '0.7rem', lineHeight: '1' }}></i>
                </button>
                {showProfileDropdown && (
                  <div className="position-absolute bg-white border rounded shadow-sm mt-1" style={{ 
                    zIndex: 1000, 
                    top: '100%', 
                    right: 0,
                    minWidth: '200px',
                    maxWidth: '90vw'
                  }}>
                    <Link
                      to="/your-account"
                      className="d-block px-3 py-2 text-dark text-decoration-none"
                      onClick={() => setShowProfileDropdown(false)}
                      style={{ fontSize: '0.9rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Link>
                    <button
                      onClick={async () => {
                        setShowProfileDropdown(false);
                        await logout();
                        navigate('/');
                      }}
                      className="d-block w-100 text-start px-3 py-2 text-dark text-decoration-none border-top"
                      style={{ 
                        fontSize: '0.9rem',
                        background: 'none',
                        border: 'none',
                        borderTop: '1px solid #dee2e6',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="position-relative" ref={loginDropdownRef}>
                <button
                  className="nav-link text-light d-flex align-items-center"
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  style={{ background: 'none', border: 'none', padding: '0.5rem' }}
                >
                  <i className="bi bi-person"></i>
                  <span className="d-none d-sm-inline ms-1" style={{ fontSize: '0.85rem' }}>Login</span>
                  <i className="bi bi-chevron-down ms-1 d-none d-sm-inline" style={{ fontSize: '0.7rem', lineHeight: '1' }}></i>
                </button>
                {showLoginDropdown && (
                  <div className="position-absolute bg-white border rounded shadow-sm mt-1" style={{ 
                    zIndex: 1000, 
                    top: '100%', 
                    right: 0,
                    minWidth: '200px',
                    maxWidth: '90vw'
                  }}>
                    <Link
                      to="/login"
                      className="d-block px-3 py-2 text-dark text-decoration-none"
                      onClick={() => setShowLoginDropdown(false)}
                      style={{ fontSize: '0.9rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <i className="bi bi-person me-2"></i>
                      Login/Signup as Customer
                    </Link>
                    <Link
                      to="/seller/login"
                      className="d-block px-3 py-2 text-dark text-decoration-none border-top"
                      onClick={() => setShowLoginDropdown(false)}
                      style={{ fontSize: '0.9rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <i className="bi bi-shop me-2"></i>
                      Login/Signup as Seller
                    </Link>
                  </div>
                )}
              </div>
            )}
          </li>
          <li className="nav-item">
            <Link className="nav-link text-light d-flex align-items-center" to="/orders" style={{ padding: '0.5rem' }}>
              <i className="bi bi-box-arrow-in-left"></i>
            </Link>
          </li>
          <li className="nav-item">
            <button 
              className="nav-link text-light d-flex align-items-center position-relative" 
              onClick={(e) => {
                e.preventDefault();
                openCartSidebar();
              }}
              style={{ background: 'none', border: 'none', padding: '0.5rem' }}
            >
              <i className="bi bi-cart"></i>
              {state.cart && state.cart.items_count > 0 && (
                <span className="cart-count">{state.cart.items_count}</span>
              )}
            </button>
          </li>
        </ul>

        {/* Search Bar */}
        <form className="d-flex flex-grow-1 mx-lg-3 search-box order-3 order-lg-2 w-100" onSubmit={handleSearch} ref={searchRef} style={{ minWidth: 0 }}>
          <select 
            className="form-select category-select me-2 d-none d-sm-block"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ flexShrink: 0, minWidth: '150px' }}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="position-relative flex-grow-1" style={{ minWidth: 0 }}>
            <input 
              className="form-control me-2" 
              type="search" 
              placeholder="Click to search..." 
              aria-label="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              style={{ width: '100%' }}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000, top: '100%', maxHeight: '400px', overflowY: 'auto' }}>
                {loading && (
                  <div className="px-3 py-2 text-center text-muted">
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    Searching...
                  </div>
                )}
                {!loading && suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer d-flex align-items-center suggestion-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f8f9fa')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                  >
                    <i className={`${getIconClass(suggestion.type, suggestion.icon)} me-2 text-muted`}></i>
                    <span className="flex-grow-1 text-truncate">{suggestion.text}</span>
                    {suggestion.type !== 'search' && (
                      <small className="text-muted text-capitalize ms-2">{suggestion.type}</small>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary search-btn flex-shrink-0" type="submit">
            <i className="bi bi-search"></i>
          </button>
        </form>

        {/* Right Icons for desktop */}
        <ul className="navbar-nav align-items-center d-none d-lg-flex order-lg-3 flex-shrink-0">
          <li className="nav-item mx-2">
            {state.isAuthenticated ? (
              <div className="position-relative" ref={profileDropdownRef}>
                <button
                  className="nav-link text-light d-flex align-items-center"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  style={{ background: 'none', border: 'none', padding: '0.5rem 0' }}
                >
                  <i className="bi bi-person me-1"></i>
                  <span>{state.user?.first_name ? `${state.user.first_name} ${state.user.last_name}`.trim() : state.user?.username}</span>
                  <i className="bi bi-chevron-down ms-1" style={{ fontSize: '0.7rem', lineHeight: '1' }}></i>
                </button>
                {showProfileDropdown && (
                  <div className="position-absolute bg-white border rounded shadow-sm mt-1" style={{ 
                    zIndex: 1000, 
                    top: '100%', 
                    right: 0,
                    minWidth: '200px'
                  }}>
                    <Link
                      to="/your-account"
                      className="d-block px-3 py-2 text-dark text-decoration-none"
                      onClick={() => setShowProfileDropdown(false)}
                      style={{ fontSize: '0.9rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <i className="bi bi-person me-2"></i>
                      Profile
                    </Link>
                    <button
                      onClick={async () => {
                        setShowProfileDropdown(false);
                        await logout();
                        navigate('/');
                      }}
                      className="d-block w-100 text-start px-3 py-2 text-dark text-decoration-none border-top"
                      style={{ 
                        fontSize: '0.9rem',
                        background: 'none',
                        border: 'none',
                        borderTop: '1px solid #dee2e6',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="position-relative" ref={loginDropdownRef}>
                <button
                  className="nav-link text-light d-flex align-items-center"
                  onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                  style={{ background: 'none', border: 'none', padding: '0.5rem 0' }}
                >
                  <i className="bi bi-person me-1"></i>
                  <span>Login</span>
                  <i className="bi bi-chevron-down ms-1" style={{ fontSize: '0.7rem', lineHeight: '1' }}></i>
                </button>
                {showLoginDropdown && (
                  <div className="position-absolute bg-white border rounded shadow-sm mt-1" style={{ 
                    zIndex: 1000, 
                    top: '100%', 
                    right: 0,
                    minWidth: '200px'
                  }}>
                    <Link
                      to="/login"
                      className="d-block px-3 py-2 text-dark text-decoration-none"
                      onClick={() => setShowLoginDropdown(false)}
                      style={{ fontSize: '0.9rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <i className="bi bi-person me-2"></i>
                      Login/Signup as Customer
                    </Link>
                    <Link
                      to="/seller/login"
                      className="d-block px-3 py-2 text-dark text-decoration-none border-top"
                      onClick={() => setShowLoginDropdown(false)}
                      style={{ fontSize: '0.9rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <i className="bi bi-shop me-2"></i>
                      Login/Signup as Seller
                    </Link>
                  </div>
                )}
              </div>
            )}
          </li>
          <li className="nav-item mx-2">
            <Link className="nav-link text-light" to="/orders">
              <i className="bi bi-box-arrow-in-left"></i> Returns & Orders
            </Link>
          </li>
          <li className="nav-item mx-2 cart_top">
            <button 
              className="nav-link text-light" 
              onClick={(e) => {
                e.preventDefault();
                openCartSidebar();
              }}
              style={{ background: 'none', border: 'none' }}
            >
              <span>
                <i className="bi bi-cart"></i> 
                {state.cart && (
                  <span className="cart-count">{state.cart.items_count || 0}</span>
                )}
              </span> 
              Cart
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
