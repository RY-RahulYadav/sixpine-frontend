import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { productAPI } from '../services/api';

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
  const { state, openCartSidebar } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

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
        <div className="d-flex align-items-center me-2 me-lg-3 flex-shrink-0">
          <Link className="navbar-brand text-light me-2 me-lg-3" to="/">Sixpine</Link>
          <div className="pin-code d-none d-lg-flex align-items-center border rounded px-2 py-1">
            <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
            <span>110001</span>
          </div>
        </div>

        {/* Right Icons for mobile */}
        <ul className="navbar-nav align-items-center d-lg-none order-lg-2 mb-2 mb-lg-0 flex-shrink-0">
          <li className="nav-item">
            {state.isAuthenticated ? (
              <Link className="nav-link text-light d-flex align-items-center" to="/your-account" style={{ padding: '0.5rem' }}>
                <i className="bi bi-person"></i>
                <span className="d-none d-sm-inline ms-1" style={{ fontSize: '0.85rem' }}>
                  {state.user?.first_name ? `${state.user.first_name} ${state.user.last_name}`.trim() : state.user?.username}
                </span>
              </Link>
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
            style={{ flexShrink: 0 }}
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
              <Link className="nav-link text-light" to="/your-account">
                <i className="bi bi-person"></i> {state.user?.first_name ? `${state.user.first_name} ${state.user.last_name}`.trim() : state.user?.username}
              </Link>
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
