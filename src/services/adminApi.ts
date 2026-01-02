import API from './api';

// Admin API calls
export const adminAPI = {
  // Dashboard
  getDashboardStats: () => API.get('/admin/dashboard/stats/'),
  getPlatformAnalytics: () => API.get('/admin/platform/analytics/'),
  
  // Users
  getUsers: (params?: any) => API.get('/admin/users/', { params }),
  getUser: (id: number) => API.get(`/admin/users/${id}/`),
  createUser: (userData: any) => API.post('/admin/users/', userData),
  updateUser: (id: number, userData: any) => API.put(`/admin/users/${id}/`, userData),
  deleteUser: (id: number) => API.delete(`/admin/users/${id}/`),
  toggleUserActive: (id: number) => API.post(`/admin/users/${id}/toggle_active/`),
  toggleUserStaff: (id: number) => API.post(`/admin/users/${id}/toggle_staff/`),
  resetUserPassword: (id: number, password: string) => 
    API.post(`/admin/users/${id}/reset_password/`, { password }),
  
  // Products
  getProducts: (params?: any) => API.get('/admin/products/', { params }),
  getProduct: (id: number) => API.get(`/admin/products/${id}/`),
  createProduct: (productData: any) => API.post('/admin/products/', productData, {
    timeout: 60000 // 60 seconds for product creation with large payloads
  }),
  updateProduct: (id: number, productData: any) => {
    // Use PATCH for partial updates and increase timeout for large payloads
    return API.patch(`/admin/products/${id}/`, productData, {
      timeout: 120000 // 120 seconds for large product updates (increased for safety)
    });
  },
  deleteProduct: (id: number) => API.delete(`/admin/products/${id}/`),
  toggleProductActive: (id: number) => API.post(`/admin/products/${id}/toggle_active/`),
  toggleProductFeatured: (id: number) => API.post(`/admin/products/${id}/toggle_featured/`),
  updateProductStock: (id: number, variant_id: number, quantity: number) => 
    API.post(`/admin/products/${id}/update_stock/`, { variant_id, quantity }),
  importProductsExcel: (formData: FormData) => API.post('/admin/products/import_excel/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  }),
  updateProductFromExcel: (productId: number, formData: FormData) => API.post(`/admin/products/${productId}/update_from_excel/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000
  }),
  
  // Orders
  getOrders: (params?: any) => API.get('/admin/orders/', { params }),
  getOrder: (id: number) => API.get(`/admin/orders/${id}/`),
  updateOrderStatus: (id: number, status: string, notes?: string) => 
    API.post(`/admin/orders/${id}/update_status/`, { status, notes }),
  updatePaymentStatus: (id: number, payment_status: string, notes?: string) => 
    API.post(`/admin/orders/${id}/update_payment_status/`, { payment_status, notes }),
  updateOrderTracking: (id: number, tracking_number: string, estimated_delivery?: string, notes?: string) => 
    API.post(`/admin/orders/${id}/update_tracking/`, { tracking_number, estimated_delivery, notes }),
  getOrderNotes: (id: number) => API.get(`/admin/orders/${id}/notes/`),
  addOrderNote: (id: number, note: string) => API.post(`/admin/orders/${id}/add_note/`, { note }),
  
  // Categories
  getCategories: (params?: any) => API.get('/admin/categories/', { params }),
  getCategoriesHierarchical: () => API.get('/admin/categories/hierarchical/'),
  getCategory: (id: number) => API.get(`/admin/categories/${id}/`),
  getCategorySpecificationDefaults: (categoryId: number) => API.get(`/admin/categories/${categoryId}/specification_defaults/`),
  // Category Specification Templates
  getCategorySpecificationTemplates: (params?: any) => API.get('/admin/category-specification-templates/', { params }),
  getCategorySpecificationTemplate: (id: number) => API.get(`/admin/category-specification-templates/${id}/`),
  createCategorySpecificationTemplate: (templateData: any) => API.post('/admin/category-specification-templates/', templateData),
  updateCategorySpecificationTemplate: (id: number, templateData: any) => API.put(`/admin/category-specification-templates/${id}/`, templateData),
  deleteCategorySpecificationTemplate: (id: number) => API.delete(`/admin/category-specification-templates/${id}/`),
  createCategory: (categoryData: any) => API.post('/admin/categories/', categoryData),
  updateCategory: (id: number, categoryData: any) => API.put(`/admin/categories/${id}/`, categoryData),
  deleteCategory: (id: number) => API.delete(`/admin/categories/${id}/`),
  
  // Subcategories
  getSubcategories: (params?: any) => API.get('/admin/subcategories/', { params }),
  getSubcategory: (id: number) => API.get(`/admin/subcategories/${id}/`),
  createSubcategory: (subcategoryData: any) => API.post('/admin/subcategories/', subcategoryData),
  updateSubcategory: (id: number, subcategoryData: any) => API.put(`/admin/subcategories/${id}/`, subcategoryData),
  deleteSubcategory: (id: number) => API.delete(`/admin/subcategories/${id}/`),
  
  // Colors
  getColors: (params?: any) => API.get('/admin/colors/', { params }),
  getColor: (id: number) => API.get(`/admin/colors/${id}/`),
  createColor: (colorData: any) => API.post('/admin/colors/', colorData),
  updateColor: (id: number, colorData: any) => API.put(`/admin/colors/${id}/`, colorData),
  deleteColor: (id: number) => API.delete(`/admin/colors/${id}/`),
  
  // Materials
  getMaterials: (params?: any) => API.get('/admin/materials/', { params }),
  getMaterial: (id: number) => API.get(`/admin/materials/${id}/`),
  createMaterial: (materialData: any) => API.post('/admin/materials/', materialData),
  updateMaterial: (id: number, materialData: any) => API.put(`/admin/materials/${id}/`, materialData),
  deleteMaterial: (id: number) => API.delete(`/admin/materials/${id}/`),
  
  // Discounts
  getDiscounts: (params?: any) => API.get('/admin/discounts/', { params }),
  getDiscount: (id: number) => API.get(`/admin/discounts/${id}/`),
  createDiscount: (discountData: any) => API.post('/admin/discounts/', discountData),
  updateDiscount: (id: number, discountData: any) => API.put(`/admin/discounts/${id}/`, discountData),
  deleteDiscount: (id: number) => API.delete(`/admin/discounts/${id}/`),
  
  // Payment & Charges
  getPaymentCharges: () => API.get('/admin/payment-charges/'),
  updatePaymentCharges: (settingsData: any) => API.put('/admin/payment-charges/', settingsData),
  
  // Global Settings
  getGlobalSettings: (key?: string) => {
    const params = key ? { key } : {};
    return API.get('/admin/global-settings/', { params });
  },
  updateGlobalSetting: (key: string, value: string | number, description?: string) =>
    API.put('/admin/global-settings/', { key, value, description }),
  
  // Contact Queries
  getContactQueries: (params?: any) => API.get('/admin/contact-queries/', { params }),
  getContactQuery: (id: number) => API.get(`/admin/contact-queries/${id}/`),
  updateContactQuery: (id: number, data: any) => API.put(`/admin/contact-queries/${id}/`, data),
  updateContactQueryStatus: (id: number, status: string, notes?: string) =>
    API.post(`/admin/contact-queries/${id}/update_status/`, { status, notes }),
  deleteContactQuery: (id: number) => API.delete(`/admin/contact-queries/${id}/`),
  
  // Bulk Orders
  getBulkOrders: (params?: any) => API.get('/admin/bulk-orders/', { params }),
  getBulkOrder: (id: number) => API.get(`/admin/bulk-orders/${id}/`),
  updateBulkOrder: (id: number, data: any) => API.put(`/admin/bulk-orders/${id}/`, data),
  updateBulkOrderStatus: (id: number, status: string, notes?: string, quoted_price?: number) =>
    API.post(`/admin/bulk-orders/${id}/update_status/`, { status, notes, quoted_price }),
  assignBulkOrder: (id: number, admin_id: number) =>
    API.post(`/admin/bulk-orders/${id}/assign/`, { admin_id }),
  deleteBulkOrder: (id: number) => API.delete(`/admin/bulk-orders/${id}/`),
  
  // Logs
  getLogs: (params?: any) => API.get('/admin/logs/', { params }),
  getLog: (id: number) => API.get(`/admin/logs/${id}/`),
  
  // Coupons
  getCoupons: (params?: any) => API.get('/admin/coupons/', { params }),
  getCoupon: (id: number) => API.get(`/admin/coupons/${id}/`),
  createCoupon: (couponData: any) => API.post('/admin/coupons/', couponData),
  updateCoupon: (id: number, couponData: any) => API.put(`/admin/coupons/${id}/`, couponData),
  deleteCoupon: (id: number) => API.delete(`/admin/coupons/${id}/`),
  
  // Homepage Content
  getHomepageContent: (params?: any) => API.get('/admin/homepage-content/', { params }),
  getHomepageContentItem: (id: number) => API.get(`/admin/homepage-content/${id}/`),
  createHomepageContent: (contentData: any) => API.post('/admin/homepage-content/', contentData),
  updateHomepageContent: (id: number, contentData: any) => API.put(`/admin/homepage-content/${id}/`, contentData),
  patchHomepageContent: (id: number, contentData: any) => API.patch(`/admin/homepage-content/${id}/`, contentData),
  deleteHomepageContent: (id: number) => API.delete(`/admin/homepage-content/${id}/`),
  
  // Bulk Order Page Content
  getBulkOrderPageContent: (params?: any) => API.get('/admin/bulk-order-page-content/', { params }),
  getBulkOrderPageContentItem: (id: number) => API.get(`/admin/bulk-order-page-content/${id}/`),
  createBulkOrderPageContent: (contentData: any) => API.post('/admin/bulk-order-page-content/', contentData),
  updateBulkOrderPageContent: (id: number, contentData: any) => API.put(`/admin/bulk-order-page-content/${id}/`, contentData),
  patchBulkOrderPageContent: (id: number, contentData: any) => API.patch(`/admin/bulk-order-page-content/${id}/`, contentData),
  deleteBulkOrderPageContent: (id: number) => API.delete(`/admin/bulk-order-page-content/${id}/`),
  
  // FAQ Page Content
  getFAQPageContent: (params?: any) => API.get('/admin/faq-page-content/', { params }),
  getFAQPageContentItem: (id: number) => API.get(`/admin/faq-page-content/${id}/`),
  createFAQPageContent: (contentData: any) => API.post('/admin/faq-page-content/', contentData),
  updateFAQPageContent: (id: number, contentData: any) => API.put(`/admin/faq-page-content/${id}/`, contentData),
  patchFAQPageContent: (id: number, contentData: any) => API.patch(`/admin/faq-page-content/${id}/`, contentData),
  deleteFAQPageContent: (id: number) => API.delete(`/admin/faq-page-content/${id}/`),
  
  // Advertisement Management
  getAdvertisements: (params?: any) => API.get('/admin/advertisements/', { params }),
  getAdvertisement: (id: number) => API.get(`/admin/advertisements/${id}/`),
  createAdvertisement: (adData: any) => API.post('/admin/advertisements/', adData),
  updateAdvertisement: (id: number, adData: any) => API.put(`/admin/advertisements/${id}/`, adData),
  patchAdvertisement: (id: number, adData: any) => API.patch(`/admin/advertisements/${id}/`, adData),
  deleteAdvertisement: (id: number) => API.delete(`/admin/advertisements/${id}/`),
  
  // Data Requests
  getDataRequests: (params?: any) => API.get('/admin/data-requests/', { params }),
  getDataRequest: (id: number) => API.get(`/admin/data-requests/${id}/`),
  approveDataRequest: (id: number) => API.post(`/admin/data-requests/${id}/approve/`),
  rejectDataRequest: (id: number, adminNotes?: string) => 
    API.post(`/admin/data-requests/${id}/reject/`, { admin_notes: adminNotes }),
  downloadDataRequest: (id: number) => 
    API.get(`/admin/data-requests/${id}/download/`, { responseType: 'blob' }),
  deleteDataRequest: (id: number) => API.delete(`/admin/data-requests/${id}/`),
  bulkDeleteDataRequests: (ids: number[]) => 
    API.post('/admin/data-requests/bulk_delete/', { ids }),
  
  // Brands/Vendors
  getBrands: (params?: any) => API.get('/admin/brands/', { params }),
  getBrand: (id: number) => API.get(`/admin/brands/${id}/`),
  suspendBrand: (id: number) => API.post(`/admin/brands/${id}/suspend/`),
  activateBrand: (id: number) => API.post(`/admin/brands/${id}/activate/`),
  getBrandProducts: (id: number) => API.get(`/admin/brands/${id}/products/`),
  getBrandOrders: (id: number) => API.get(`/admin/brands/${id}/orders/`),
  // Communication
  getCustomersList: () => API.get('/admin/communication/customers/'),
  getVendorsList: () => API.get('/admin/communication/vendors/'),
  sendEmail: (data: { recipient_type: 'customer' | 'vendor'; recipient_id: number; subject: string; message: string }) => 
    API.post('/admin/communication/send-email/', data),
  
  // Media
  getMedia: (params?: any) => API.get('/admin/media/', { params }),
  getMediaItem: (id: number) => API.get(`/admin/media/${id}/`),
  uploadMedia: (formData: FormData, timeout?: number) => API.post('/admin/media/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: timeout || 60000
  }),
  deleteMedia: (id: number) => API.delete(`/admin/media/${id}/`),
  
  // Packaging Feedback
  getPackagingFeedback: (params?: any) => API.get('/admin/packaging-feedback/', { params }),
  getPackagingFeedbackItem: (id: number) => API.get(`/admin/packaging-feedback/${id}/`),
  updatePackagingFeedbackStatus: (id: number, status: string, adminNotes?: string) =>
    API.post(`/admin/packaging-feedback/${id}/update-status/`, { status, admin_notes: adminNotes }),
  deletePackagingFeedback: (id: number) => API.delete(`/admin/packaging-feedback/${id}/`),
  
  // Product Reviews
  getReviews: (params?: any) => API.get('/admin/reviews/', { params }),
  approveReview: (id: number) => API.post(`/admin/reviews/${id}/approve/`),
  rejectReview: (id: number) => API.post(`/admin/reviews/${id}/reject/`),
  deleteReview: (id: number) => API.delete(`/admin/reviews/${id}/delete/`),
  deleteAllReviews: (status?: string) => API.post('/admin/reviews/delete-all/', { status }),
};

export default adminAPI;