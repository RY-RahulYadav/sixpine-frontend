import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useApp } from '../../context/AppContext';

// Admin Components (Super Admin Only - Restricted Features)
import AdminDashboard from './Dashboard/AdminDashboard';
import AdminLogin from './Auth/AdminLogin';
import AdminLayout from './Layout/AdminLayout';
import AdminPaymentCharges from './PaymentCharges/AdminPaymentCharges';
import AdminSettings from './Settings/AdminSettings';
import AdminBulkOrders from './BulkOrders/AdminBulkOrders';
import AdminContactQueries from './ContactQueries/AdminContactQueries';

// Lazy load AdminLogs - using index file for better module resolution
const AdminLogs = lazy(() => import('./Logs'));
import AdminHomePageManagement from './HomePageManagement/AdminHomePageManagement';
import AdminTrendingPageManagement from './TrendingPageManagement/AdminTrendingPageManagement';
import AdminBestDealsPageManagement from './BestDealsPageManagement/AdminBestDealsPageManagement';
import AdminBulkOrderPageManagement from './BulkOrderPageManagement/AdminBulkOrderPageManagement';
import AdminFAQPageManagement from './FAQPageManagement/AdminFAQPageManagement';
import AdminAdvertisementManagement from './AdvertisementManagement/AdminAdvertisementManagement';
import AdminUsers from './Users/AdminUsers';
import AdminUserDetail from './Users/AdminUserDetail';
import AdminBrands from './Brands/AdminBrands';
import AdminOrders from './Orders/AdminOrders';
import AdminOrderDetail from './Orders/AdminOrderDetail';
import AdminFilterOptions from './FilterOptions/AdminFilterOptions';
import AdminCommunication from './Communication/AdminCommunication';
import AdminSixpineProducts from './Products/AdminSixpineProducts';
import AdminProductDetail from './Products/AdminProductDetail';
import AdminSixpineOrders from './Orders/AdminSixpineOrders';
import AdminDataRequests from './DataRequests/AdminDataRequests';
import AdminMedia from './Media/AdminMedia';
import AdminPackagingFeedback from './PackagingFeedback/AdminPackagingFeedback';
import AdminBrandAnalytics from './Analytics/AdminBrandAnalytics';
import AdminCoupons from './Coupons/AdminCoupons';

const AdminRouter = () => {
  const { state } = useApp();
  const location = useLocation();
  
  // Check if user is authenticated and is superuser (super admin only)
  const isSuperAdmin = state.isAuthenticated && state.user?.is_superuser === true;
  const isInitializing = state.loading;
  
  // Wait for initial authentication check to complete
  if (isInitializing) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // If not super admin and trying to access admin routes, redirect to admin login
  if (!isSuperAdmin && location.pathname !== '/admin/login') {
    return <Navigate to="/admin/login" replace />;
  }
  
  // If super admin and trying to access login, redirect to dashboard
  if (isSuperAdmin && location.pathname === '/admin/login') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        {/* Main Menu */}
        <Route path="customers" element={<AdminUsers />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
        <Route path="brands" element={<AdminBrands />} />
        <Route path="brand-analytics" element={<AdminBrandAnalytics />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetail />} />
        <Route path="sixpine-orders" element={<AdminSixpineOrders />} />
        <Route path="sixpine-products" element={<AdminSixpineProducts />} />
        <Route path="products/:id" element={<AdminProductDetail />} />
        <Route path="products/new" element={<AdminProductDetail />} />
        {/* Page Management Section */}
        <Route path="homepage" element={<AdminHomePageManagement />} />
        <Route path="trending" element={<AdminTrendingPageManagement />} />
        <Route path="best-deals" element={<AdminBestDealsPageManagement />} />
        <Route path="bulk-order-page" element={<AdminBulkOrderPageManagement />} />
        <Route path="faq-page" element={<AdminFAQPageManagement />} />
        <Route path="advertisements" element={<AdminAdvertisementManagement />} />
        {/* Management Section */}
        <Route path="logs" element={
          <Suspense fallback={<div className="admin-loading-state"><div className="admin-loader"></div><p>Loading...</p></div>}>
            <AdminLogs />
          </Suspense>
        } />
        <Route path="contact-queries" element={<AdminContactQueries />} />
        <Route path="bulk-orders" element={<AdminBulkOrders />} />
        <Route path="data-requests" element={<AdminDataRequests />} />
        <Route path="communication" element={<AdminCommunication />} />
        <Route path="media" element={<AdminMedia />} />
        <Route path="packaging-feedback" element={<AdminPackagingFeedback />} />
        <Route path="coupons" element={<AdminCoupons />} />
        {/* Settings Section */}
        <Route path="payment-charges" element={<AdminPaymentCharges />} />
        <Route path="filter-options" element={<AdminFilterOptions />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
};

export default AdminRouter;