import axios from 'axios';

// Base URL is read from Vite environment variable VITE_API_BASE_URL.
// If not provided, fall back to the local development API.
// IMPORTANT: In production, this MUST be set to HTTPS URL (e.g., https://api.sixpine.in/api)
const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000/api';

// Create axios instance with base configuration
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased default timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only logout on 401 if it's not a timeout error
    // Timeout errors might cause 401 but shouldn't trigger logout
    if (error.response?.status === 401) {
      // Check if it's a timeout error (code will be 'ECONNABORTED' or message contains timeout)
      const isTimeout = error.code === 'ECONNABORTED' || 
                       error.message?.toLowerCase().includes('timeout') ||
                       error.response?.data?.detail?.toLowerCase().includes('timeout');
      
      if (!isTimeout) {
        // Token expired or invalid (not a timeout)
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        // Define public routes that should not redirect to login
        const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/products', '/products-details', '/about', '/career', '/global-selling', '/press-release', '/privacy-policy', '/contact', '/trending', '/best-deals', '/terms-and-conditions', '/warranty-policy', '/faqs', '/help', '/help-center'];
        
        // Only redirect to login if not on a public route and not already on login page
        const currentPath = window.location.pathname;
        const isPublicRoute = publicRoutes.some(route => currentPath === route || currentPath.startsWith(route + '/'));
        const isLoginPage = currentPath.includes('/login');
        
        if (!isPublicRoute && !isLoginPage) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    API.post('/auth/login/', credentials),
  
  register: (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
  }) => API.post('/auth/register/', userData),
  
  requestOTP: (userData: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    mobile?: string;
    otp_method?: 'email' | 'whatsapp';
  }) => API.post('/auth/register/request-otp/', userData),
  
  verifyOTP: (data: { email: string; otp: string }) =>
    API.post('/auth/register/verify-otp/', data),
  
  resendOTP: (data: { email: string; otp_method?: 'email' | 'whatsapp' }) =>
    API.post('/auth/register/resend-otp/', data),
  
  logout: () => API.post('/auth/logout/'),
  
  getProfile: () => API.get('/auth/profile/'),
  
  updateProfile: (data: any) => API.put('/auth/profile/update/', data),
  
  changePassword: (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => API.post('/auth/change-password/', data),
  
  // Password reset functionality
  requestPasswordReset: (data: { email: string }) =>
    API.post('/auth/password-reset/request/', data),
  
  confirmPasswordReset: (data: {
    token: string;
    new_password: string;
    new_password_confirm: string;
  }) => API.post('/auth/password-reset/confirm/', data),
};

// Vendor API calls
export const vendorAPI = {
  register: (vendorData: {
    business_name: string;
    business_email: string;
    business_phone: string;
    business_address: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    gst_number?: string;
    pan_number?: string;
    business_type?: string;
    brand_name: string;
    email: string;
    first_name: string;
    last_name: string;
    username?: string;
    password: string;
    password_confirm: string;
  }) => API.post('/auth/seller/register/', vendorData),
  
  login: (credentials: { username: string; password: string }) =>
    API.post('/auth/seller/login/', credentials),
  
  getProfile: () => API.get('/auth/vendor/profile/'),
};

// Seller API calls (for seller panel)
export const sellerAPI = {
  getDashboardStats: () => API.get('/seller/dashboard/stats/'),
  getProducts: (params?: any) => API.get('/seller/products/', { params }),
  getProduct: (id: number) => API.get(`/seller/products/${id}/`),
  createProduct: (data: any) => API.post('/seller/products/', data, {
    timeout: 60000
  }),
  updateProduct: (id: number, data: any) => API.patch(`/seller/products/${id}/`, data, {
    timeout: 60000
  }),
  deleteProduct: (id: number) => API.delete(`/seller/products/${id}/`),
  toggleProductActive: (id: number) => API.post(`/seller/products/${id}/toggle_active/`),
  toggleProductFeatured: (id: number) => API.post(`/seller/products/${id}/toggle_featured/`),
  updateProductStock: (id: number, variant_id: number, quantity: number) => 
    API.post(`/seller/products/${id}/update_stock/`, { variant_id, quantity }),
  getOrders: (params?: any) => API.get('/seller/orders/', { params }),
  getOrder: (id: number) => API.get(`/seller/orders/${id}/`),
  updateOrder: (id: number, data: any) => API.patch(`/seller/orders/${id}/`, data),
  updateOrderStatus: (id: number, status: string, notes?: string) =>
    API.post(`/seller/orders/${id}/update_status/`, { status, notes }),
  updatePaymentStatus: (id: number, payment_status: string, notes?: string) =>
    API.post(`/seller/orders/${id}/update_payment_status/`, { payment_status, notes }),
  getCoupons: (params?: any) => API.get('/seller/coupons/', { params }),
  getCoupon: (id: number) => API.get(`/seller/coupons/${id}/`),
  createCoupon: (data: any) => API.post('/seller/coupons/', data),
  updateCoupon: (id: number, data: any) => API.put(`/seller/coupons/${id}/`, data),
  deleteCoupon: (id: number) => API.delete(`/seller/coupons/${id}/`),
  getBrandAnalytics: () => API.get('/seller/brand-analytics/'),
  getShipmentSettings: () => API.get('/seller/shipment-settings/'),
  updateShipmentSettings: (data: any) => API.put('/seller/shipment-settings/', data),
  getSettings: () => API.get('/seller/settings/'),
  updateSettings: (data: any) => API.put('/seller/settings/', data),
  changePassword: (data: { current_password: string; new_password: string }) => API.post('/seller/settings/change-password/', data),
  // Communication
  getCustomersList: () => API.get('/seller/communication/customers/'),
  getAdminEmail: () => API.get('/seller/communication/admin-email/'),
  sendEmail: (data: { recipient_type: 'customer' | 'admin'; recipient_id?: number; subject: string; message: string }) => 
    API.post('/seller/communication/send-email/', data),
  // Payment
  getPaymentDashboard: () => API.get('/seller/payment/dashboard/'),
  // Filter options - use admin endpoints (read-only for sellers)
  getCategories: (params?: any) => API.get('/admin/categories/', { params }),
  getCategoriesHierarchical: () => API.get('/admin/categories/hierarchical/'),
  getCategory: (id: number) => API.get(`/admin/categories/${id}/`),
  getCategorySpecificationDefaults: (categoryId: number) => API.get(`/admin/categories/${categoryId}/specification_defaults/`),
  getSubcategories: (params?: any) => API.get('/admin/subcategories/', { params }),
  getSubcategory: (id: number) => API.get(`/admin/subcategories/${id}/`),
  getColors: (params?: any) => API.get('/admin/colors/', { params }),
  getColor: (id: number) => API.get(`/admin/colors/${id}/`),
  getMaterials: (params?: any) => API.get('/admin/materials/', { params }),
  getMaterial: (id: number) => API.get(`/admin/materials/${id}/`),
  // Media
  getMedia: (params?: any) => API.get('/seller/media/', { params }),
  getMediaItem: (id: number) => API.get(`/seller/media/${id}/`),
  uploadMedia: (formData: FormData) => API.post('/seller/media/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000
  }),
  deleteMedia: (id: number) => API.delete(`/seller/media/${id}/`),
};

// Product API calls
export const productAPI = {
  getCategories: () => API.get('/categories/'),
  
  getNavbarCategories: () => API.get('/navbar-categories/'),
  
  getSubcategories: (categorySlug?: string) => 
    categorySlug ? API.get(`/categories/${categorySlug}/subcategories/`) : API.get('/subcategories/'),
  
  getColors: () => API.get('/colors/'),
  
  getMaterials: () => API.get('/materials/'),
  
  getProducts: (params?: any) => API.get('/products/', { params }),
  
  getProduct: (slug: string) => API.get(`/products/${slug}/`),
  
  getProductDetail: (slug: string) => API.get(`/products/${slug}/`),
  
  getFeaturedProducts: () => API.get('/products/featured/'),
  
  getNewArrivals: () => API.get('/products/new-arrivals/'),
  
  searchProducts: (query: string, params?: any) => 
    API.get(`/products/search/?q=${encodeURIComponent(query)}`, { params }),
  
  advancedSearch: (params?: any) => API.get('/products/advanced-search/', { params }),
  
  getSearchSuggestions: (query: string) => 
    API.get(`/search/suggestions/?q=${encodeURIComponent(query)}`),
  
  getHomeData: () => API.get('/home-data/'),
  
  getThemeColors: () => API.get('/theme-colors/'),
  
  getProductReviews: (slug: string) => API.get(`/products/${slug}/reviews/`),
  
  addReview: (slug: string, reviewData: any) => {
    // If reviewData is FormData, don't set Content-Type header
    const config = reviewData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    return API.post(`/products/${slug}/reviews/`, reviewData, config);
  },
  
  getProductRecommendations: (slug: string) => 
    API.get(`/products/${slug}/recommendations/`),
  
  getFilterOptions: (params?: any) => API.get('/filter-options/', { params }),
  getBrands: () => API.get('/brands/'),
  
  // Browsing history
  trackBrowsingHistory: (productId: number) =>
    API.post('/browsing-history/track/', { product_id: productId }),
  
  getBrowsingHistory: (limit?: number) =>
    API.get('/browsing-history/', { params: limit ? { limit } : {} }),
  
  getBrowsedCategories: () => API.get('/browsing-history/categories/'),
  
  clearBrowsingHistory: (productId?: number) =>
    API.delete('/browsing-history/clear/', { params: productId ? { product_id: productId } : {} }),
  
  clearAllUserData: () => API.delete('/clear-all-data/'),
};

// Cart API calls
export const cartAPI = {
  getCart: () => API.get('/cart/'),
  
  addToCart: (data: { product_id: number; quantity: number; variant_id?: number }) =>
    API.post('/cart/add/', data),
  
  updateCartItem: (itemId: number, data: { quantity: number }) =>
    API.put(`/cart/items/${itemId}/`, data),
  
  removeFromCart: (itemId: number) =>
    API.delete(`/cart/items/${itemId}/remove/`),
  
  clearCart: () => API.delete('/cart/clear/'),
};

// Offers API calls
export const offersAPI = {
  getActiveOffers: () => API.get('/offers/'),
  
  createOffer: (data: any) =>
    API.post('/offers/create/', data),
};

// Wishlist API calls
export const wishlistAPI = {
  getWishlist: () => API.get('/wishlist/'),
  
  addToWishlist: (productId: number) =>
    API.post('/wishlist/', { product_id: productId }),
  
  removeFromWishlist: (itemId: number) =>
    API.delete(`/wishlist/${itemId}/`),
};

// Address API calls
export const addressAPI = {
  getAddresses: () => API.get('/addresses/'),
  
  addAddress: (data: any) => API.post('/addresses/', data),
  
  updateAddress: (id: number, data: any) => API.put(`/addresses/${id}/`, data),
  
  deleteAddress: (id: number) => API.delete(`/addresses/${id}/`),
};

// Payment Preferences API calls
export const paymentPreferencesAPI = {
  getPaymentPreference: () => API.get('/auth/payment-preferences/'),
  
  updatePaymentPreference: (data: {
    preferred_method?: string;
    preferred_card_token_id?: string;
  }) => API.patch('/auth/payment-preferences/update/', data),
  
  getSavedCards: () => API.get('/auth/payment-preferences/saved-cards/'),
  
  deleteSavedCard: (tokenId: string) => API.delete(`/auth/payment-preferences/saved-cards/${tokenId}/delete/`),
};

// Order API calls
export const orderAPI = {
  getOrders: () => API.get('/orders/'),
  
  getOrder: (orderId: string) => API.get(`/orders/${orderId}/`),

  downloadInvoice: (orderId: string) => API.get(`/orders/${orderId}/invoice/`, {
    responseType: 'blob',
  }),

  createOrder: (data: any) => API.post('/orders/create/', data),
  
  checkoutFromCart: (data: { shipping_address_id: number; order_notes?: string }) =>
    API.post('/orders/checkout/', data),
  
  cancelOrder: (orderId: string) => API.post(`/orders/${orderId}/cancel/`),
  
  createRazorpayOrder: (data: { amount: number; shipping_address_id: number; coupon_id?: number }) =>
    API.post('/orders/razorpay/create-order/', data),
  
  verifyRazorpayPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    shipping_address_id: number;
    payment_method?: string;
    coupon_id?: number;
  }) => API.post('/orders/razorpay/verify-payment/', data),
  
  // Cashfree Payment Gateway
  createCashfreeOrder: (data: { amount: number; shipping_address_id: number; payment_method?: string; coupon_id?: number; return_url?: string }) =>
    API.post('/orders/cashfree/create-order/', data),
  
  verifyCashfreePayment: (data: {
    cf_order_id?: string;
    order_id: string;
    shipping_address_id: number;
    payment_method?: string;
    coupon_id?: number;
  }) => API.post('/orders/cashfree/verify-payment/', data),
  
  getActivePaymentGateway: () => API.get('/payment-gateway/'),
  
  checkoutWithCOD: (data: { shipping_address_id: number; order_notes?: string; coupon_id?: number }) =>
    API.post('/orders/checkout/cod/', data),
  
  validateCoupon: (data: { code: string; order_amount: number; cart_items?: Array<{ product_id: number; quantity: number; price: number }> }) =>
    API.post('/orders/validate-coupon/', data),
  
  completePayment: (data: {
    order_id: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    payment_method?: string;
  }) => API.post('/orders/complete-payment/', data),
  
  getPaymentCharges: () => API.get('/payment-charges/'),
  
  // Return requests
  submitReturnRequest: (data: {
    order_id: string;
    order_item: number;
    reason: string;
    reason_description?: string;
    pickup_date: string;
  }) => API.post('/returns/submit/', data),
  
  getReturnRequests: () => API.get('/returns/'),
  
  getSellerReturnRequests: () => API.get('/returns/seller/'),
  
  approveReturnRequest: (returnRequestId: number, data: {
    approval: boolean;
    seller_notes?: string;
  }) => API.post(`/returns/${returnRequestId}/approve/`, data),
  
  // Admin Sixpine return requests
  getAdminSixpineReturnRequests: () => API.get('/returns/admin/sixpine/'),
  
  approveAdminSixpineReturnRequest: (returnRequestId: number, data: {
    approval: boolean;
    seller_notes?: string;
  }) => API.post(`/returns/admin/sixpine/${returnRequestId}/approve/`, data),
};

// Homepage Content API calls (public)
export const homepageAPI = {
  getHomepageContent: (sectionKey?: string) => {
    const params = sectionKey ? { section_key: sectionKey } : {};
    return API.get('/homepage-content/', { params });
  },
};

// Bulk Order Page Content API calls (public)
export const bulkOrderPageAPI = {
  getBulkOrderPageContent: (sectionKey?: string) => {
    const params = sectionKey ? { section_key: sectionKey } : {};
    return API.get('/bulk-order-page-content/', { params });
  },
};

// FAQ Page Content API calls (public)
export const faqPageAPI = {
  getFAQPageContent: (sectionKey?: string) => {
    const params = sectionKey ? { section_key: sectionKey } : {};
    return API.get('/faq-page-content/', { params });
  },
};

// Advertisement API calls (public)
export const advertisementAPI = {
  getActiveAdvertisements: () => API.get('/advertisements/'),
};

// Data Request API calls
export const dataRequestAPI = {
  createRequest: (requestType: 'orders' | 'addresses' | 'payment_options') =>
    API.post('/auth/data-requests/create/', { request_type: requestType }),
  
  getUserRequests: () => API.get('/auth/data-requests/'),
  
  downloadFile: (requestId: number) =>
    API.get(`/auth/data-requests/${requestId}/download/`, {
      responseType: 'blob',
    }),
};

// Account Closure API calls
export const accountClosureAPI = {
  checkEligibility: () => API.get('/auth/account/check-deletion-eligibility/'),
  closeAccount: (reason?: string) => API.post('/auth/account/close/', { reason }),
};

// Packaging Feedback API calls
export const packagingFeedbackAPI = {
  submitFeedback: (data: {
    feedback_type?: string;
    rating?: number;
    was_helpful?: boolean;
    message: string;
    order_id?: string;
    product_id?: number;
    email?: string;
    name?: string;
  }) => API.post('/auth/packaging-feedback/submit/', data),
};

export default API;