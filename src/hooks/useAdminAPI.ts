import { useLocation } from 'react-router-dom';
import adminAPI from '../services/adminApi';
import { sellerAPI } from '../services/api';

/**
 * Hook to get the appropriate API based on current route
 * Returns sellerAPI if in /seller routes, otherwise adminAPI
 */
export const useAdminAPI = (): typeof sellerAPI | typeof adminAPI => {
  const location = useLocation();
  const isSellerMode = location.pathname.startsWith('/seller');
  
  return isSellerMode ? sellerAPI : adminAPI;
};

