import apiClient from './apiClient';

export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  signup: (userData) => apiClient.post('/auth/signup', userData),
  getProfile: () => apiClient.get('/auth/me'),
  updateProfile: (profileData) => apiClient.put('/auth/profile', profileData),
  changePassword: (passwordData) => apiClient.put('/auth/change-password', passwordData),
};

// You can add other API groups here, e.g., serviceAPI, bookingAPI, etc.