import React, { createContext, useContext, useReducer } from 'react';
import { bookingsAPI } from '../utils/api';
import { BOOKING_STATUS } from '../utils/constants';

// Initial state
const initialState = {
  bookings: [],
  currentBooking: null,
  filters: {
    status: '',
    dateRange: {
      start: '',
      end: '',
    },
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  stats: {
    totalBookings: 0,
    totalRevenue: 0,
    statusCounts: {},
  },
  isLoading: false,
  error: null,
};

// Action types
const BOOKING_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_BOOKINGS: 'SET_BOOKINGS',
  SET_CURRENT_BOOKING: 'SET_CURRENT_BOOKING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
  ADD_BOOKING: 'ADD_BOOKING',
  UPDATE_BOOKING: 'UPDATE_BOOKING',
  REMOVE_BOOKING: 'REMOVE_BOOKING',
  SET_STATS: 'SET_STATS',
};

// Reducer
const bookingReducer = (state, action) => {
  switch (action.type) {
    case BOOKING_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case BOOKING_ACTIONS.SET_BOOKINGS:
      return {
        ...state,
        bookings: action.payload.bookings,
        pagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };
    case BOOKING_ACTIONS.SET_CURRENT_BOOKING:
      return {
        ...state,
        currentBooking: action.payload,
      };
    case BOOKING_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case BOOKING_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case BOOKING_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case BOOKING_ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: {
          status: '',
          dateRange: {
            start: '',
            end: '',
          },
        },
      };
    case BOOKING_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload },
      };
    case BOOKING_ACTIONS.ADD_BOOKING:
      return {
        ...state,
        bookings: [action.payload, ...state.bookings],
      };
    case BOOKING_ACTIONS.UPDATE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.map(booking =>
          booking._id === action.payload._id ? action.payload : booking
        ),
        currentBooking: state.currentBooking?._id === action.payload._id 
          ? action.payload 
          : state.currentBooking,
      };
    case BOOKING_ACTIONS.REMOVE_BOOKING:
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking._id !== action.payload),
      };
    case BOOKING_ACTIONS.SET_STATS:
      return {
        ...state,
        stats: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const BookingContext = createContext();

// Booking provider component
export const BookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // Fetch bookings
  const fetchBookings = async (params = {}) => {
    try {
      dispatch({ type: BOOKING_ACTIONS.SET_LOADING, payload: true });

      const queryParams = {
        ...params,
        ...state.filters,
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '' || queryParams[key] === null) {
          delete queryParams[key];
        }
      });

      const response = await bookingsAPI.getMyBookings(queryParams);
      const { data: bookings, pagination } = response.data;

      dispatch({
        type: BOOKING_ACTIONS.SET_BOOKINGS,
        payload: { bookings, pagination },
      });

      return { success: true, bookings, pagination };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch bookings';
      dispatch({ type: BOOKING_ACTIONS.SET_ERROR, payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // Fetch booking by ID
  const fetchBookingById = async (id) => {
    try {
      const response = await bookingsAPI.getById(id);
      const booking = response.data.data;

      dispatch({ type: BOOKING_ACTIONS.SET_CURRENT_BOOKING, payload: booking });
      return { success: true, booking };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Booking not found';
      return { success: false, error: errorMessage };
    }
  };

  // Create booking
  const createBooking = async (bookingData) => {
    try {
      const response = await bookingsAPI.create(bookingData);
      const newBooking = response.data.data;

      dispatch({ type: BOOKING_ACTIONS.ADD_BOOKING, payload: newBooking });
      return { success: true, booking: newBooking };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create booking';
      return { success: false, error: errorMessage };
    }
  };

  // Update booking status
  const updateBookingStatus = async (id, statusData) => {
    try {
      const response = await bookingsAPI.updateStatus(id, statusData);
      const updatedBooking = response.data.data;

      dispatch({ type: BOOKING_ACTIONS.UPDATE_BOOKING, payload: updatedBooking });
      return { success: true, booking: updatedBooking };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update booking';
      return { success: false, error: errorMessage };
    }
  };

  // Fetch booking stats
  const fetchBookingStats = async () => {
    try {
      const response = await bookingsAPI.getStats();
      const stats = response.data.data;

      dispatch({ type: BOOKING_ACTIONS.SET_STATS, payload: stats });
      return { success: true, stats };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch stats';
      return { success: false, error: errorMessage };
    }
  };

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: BOOKING_ACTIONS.SET_FILTERS, payload: filters });
  };

  // Clear filters
  const clearFilters = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_FILTERS });
  };

  // Set pagination
  const setPagination = (pagination) => {
    dispatch({ type: BOOKING_ACTIONS.SET_PAGINATION, payload: pagination });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: BOOKING_ACTIONS.CLEAR_ERROR });
  };

  // Get bookings by status
  const getBookingsByStatus = (status) => {
    return state.bookings.filter(booking => booking.status === status);
  };

  // Get pending bookings
  const getPendingBookings = () => {
    return getBookingsByStatus(BOOKING_STATUS.PENDING);
  };

  // Get accepted bookings
  const getAcceptedBookings = () => {
    return getBookingsByStatus(BOOKING_STATUS.ACCEPTED);
  };

  // Get in-progress bookings
  const getInProgressBookings = () => {
    return getBookingsByStatus(BOOKING_STATUS.IN_PROGRESS);
  };

  // Get completed bookings
  const getCompletedBookings = () => {
    return getBookingsByStatus(BOOKING_STATUS.COMPLETED);
  };

  // Get cancelled bookings
  const getCancelledBookings = () => {
    return getBookingsByStatus(BOOKING_STATUS.CANCELLED);
  };

  // Get rejected bookings
  const getRejectedBookings = () => {
    return getBookingsByStatus(BOOKING_STATUS.REJECTED);
  };

  // Get upcoming bookings
  const getUpcomingBookings = () => {
    const now = new Date();
    return state.bookings.filter(booking => 
      new Date(booking.scheduledDate) > now && 
      [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.IN_PROGRESS].includes(booking.status)
    );
  };

  // Get total revenue
  const getTotalRevenue = () => {
    return state.bookings
      .filter(booking => booking.status === BOOKING_STATUS.COMPLETED)
      .reduce((total, booking) => total + booking.totalPrice, 0);
  };

  const value = {
    ...state,
    fetchBookings,
    fetchBookingById,
    createBooking,
    updateBookingStatus,
    fetchBookingStats,
    setFilters,
    clearFilters,
    setPagination,
    clearError,
    getBookingsByStatus,
    getPendingBookings,
    getAcceptedBookings,
    getInProgressBookings,
    getCompletedBookings,
    getCancelledBookings,
    getRejectedBookings,
    getUpcomingBookings,
    getTotalRevenue,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

// Custom hook to use booking context
export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export default BookingContext;
