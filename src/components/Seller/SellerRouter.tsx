import { Route, Routes, Navigate, useLocation } from 'react-router-dom';

// Seller Components
import SellerDashboard from './Dashboard/SellerDashboard';
import SellerLayout from './Layout/SellerLayout';
import SellerProducts from './Products/SellerProducts';
import SellerProductDetail from './Products/SellerProductDetail';
import SellerOrders from './Orders/SellerOrders';
import SellerOrderDetail from './Orders/SellerOrderDetail';
import SellerCoupons from './Coupons/SellerCoupons';
import SellerBrandAnalytics from './Analytics/SellerBrandAnalytics';
import SellerSettings from './Settings/SellerSettings';
import SellerPaymentSettings from './Settings/SellerPaymentSettings';
import SellerCommunication from './Communication/SellerCommunication';
import SellerPaymentDashboard from './Payment/SellerPaymentDashboard';

const SellerRouter = () => {
  const location = useLocation();
  
  // Check if user is authenticated and is vendor
  // const userStr = localStorage.getItem('user');
  const vendorStr = localStorage.getItem('vendor');
  const userType = localStorage.getItem('userType');
  const token = localStorage.getItem('authToken');
  
  const isVendor = token && userType === 'vendor' && vendorStr;
  const isInitializing = false; // Can add loading state if needed
  
  // Wait for initial authentication check to complete
  if (isInitializing) {
    return (
      <div className="admin-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  // If not vendor and trying to access seller routes, redirect to vendor login
  if (!isVendor && location.pathname !== '/vendor/login') {
    return <Navigate to="/vendor/login" replace />;
  }
  
  // If vendor and trying to access login, redirect to dashboard
  if (isVendor && location.pathname === '/vendor/login') {
    return <Navigate to="/seller" replace />;
  }

  return (
    <Routes>
      <Route element={<SellerLayout />}>
        <Route index element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="products/:id" element={<SellerProductDetail />} />
        <Route path="products/new" element={<SellerProductDetail />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="orders/:id" element={<SellerOrderDetail />} />
        <Route path="coupons" element={<SellerCoupons />} />
        <Route path="analytics/brand" element={<SellerBrandAnalytics />} />
        <Route path="payment" element={<SellerPaymentDashboard />} />
        <Route path="payment-settings" element={<SellerPaymentSettings />} />
        <Route path="communication" element={<SellerCommunication />} />
        <Route path="settings" element={<SellerSettings />} />
      </Route>
    </Routes>
  );
};

export default SellerRouter;

