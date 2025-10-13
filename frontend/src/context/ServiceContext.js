import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { servicesAPI } from '../utils/api';
import { SERVICE_CATEGORIES } from '../utils/constants';


// Initial state
const initialState = {
  services: [],
  categories: SERVICE_CATEGORIES,
  selectedCategory: '',
  searchQuery: '',
  filters: {
    minPrice: '',
    maxPrice: '',
    rating: '',
    location: '',
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,
};

// Action types
const SERVICE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_SERVICES: 'SET_SERVICES',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_CATEGORY: 'SET_CATEGORY',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  ADD_SERVICE: 'ADD_SERVICE',
  UPDATE_SERVICE: 'UPDATE_SERVICE',
  REMOVE_SERVICE: 'REMOVE_SERVICE',
};

// Reducer
const serviceReducer = (state, action) => {
  switch (action.type) {
    case SERVICE_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case SERVICE_ACTIONS.SET_SERVICES:
      return {
        ...state,
        services: action.payload.services,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case SERVICE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case SERVICE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case SERVICE_ACTIONS.SET_CATEGORY:
      return {
        ...state,
        selectedCategory: action.payload,
      };
    case SERVICE_ACTIONS.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };
    case SERVICE_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case SERVICE_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          minPrice: '',
          maxPrice: '',
          rating: '',
          location: '',
        },
        selectedCategory: '',
        searchQuery: '',
      };
    case SERVICE_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    case SERVICE_ACTIONS.ADD_SERVICE:
      return {
        ...state,
        services: [action.payload, ...state.services],
      };
    case SERVICE_ACTIONS.UPDATE_SERVICE:
      return {
        ...state,
        services: state.services.map(service =>
          service._id === action.payload._id ? action.payload : service
        ),
      };
    case SERVICE_ACTIONS.REMOVE_SERVICE:
      return {
        ...state,
        services: state.services.filter(service => service._id !== action.payload),
      };
    default:
      return state;
  }
};

// Create context
const ServiceContext = createContext();

// Service provider component
export const ServiceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(serviceReducer, initialState);

  // Fetch services
  const fetchServices = useCallback(async (params = {}) => {
    try {
      dispatch({ type: SERVICE_ACTIONS.SET_LOADING, payload: true });

      // FIX: Spread context state first, then the explicit params.
      // This ensures that any filter explicitly passed in 'params' (from Services.js) 
      // overrides the filter value currently stored in context state.
      const queryParams = {
        // 1. Current context filters (old/default values)
        category: state.selectedCategory || undefined,
        ...state.filters,

        // 2. Explicit parameters from component (new/correct values)
        ...params,
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await servicesAPI.getAll(queryParams);
      const { data: services, pagination } = response.data;

      dispatch({
        type: SERVICE_ACTIONS.SET_SERVICES,
        payload: { services, pagination },
      });

      return { success: true, services, pagination };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch services';
      dispatch({ type: SERVICE_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [state.selectedCategory, state.filters]);

  // Fetch services for the logged-in provider
  const getMyServices = useCallback(async (params = {}) => {
    try {
      dispatch({ type: SERVICE_ACTIONS.SET_LOADING, payload: true });
      const response = await servicesAPI.getMyServices(params);
      const { data: services, pagination } = response.data;
      dispatch({
        type: SERVICE_ACTIONS.SET_SERVICES,
        payload: { services, pagination },
      });
      return { success: true, services, pagination };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch your services';
      dispatch({ type: SERVICE_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Fetch service by ID
  const fetchServiceById = useCallback(async (id) => {
    try {
      const response = await servicesAPI.getById(id);
      return { success: true, service: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Service not found';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Create service
  const createService = useCallback(async (serviceData) => {
    try {
      const response = await servicesAPI.create(serviceData);
      const newService = response.data.data;

      dispatch({ type: SERVICE_ACTIONS.ADD_SERVICE, payload: newService });
      return { success: true, service: newService };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create service';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update service
  const updateService = useCallback(async (id, serviceData) => {
    try {
      const response = await servicesAPI.update(id, serviceData);
      const updatedService = response.data.data;

      dispatch({ type: SERVICE_ACTIONS.UPDATE_SERVICE, payload: updatedService });
      return { success: true, service: updatedService };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update service';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete service
  const deleteService = useCallback(async (id) => {
    try {
      await servicesAPI.delete(id);
      dispatch({ type: SERVICE_ACTIONS.REMOVE_SERVICE, payload: id });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete service';
      return { success: false, error: errorMessage };
    }
  }, []);

  // Set category filter
  const setCategory = useCallback((category) => {
    dispatch({ type: SERVICE_ACTIONS.SET_CATEGORY, payload: category });
  }, []);

  // Set search query
  const setSearchQuery = useCallback((query) => {
    dispatch({ type: SERVICE_ACTIONS.SET_SEARCH_QUERY, payload: query });
  }, []);

  // Set filters
  const setFilters = useCallback((filters) => {
    dispatch({ type: SERVICE_ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    dispatch({ type: SERVICE_ACTIONS.CLEAR_FILTERS });
  }, []);

  // Set pagination
  const setPagination = useCallback((pagination) => {
    dispatch({ type: SERVICE_ACTIONS.SET_PAGINATION, payload: pagination });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: SERVICE_ACTIONS.CLEAR_ERROR });
  }, []);

  // Get filtered services
  const getFilteredServices = useCallback(() => {
    let filtered = [...state.services];

    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [state.services, state.searchQuery]);

  // Get services by category
  const getServicesByCategory = useCallback((category) => {
    return state.services.filter(service => service.category === category);
  }, [state.services]);

  // Get featured services
  const getFeaturedServices = useCallback(() => {
    return state.services
      .filter(service => service.averageRating >= 4)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 6);
  }, [state.services]);

  const value = {
    ...state,
    fetchServices,
    getMyServices,
    fetchServiceById,
    createService,
    updateService,
    deleteService,
    setCategory,
    setSearchQuery,
    setFilters,
    clearFilters,
    setPagination,
    clearError,
    getFilteredServices,
    getServicesByCategory,
    getFeaturedServices,
    servicesAPI,
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

// Custom hook to use service context
export const useService = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};

export default ServiceContext;