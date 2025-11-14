import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import ProductListPage from './pages/ProductListPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VendorLoginPage from './pages/VendorLoginPage';
import VendorRegisterPage from './pages/VendorRegisterPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import AdminRouter from './components/Admin/AdminRouter';
import SellerRouter from './components/Seller/SellerRouter';
import './App.css';
import './styles/admin-theme.css';
import './styles/auth.css';
import NewProductDetails from './pages/productdetails';
import AboutPage from './pages/about';
import AdvertisePage from './pages/AdvertisePage';
import CareerPage from './pages/CareerPage';
import Global_SellingPage from './pages/global_selling';
import PressReleasePage from './pages/press_release';
import CloseYourSixpineAccountPage from './pages/CloseYourSixpineAccountPage';
import CommunicationPreferencesPage from './pages/CommunicationPreferencesPage';
import DataRequestPage from './pages/DataRequestPage';
import LoginSecurityPage from './pages/LoginSecurityPage';
import SupplyPage from './pages/SupplyPage';
import PurchaseProtectionPage from './pages/PurchaseProtectionPage';
import RecallsProductSafetyAlertsPage from './pages/Recalls_product _safety_alerts_Page';
import AdvertisingPreferecePage from './pages/AdvertisingPreferecePage';
import AccountPage from './pages/AccountPage';
import SixpineAppPage from './pages/SixpineAppPage';
import PrivacyPage from './pages/privacy';
import ContactPage from './pages/ContactPage';
import TrendingPage from './pages/TrendingPage';
import BestDealsPage from './pages/BestDealsPage';
import RecentlyBrowsedPage from './pages/RecentlyBrowsedPage';
import BulkOrderPage from './pages/BulkOrderPage';
import TermsPage from './pages/terms';
import WarrantyPage from './pages/warranty';
import FAQsPage from './pages/faqs';
import HelpPage from './pages/HelpPage';
import ShoppingListPage from './pages/ShoppingListPage';
import MembershipPage from './pages/MembershipPage';
import LeavePackagingFeedbackPage from './pages/LeavePackagingFeedbackPage';
import SubscribeSavePage from './pages/SubscribeSavePage';
import MembershipsSubscriptionsPage from './pages/MembershipsSubscriptionsPage';
import MessageCentrePage from './pages/MessageCentrePage';
import AddressesPage from './pages/AddressesPage';
import EmailSubscriptionsPage from './pages/EmailSubscriptionsPage';
import CheckoutPage from './pages/checkout';
import ManagePaymentPage from './pages/ManagePaymentPage';
import CartSidebar from './components/CartSidebar/CartSidebar';

function AppContent() {
  const { state, closeCartSidebar } = useApp();

  return (
    <Router>
      <div className="app-wrapper">
        <CartSidebar isOpen={state.cartSidebarOpen} onClose={closeCartSidebar} />
        <Routes>
            {/* Public routes - accessible without login */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            {/* Vendor routes */}
            <Route path="/vendor/login" element={<VendorLoginPage />} />
            <Route path="/vendor/register" element={<VendorRegisterPage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products-details/:slug" element={<NewProductDetails />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/career" element={<CareerPage />} />
            <Route path="/global-selling" element={<Global_SellingPage />} />
            <Route path='/press-release' element={<PressReleasePage />} />
            <Route path="/email" element={<EmailSubscriptionsPage />} />
            <Route path="/close-your-sixpine-account" element={<CloseYourSixpineAccountPage />} />
            <Route path="/communication-preferences" element={<CommunicationPreferencesPage />} />
            <Route path="/data-request" element={<DataRequestPage />} />
            <Route path="/login-security" element={<LoginSecurityPage />} />
            <Route path="/supply" element={<SupplyPage />} />
            <Route path="/recalls_product" element={<RecallsProductSafetyAlertsPage />} />
            <Route path="/purchaseProtection" element={<PurchaseProtectionPage />} />
            <Route path="/your-app" element={<SixpineAppPage />} />
            <Route path="/advertising-preferece" element={<AdvertisingPreferecePage />} />
        <Route path="/your-account" element={<AccountPage />} />

            <Route path="/advertise" element={<AdvertisePage />} />
            <Route path="/privacy-policy" element={<PrivacyPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/trending" element={<TrendingPage />} />
            <Route path="/best-deals" element={<BestDealsPage />} />
            <Route path="/recently-browsed" element={<RecentlyBrowsedPage />} />
            <Route path="/bulk-order" element={<BulkOrderPage />} />
            <Route path="/terms-and-conditions" element={<TermsPage />} />
            <Route path="/warranty-policy" element={<WarrantyPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/shopping-list" element={<ShoppingListPage />} />
            <Route path="/membership" element={<MembershipPage />} />
            <Route path="/packaging-feedback" element={<LeavePackagingFeedbackPage />} />
            <Route path="/subscribe-save" element={<SubscribeSavePage />} />
            <Route path="/memberships-subscriptions" element={<MembershipsSubscriptionsPage />} />
            <Route path="/message-centre" element={<MessageCentrePage />} />
            <Route path="/your-addresses" element={<AddressesPage />} />
            <Route path='/email-subscribe' element={<EmailSubscriptionsPage/>}  />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/shopping-preferences" element={<ProfilePage />} />
            <Route path ='/manage-payment' element={<ManagePaymentPage/>} />
          
            {/* Protected routes - require authentication */}
            <Route path="/cart" element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            } />
           
            <Route path="/orders" element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            } />
            <Route path="/profile-protected" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/*" element={<AdminRouter />} />
            <Route path="/seller/*" element={<SellerRouter />} />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
