import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../../context/AppContext';
import '../../../styles/admin-theme.css';

const AdminLayout: React.FC = () => {
  const { state, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start open on desktop
  
  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true); // Always open on desktop
      } else {
        setSidebarOpen(false); // Closed on mobile/tablet
      }
    };
    
    handleResize(); // Set initial state
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
    logout();
    navigate('/admin/login');
  };
  
  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(`${path}`);
  };
  
  const menuItems = [
    // Main Menu Section
    { path: '/admin', icon: 'dashboard', label: 'Dashboard', exact: true, section: 'main' },
    { path: '/admin/customers', icon: 'people', label: 'Customer Management', section: 'main' },
    { path: '/admin/brands', icon: 'store', label: 'Brand Management', section: 'main' },
    { path: '/admin/brand-analytics', icon: 'analytics', label: 'Brand Analytics', section: 'main' },
    { path: '/admin/orders', icon: 'shopping_cart', label: 'Brand Order Management', section: 'main' },
    // Sixpine Seller Section
    { path: '/admin/sixpine-orders', icon: 'shopping_bag', label: 'Sixpine Orders', section: 'sixpine_seller' },
    { path: '/admin/sixpine-products', icon: 'inventory_2', label: 'Sixpine Products', section: 'sixpine_seller' },
    // Page Management Section
    { path: '/admin/homepage', icon: 'home', label: 'Home Management', section: 'page_management' },
    { path: '/admin/faq-page', icon: 'help', label: 'FAQ Page Management', section: 'page_management' },
    { path: '/admin/advertisements', icon: 'campaign', label: 'Advertisement Management', section: 'page_management' },
    // { path: '/admin/trending', icon: 'trending_up', label: 'Trending Page Management', section: 'page_management' },
    // { path: '/admin/best-deals', icon: 'local_offer', label: 'Best Deal Management', section: 'page_management' },
    // { path: '/admin/bulk-order-page', icon: 'inventory_2', label: 'Bulk Order Page Management', section: 'page_management' },
    // Management Section
    { path: '/admin/logs', icon: 'list_alt', label: 'Activity Logs', section: 'management' },
    { path: '/admin/contact-queries', icon: 'contact_support', label: 'Contact Queries', section: 'management' },
    { path: '/admin/bulk-orders', icon: 'local_shipping', label: 'Bulk Order Queries', section: 'management' },
    { path: '/admin/data-requests', icon: 'description', label: 'Data Requests', section: 'management' },
    { path: '/admin/communication', icon: 'mail', label: 'Communication', section: 'management' },
    { path: '/admin/media', icon: 'image', label: 'Media Library', section: 'management' },
    { path: '/admin/packaging-feedback', icon: 'feedback', label: 'Packaging Feedback', section: 'management' },
    { path: '/admin/coupons', icon: 'local_offer', label: 'Coupons', section: 'management' },
    // Settings Section
    { path: '/admin/payment-charges', icon: 'payments', label: 'Payment Settings', section: 'settings' },
    { path: '/admin/filter-options', icon: 'tune', label: 'Filter Options', section: 'settings' },
    { path: '/admin/settings', icon: 'settings', label: 'Settings', section: 'settings' },
  ];
  
  const groupedMenuItems = {
    main: menuItems.filter(item => item.section === 'main'),
    sixpine_seller: menuItems.filter(item => item.section === 'sixpine_seller'),
    page_management: menuItems.filter(item => item.section === 'page_management'),
    analytics: menuItems.filter(item => item.section === 'analytics'),
    management: menuItems.filter(item => item.section === 'management'),
    settings: menuItems.filter(item => item.section === 'settings'),
  };
  
  return (
    <div style={{ minHeight: '100vh', background: 'var(--admin-bg)' }}>
      {/* Modern Header */}
      <header className="admin-modern-header">
        <div className="admin-header-left">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="admin-header-btn admin-menu-toggle"
            aria-label="Toggle sidebar"
          >
            <span className="material-symbols-outlined">
              {sidebarOpen ? 'menu_open' : 'menu'}
            </span>
          </button>
          <Link to="/admin" className="admin-header-logo">
            <div className="admin-logo-icon admin-logo-icon-desktop">SP</div>
            <div className="admin-logo-text">
              <h1>Sixpine Admin</h1>
              <p className="admin-logo-subtitle">E-Commerce Dashboard</p>
            </div>
          </Link>
        </div>
        
        <div className="admin-header-right">
          {/* User Menu */}
          <div className="admin-header-user">
            <div className="admin-user-avatar">
              {(state.user?.first_name || state.user?.username || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-info">
              <div className="admin-user-name">
                {state.user?.first_name || state.user?.username || 'Admin'}
              </div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="admin-header-btn admin-logout-btn"
            title="Logout"
            aria-label="Logout"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>
      
      <div style={{ display: 'flex', height: `calc(100vh - var(--admin-header-height))` }}>
        {/* Modern Sidebar */}
        <aside className={`admin-modern-sidebar ${sidebarOpen ? 'open' : ''}`}>
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
            
            {/* Sixpine Seller Section */}
            {groupedMenuItems.sixpine_seller.length > 0 && (
              <div className="admin-menu-section">
                <div className="admin-menu-title">Sixpine Seller</div>
                {groupedMenuItems.sixpine_seller.map((item) => {
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
            
            {/* Page Management Section */}
            {groupedMenuItems.page_management.length > 0 && (
              <div className="admin-menu-section">
                <div className="admin-menu-title">Page Management</div>
                {groupedMenuItems.page_management.map((item) => {
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
                  const active = isActive(item.path);
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
            
            {/* Management Section */}
            {groupedMenuItems.management.length > 0 && (
              <div className="admin-menu-section">
                <div className="admin-menu-title">Management</div>
                {groupedMenuItems.management.map((item) => {
                  const active = isActive(item.path);
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
                  const active = isActive(item.path);
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
            
            {/* Store Link */}
            <div className="admin-menu-section" style={{ borderTop: '1px solid var(--admin-border)', paddingTop: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
              <Link
                to="/"
                target="_blank"
                className="admin-menu-item"
                style={{ background: 'linear-gradient(135deg, rgba(255, 111, 0, 0.08) 0%, rgba(53, 122, 189, 0.08) 100%)' }}
              >
                <span className="material-symbols-outlined">storefront</span>
                <span className="admin-menu-text">Visit Store</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', marginLeft: 'auto' }}>open_in_new</span>
              </Link>
            </div>
          </nav>
          
          {/* Sidebar Footer */}
          <div className="admin-sidebar-footer">
            <div className="admin-sidebar-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-sm)' }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--admin-primary)', fontSize: '24px' }}>help</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--admin-dark)', marginBottom: '4px' }}>
                    Need Help?
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-text-light)', marginBottom: '8px' }}>
                    Check our documentation
                  </div>
                  <a 
                    href="#" 
                    style={{ fontSize: '12px', color: 'var(--admin-primary)', fontWeight: '600', textDecoration: 'none' }}
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="admin-sidebar-overlay"
            onClick={() => {
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              }
            }}
          />
        )}
        
        {/* Main Content */}
        <main 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--admin-content-padding)',
            background: 'var(--admin-bg)',
            transition: 'var(--transition)'
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
