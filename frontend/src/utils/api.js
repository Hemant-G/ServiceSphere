import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (formData) => api.put('/auth/profile', formData, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  getUserProfile: (userId) => api.get(`/auth/users/${userId}`),
};

// Services API calls
export const servicesAPI = {
  getAll: (params) => api.get('/services', { params }),
  getById: (id) => api.get(`/services/${id}`),
  getCategories: () => api.get('/services/categories'),
  getByProvider: (providerId) => api.get(`/services/provider/${providerId}`),
  getMyServices: () => api.get('/services/my-services'),
  create: (serviceData) => api.post('/services', serviceData),
  getPredefined: () => api.get('/services/predefined'),
  update: (id, serviceData) => api.put(`/services/${id}`, serviceData),
  delete: (id) => api.delete(`/services/${id}`),
};

// Bookings API calls
export const bookingsAPI = {
  create: (bookingData) => {
    return api.post('/bookings', bookingData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, statusData) => api.put(`/bookings/${id}/status`, statusData),
  getStats: () => api.get('/bookings/stats'),
};

// Portfolio API calls
export const portfolioAPI = {
  create: (payload) => {
    if (payload instanceof FormData) {
      return api.post('/portfolio', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    // JSON payload (e.g., images metadata already uploaded to Cloudinary)
    return api.post('/portfolio', payload);
  },
  getByProvider: (providerId, params) => api.get(`/portfolio/provider/${providerId}`, { params }),
  getMyPortfolio: () => api.get('/portfolio/my-portfolio'),
  getById: (id) => api.get(`/portfolio/${id}`),
  update: (id, formData) => api.put(`/portfolio/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/portfolio/${id}`),
  getCategories: () => api.get('/portfolio/categories'),
};

// Reviews API calls
export const reviewsAPI = {
  create: (reviewData) => api.post('/reviews', reviewData),
  getByProvider: (providerId, params) => api.get(`/reviews/provider/${providerId}`, { params }),
  getByService: (serviceId, params) => api.get(`/reviews/service/${serviceId}`, { params }),
  getMyReviews: () => api.get('/reviews/my-reviews'),
  update: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
  getStats: (providerId) => api.get(`/reviews/stats/${providerId}`),
};

// Provider API calls
export const providerAPI = {
  getProfile: () => api.get('/providers/profile'),
  updateProfile: (profileData) => api.put('/providers/profile', profileData),
  getStats: () => api.get('/providers/stats'),
  getServices: () => api.get('/providers/services'),
  getBookings: (params) => api.get('/providers/bookings', { params }),
};

export default api;
