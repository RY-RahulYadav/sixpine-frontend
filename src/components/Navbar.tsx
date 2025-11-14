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

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, openCartSidebar } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
  const debounceRef = useRef<number | null>(null);

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
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
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
        <div className="d-flex align-items-center me-3">
          <Link className="navbar-brand text-light me-3" to="/">Sixpine</Link>
          <div className="pin-code d-none d-lg-flex align-items-center border rounded px-2 py-1">
            <i className="bi bi-geo-alt-fill me-1 text-danger"></i>
            <span>110001</span>
          </div>
        </div>

        {/* Right Icons for mobile */}
        <ul className="navbar-nav align-items-center d-lg-none order-lg-2 mb-2 mb-lg-0">
          <li className="nav-item">
            <Link className="nav-link text-light" to={state.isAuthenticated ? "/your-account" : "/login"}>
              <i className="bi bi-person"></i>
              <span className="d-none d-md-inline ms-1">
                {state.isAuthenticated ? 
                  (state.user?.first_name ? `${state.user.first_name} ${state.user.last_name}`.trim() : state.user?.username) 
                  : "Login"
                }
              </span>
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link text-light" to="/orders">
              <i className="bi bi-box-arrow-in-left"></i>
            </Link>
          </li>
          <li className="nav-item">
            <button 
              className="nav-link text-light" 
              onClick={(e) => {
                e.preventDefault();
                openCartSidebar();
              }}
              style={{ background: 'none', border: 'none' }}
            >
              <i className="bi bi-cart"></i>
              {state.cart && state.cart.items_count > 0 && (
                <span className="cart-count">{state.cart.items_count}</span>
              )}
            </button>
          </li>
        </ul>

        {/* Search Bar */}
        <form className="d-flex flex-grow-1 mx-lg-3 search-box order-3 order-lg-2" onSubmit={handleSearch} ref={searchRef}>
          <select className="form-select category-select me-2">
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home-kitchen">Home & Kitchen</option>
          </select>
          <div className="position-relative flex-grow-1">
            <input 
              className="form-control me-2" 
              type="search" 
              placeholder="Click to search..." 
              aria-label="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="position-absolute w-100 bg-white border rounded shadow-sm mt-1" style={{ zIndex: 1000, top: '100%' }}>
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
                    <span className="flex-grow-1">{suggestion.text}</span>
                    {suggestion.type !== 'search' && (
                      <small className="text-muted text-capitalize">{suggestion.type}</small>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button className="btn btn-primary search-btn" type="submit">
            <i className="bi bi-search"></i>
          </button>
        </form>

        {/* Right Icons for desktop */}
        <ul className="navbar-nav align-items-center d-none d-lg-flex order-lg-3">
          <li className="nav-item mx-2">
            <Link className="nav-link text-light" to={state.isAuthenticated ? "/your-account" : "/login"}>
              <i className="bi bi-person"></i> {state.isAuthenticated ? 
                (state.user?.first_name ? `${state.user.first_name} ${state.user.last_name}`.trim() : state.user?.username) 
                : "Login"
              }
            </Link>
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
