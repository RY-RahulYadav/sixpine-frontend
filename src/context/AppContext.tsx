import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, cartAPI } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser?: boolean;
}

interface CartItem {
  id: number;
  product: {
    id: number;
    title: string;
    price: number;
    main_image: string;
    slug: string;
  };
  quantity: number;
  total_price: number;
}

interface Cart {
  id: number;
  items: CartItem[];
  total_items: number;
  total_price: number;
  items_count: number;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  cartSidebarOpen: boolean;
}

type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'CLEAR_CART' }
  | { type: 'INIT_COMPLETE' }
  | { type: 'OPEN_CART_SIDEBAR' }
  | { type: 'CLOSE_CART_SIDEBAR' };

const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  cart: null,
  loading: true, // Start with loading true to prevent premature redirects
  error: null,
  cartSidebarOpen: false,
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number, variantId?: number) => Promise<void>;
  openCartSidebar: () => void;
  closeCartSidebar: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'INIT_COMPLETE':
      return {
        ...state,
        loading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: null,
        cartSidebarOpen: false,
      };
    case 'SET_CART':
      return { ...state, cart: action.payload };
    case 'CLEAR_CART':
      return { ...state, cart: null };
    case 'OPEN_CART_SIDEBAR':
      return { ...state, cartSidebarOpen: true };
    case 'CLOSE_CART_SIDEBAR':
      return { ...state, cartSidebarOpen: false };
    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize app state
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user: parsedUser, token } });
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        dispatch({ type: 'INIT_COMPLETE' });
      }
    } else {
      // No token found, initialization complete
      dispatch({ type: 'INIT_COMPLETE' });
    }
  }, []);

  // Fetch cart when user is authenticated
  useEffect(() => {
    if (state.isAuthenticated) {
      fetchCart();
    }
  }, [state.isAuthenticated]);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.login(credentials);
      const { user, token } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const fetchCart = async () => {
    try {
      const response = await cartAPI.getCart();
      dispatch({ type: 'SET_CART', payload: response.data });
    } catch (error: any) {
      console.error('Fetch cart error:', error);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1, variantId?: number) => {
    try {
      await cartAPI.addToCart({ product_id: productId, quantity, variant_id: variantId });
      await fetchCart(); // Refresh cart
      dispatch({ type: 'OPEN_CART_SIDEBAR' }); // Open sidebar after adding to cart
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add to cart';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  };

  const openCartSidebar = () => {
    dispatch({ type: 'OPEN_CART_SIDEBAR' });
  };

  const closeCartSidebar = () => {
    dispatch({ type: 'CLOSE_CART_SIDEBAR' });
  };

  const value = {
    state,
    dispatch,
    login,
    logout,
    fetchCart,
    addToCart,
    openCartSidebar,
    closeCartSidebar,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};