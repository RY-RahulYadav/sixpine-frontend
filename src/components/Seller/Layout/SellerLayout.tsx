import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import '../../../styles/admin-theme.css';

const SellerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('vendor');
    localStorage.removeItem('userType');
    navigate('/seller/login');
  };
  
  const isActive = (path: string) => {
    if (path === '/seller') {
      return location.pathname === path;
    }
    // Special handling for payment routes to avoid conflicts
    if (path === '/seller/payment') {
      // Payment Dashboard should only be active on exact path, not on payment-settings
      return location.pathname === '/seller/payment';
    }
    if (path === '/seller/payment-settings') {
      return location.pathname.startsWith('/seller/payment-settings');
    }
    return location.pathname.startsWith(`${path}`);
  };
  
  const menuItems = [
    // Main Menu Section
    { path: '/seller', icon: 'dashboard', label: 'Dashboard', exact: true, section: 'main' },
    { path: '/seller/products', icon: 'inventory_2', label: 'Products Management', section: 'main' },
    { path: '/seller/orders', icon: 'shopping_bag', label: 'Orders Management', section: 'main' },
    // Payment Settings Section
    // Analytics Section
    { path: '/seller/analytics/brand', icon: 'analytics', label: 'Brand Analytics', section: 'analytics' },
    // Payment Section
    { path: '/seller/payment', icon: 'account_balance_wallet', label: 'Payment Dashboard', section: 'payment' },
    { path: '/seller/payment-settings', icon: 'account_balance', label: 'Payment Settings', section: 'payment' },
    { path: '/seller/coupons', icon: 'local_offer', label: 'Coupons', section: 'payment' },

    // Communication Section
    { path: '/seller/communication', icon: 'mail', label: 'Communication', section: 'communication' },
    // Settings Section
    { path: '/seller/settings', icon: 'settings', label: 'Settings', section: 'settings' },
  ];
  
  const groupedMenuItems = {
    main: menuItems.filter(item => item.section === 'main'),
    payment: menuItems.filter(item => item.section === 'payment'),
    analytics: menuItems.filter(item => item.section === 'analytics'),
    communication: menuItems.filter(item => item.section === 'communication'),
    settings: menuItems.filter(item => item.section === 'settings'),
  };
  
  const vendorStr = localStorage.getItem('vendor');
  const vendor = vendorStr ? JSON.parse(vendorStr) : null;
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--admin-bg)' }}>
      {/* Modern Header */}
      <header className="admin-modern-header">
        <div className="admin-header-left">
          <Link to="/seller" className="admin-header-logo">
            <div className="admin-logo-icon">SP</div>
            <div className="admin-logo-text">
              <h1>Seller Panel</h1>
              <p>Vendor Dashboard</p>
            </div>
          </Link>
        </div>
        
        <div className="admin-header-right">
          {/* User Menu */}
          {vendor && (
            <div className="admin-header-user">
              <div className="admin-user-avatar">
                <span className="material-symbols-outlined">store</span>
              </div>
              <div className="admin-user-info">
                <div className="admin-user-name">{vendor.business_name}</div>
                <div className="admin-user-role">{vendor.brand_name}</div>
              </div>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="admin-header-btn"
            title="Logout"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>
      
      <div style={{ display: 'flex', height: `calc(100vh - var(--admin-header-height))` }}>
        {/* Modern Sidebar */}
        <aside className={`admin-modern-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
          <nav className="admin-sidebar-menu">
            {/* Main Menu Section */}
            {groupedMenuItems.main.length > 0 && (
              <div className="admin-menu-section">
                <div className="admin-menu-title">Main Menu</div>
                {groupedMenuItems.main.map((item) => {
                  const active = item.exact ? location.pathname === item.path : isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`admin-menu-item ${active ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="admin-menu-text">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Payment Settings Section */}
            {groupedMenuItems.payment.length > 0 && (
              <div className="admin-menu-section">
                <div className="admin-menu-title">Payment Settings</div>
                {groupedMenuItems.payment.map((item) => {
                  const active = item.exact ? location.pathname === item.path : isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`admin-menu-item ${active ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="admin-menu-text">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Analytics Section */}
            {groupedMenuItems.analytics.length > 0 && (
              <div className="admin-menu-section">
                <div className="admin-menu-title">Analytics</div>
                {groupedMenuItems.analytics.map((item) => {
                  const active = item.exact ? location.pathname === item.path : isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`admin-menu-item ${active ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="admin-menu-text">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Communication Section */}
            {groupedMenuItems.communication.length > 0 && (
              <div className="admin-menu-section">
                <div className="admin-menu-title">Communication</div>
                {groupedMenuItems.communication.map((item) => {
                  const active = item.exact ? location.pathname === item.path : isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`admin-menu-item ${active ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="admin-menu-text">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
            
            {/* Settings Section */}
            {groupedMenuItems.settings.length > 0 && (
              <div className="admin-menu-section">
                <div className="admin-menu-title">Settings</div>
                {groupedMenuItems.settings.map((item) => {
                  const active = item.exact ? location.pathname === item.path : isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`admin-menu-item ${active ? 'active' : ''}`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span className="admin-menu-text">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
          
          {/* Sidebar Footer */}
          <div className="admin-sidebar-footer">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-modern-btn outline"
              style={{ width: '100%' }}
            >
              <span className="material-symbols-outlined">{sidebarOpen ? 'menu_open' : 'menu'}</span>
              <span className="admin-menu-text">{sidebarOpen ? 'Collapse' : 'Expand'}</span>
            </button>
          </div>
        </aside>
        
        {/* Main Content */}
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--admin-bg)' }}>
          <div style={{ padding: 'var(--spacing-lg)' }}>
            <div className="admin-page-title">
            <h1>
              {location.pathname === '/seller' && 'Dashboard'}
              {location.pathname.startsWith('/seller/products') && 'Products'}
              {location.pathname.startsWith('/seller/orders') && 'Orders'}
              {location.pathname.startsWith('/seller/coupons') && 'Coupons'}
              {location.pathname.startsWith('/seller/analytics/brand') && 'Brand Analytics'}
              {location.pathname.startsWith('/seller/payment') && !location.pathname.startsWith('/seller/payment-settings') && 'Payment Dashboard'}
              {location.pathname.startsWith('/seller/payment-settings') && 'Payment & Shipment Settings'}
              {location.pathname.startsWith('/seller/communication') && 'Communication'}
              {location.pathname.startsWith('/seller/settings') && 'Settings'}
            </h1>
            </div>
            
            <div className="admin-content">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;

