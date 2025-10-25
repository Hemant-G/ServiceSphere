import React from 'react';
import {
  FaBroom,
  FaWrench,
  FaPaintRoller,
  FaLeaf,
  FaHammer,
  FaBoxOpen,
  FaDumbbell,
  FaCamera,
  FaBook,
  FaCut,
} from 'react-icons/fa';
import { FiZap, FiTool, FiMoreHorizontal } from 'react-icons/fi';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  SERVICES: {
    ALL: '/services',
    BY_ID: (id) => `/services/${id}`,
    CATEGORIES: '/services/categories',
    BY_PROVIDER: (providerId) => `/services/provider/${providerId}`,
    MY_SERVICES: '/services/my-services',
  },
  BOOKINGS: {
    CREATE: '/bookings',
    MY_BOOKINGS: '/bookings/my-bookings',
    BY_ID: (id) => `/bookings/${id}`,
    UPDATE_STATUS: (id) => `/bookings/${id}/status`,
    STATS: '/bookings/stats',
  },
  PORTFOLIO: {
    CREATE: '/portfolio',
    BY_PROVIDER: (providerId) => `/portfolio/provider/${providerId}`,
    MY_PORTFOLIO: '/portfolio/my-portfolio',
    BY_ID: (id) => `/portfolio/${id}`,
    CATEGORIES: '/portfolio/categories',
  },
  REVIEWS: {
    CREATE: '/reviews',
    BY_PROVIDER: (providerId) => `/reviews/provider/${providerId}`,
    BY_SERVICE: (serviceId) => `/reviews/service/${serviceId}`,
    MY_REVIEWS: '/reviews/my-reviews',
    STATS: (providerId) => `/reviews/stats/${providerId}`,
  },
  PROVIDERS: {
    PROFILE: '/providers/profile',
    STATS: '/providers/stats',
    SERVICES: '/providers/services',
    BOOKINGS: '/providers/bookings',
  },
};

// Service Categories
export const SERVICE_CATEGORIES = [
  { value: 'cleaning', label: 'Cleaning', icon: <FaBroom /> },
  { value: 'plumbing', label: 'Plumbing', icon: <FaWrench /> },
  { value: 'electrical', label: 'Electrical', icon: <FiZap /> },
  { value: 'painting', label: 'Painting', icon: <FaPaintRoller /> },
  { value: 'gardening', label: 'Gardening', icon: <FaLeaf /> },
  { value: 'carpentry', label: 'Carpentry', icon: <FaHammer /> },
  { value: 'appliance-repair', label: 'Appliance Repair', icon: <FiTool /> },
  { value: 'moving', label: 'Moving', icon: <FaBoxOpen /> },
  { value: 'photography', label: 'Photography', icon: <FaCamera /> },
  { value: 'tutoring', label: 'Tutoring', icon: <FaBook /> },
  { value: 'beauty', label: 'Beauty', icon: <FaCut /> },
  { value: 'fitness', label: 'Fitness', icon: <FaDumbbell /> },
  { value: 'other', label: 'Other', icon: <FiMoreHorizontal /> },
];

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'Pending',
  [BOOKING_STATUS.ACCEPTED]: 'Accepted',
  [BOOKING_STATUS.REJECTED]: 'Rejected',
  [BOOKING_STATUS.IN_PROGRESS]: 'In Progress',
  [BOOKING_STATUS.COMPLETED]: 'Completed',
  [BOOKING_STATUS.CANCELLED]: 'Cancelled',
};

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'bg-yellow-100 text-yellow-800',
  [BOOKING_STATUS.ACCEPTED]: 'bg-blue-100 text-blue-800',
  [BOOKING_STATUS.REJECTED]: 'bg-red-100 text-red-800',
  [BOOKING_STATUS.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
  [BOOKING_STATUS.COMPLETED]: 'bg-green-100 text-green-800',
  [BOOKING_STATUS.CANCELLED]: 'bg-gray-100 text-gray-800',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  PROVIDER: 'provider',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.CUSTOMER]: 'Customer',
  [USER_ROLES.PROVIDER]: 'Service Provider',
};

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  UPI: 'upi',
  WALLET: 'wallet',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.CARD]: 'Credit/Debit Card',
  [PAYMENT_METHODS.UPI]: 'UPI',
  [PAYMENT_METHODS.WALLET]: 'Digital Wallet',
};

// Rating Options
export const RATING_OPTIONS = [
  { value: 1, label: 'Poor' },
  { value: 2, label: 'Fair' },
  { value: 3, label: 'Good' },
  { value: 4, label: 'Very Good' },
  { value: 5, label: 'Excellent' },
];

// Detailed Rating Categories
export const DETAILED_RATING_CATEGORIES = {
  QUALITY: 'quality',
  PUNCTUALITY: 'punctuality',
  COMMUNICATION: 'communication',
  VALUE: 'value',
};

export const DETAILED_RATING_LABELS = {
  [DETAILED_RATING_CATEGORIES.QUALITY]: 'Quality of Work',
  [DETAILED_RATING_CATEGORIES.PUNCTUALITY]: 'Punctuality',
  [DETAILED_RATING_CATEGORIES.COMMUNICATION]: 'Communication',
  [DETAILED_RATING_CATEGORIES.VALUE]: 'Value for Money',
};

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf'],
  MAX_FILES: 10,
};

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
};

// Date Formatting
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY h:mm A',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  FILE_TOO_LARGE: 'File size is too large.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  SERVICE_CREATED: 'Service created successfully.',
  SERVICE_UPDATED: 'Service updated successfully.',
  SERVICE_DELETED: 'Service deleted successfully.',
  BOOKING_CREATED: 'Booking created successfully.',
  BOOKING_UPDATED: 'Booking updated successfully.',
  PORTFOLIO_CREATED: 'Portfolio item created successfully.',
  PORTFOLIO_UPDATED: 'Portfolio item updated successfully.',
  PORTFOLIO_DELETED: 'Portfolio item deleted successfully.',
  REVIEW_CREATED: 'Review submitted successfully.',
  REVIEW_UPDATED: 'Review updated successfully.',
  REVIEW_DELETED: 'Review deleted successfully.',
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Service Sphere',
  DESCRIPTION: 'Connect with local service providers',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@servicesphere.com',
  SUPPORT_PHONE: '+1 (555) 123-4567',
};

// API root for constructing media URLs. Uses REACT_APP_API_URL env if provided,
// which typically has the form 'https://api.example.com/api'. We strip any trailing
// '/api' so consumers can append '/uploads/...' paths consistently.
export const API_ROOT = (() => {
  const raw = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  try {
    // Remove trailing '/api' if present
    return raw.replace(/\/api\/?$/, '');
  } catch (e) {
    return raw;
  }
})();
