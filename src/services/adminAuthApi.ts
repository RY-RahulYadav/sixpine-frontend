import API from './api';

// Admin Auth API calls
export const adminAuthAPI = {
  login: (credentials: { username: string; password: string }) =>
    API.post('/admin/auth/login/', credentials),
  
  logout: () => API.post('/admin/auth/logout/'),
  
  getProfile: () => API.get('/admin/auth/profile/'),
};

export default adminAuthAPI;