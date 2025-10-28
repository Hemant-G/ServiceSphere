import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { portfolioAPI } from '../utils/api';

const PortfolioContext = createContext();

const initialState = {
  portfolioItems: [],
  isLoading: false,
  error: null,
};

const PORTFOLIO_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_PORTFOLIO_ITEMS: 'SET_PORTFOLIO_ITEMS',
  ADD_PORTFOLIO_ITEM: 'ADD_PORTFOLIO_ITEM',
  UPDATE_PORTFOLIO_ITEM: 'UPDATE_PORTFOLIO_ITEM',
  REMOVE_PORTFOLIO_ITEM: 'REMOVE_PORTFOLIO_ITEM',
};

const portfolioReducer = (state, action) => {
  switch (action.type) {
    case PORTFOLIO_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case PORTFOLIO_ACTIONS.SET_ERROR:
      return { ...state, isLoading: false, error: action.payload };
    case PORTFOLIO_ACTIONS.SET_PORTFOLIO_ITEMS:
      return { ...state, isLoading: false, error: null, portfolioItems: action.payload };
    case PORTFOLIO_ACTIONS.ADD_PORTFOLIO_ITEM:
      return { ...state, portfolioItems: [action.payload, ...state.portfolioItems] };
    case PORTFOLIO_ACTIONS.UPDATE_PORTFOLIO_ITEM:
      return {
        ...state,
        portfolioItems: state.portfolioItems.map(item =>
          item._id === action.payload._id ? action.payload : item
        ),
      };
    case PORTFOLIO_ACTIONS.REMOVE_PORTFOLIO_ITEM:
      return {
        ...state,
        portfolioItems: state.portfolioItems.filter(item => item._id !== action.payload),
      };
    default:
      return state;
  }
};

export const PortfolioProvider = ({ children }) => {
  const [state, dispatch] = useReducer(portfolioReducer, initialState);

  const fetchPortfolioItems = useCallback(async (params = {}) => {
    try {
      dispatch({ type: PORTFOLIO_ACTIONS.SET_LOADING, payload: true });
      // Assuming a new endpoint in portfolioAPI for public fetching
      const response = await portfolioAPI.getAll(params); 
      dispatch({ type: PORTFOLIO_ACTIONS.SET_PORTFOLIO_ITEMS, payload: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch portfolio items';
      dispatch({ type: PORTFOLIO_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  const getMyPortfolio = useCallback(async () => {
    try {
      dispatch({ type: PORTFOLIO_ACTIONS.SET_LOADING, payload: true });
      const response = await portfolioAPI.getMyPortfolio();
      dispatch({ type: PORTFOLIO_ACTIONS.SET_PORTFOLIO_ITEMS, payload: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch portfolio';
      dispatch({ type: PORTFOLIO_ACTIONS.SET_ERROR, payload: message });
      return { success: false, error: message };
    }
  }, []);

  const getPortfolioItemById = useCallback(async (id) => {
    try {
      dispatch({ type: PORTFOLIO_ACTIONS.SET_LOADING, payload: true });
      const response = await portfolioAPI.getById(id);
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch item' };
    }
  }, []);

  const createPortfolioItem = async (formData) => {
    try {
      const response = await portfolioAPI.create(formData);
      dispatch({ type: PORTFOLIO_ACTIONS.ADD_PORTFOLIO_ITEM, payload: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to create item' };
    }
  };

  const deletePortfolioItem = async (id) => {
    try {
      await portfolioAPI.delete(id);
      dispatch({ type: PORTFOLIO_ACTIONS.REMOVE_PORTFOLIO_ITEM, payload: id });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to delete item' };
    }
  };

  const updatePortfolioItem = async (id, formData) => {
    try {
      const response = await portfolioAPI.update(id, formData);
      dispatch({ type: PORTFOLIO_ACTIONS.UPDATE_PORTFOLIO_ITEM, payload: response.data.data });
      return { success: true, data: response.data.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Failed to update item' };
    }
  };

  const value = {
    ...state,
    fetchPortfolioItems,
    getMyPortfolio,
    getPortfolioItemById,
    createPortfolioItem,
    deletePortfolioItem,
    updatePortfolioItem,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};