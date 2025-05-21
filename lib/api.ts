// API client for interacting with the backend
import type { Product, Category, UseCase, Order, CartItem, OrderItem } from "@/lib/types"

// API base URL - set correct port for backend
const API_BASE_URL = 'http://localhost:5000/api';

// Local storage keys
const TOKEN_KEY = 'fertishop-token';

// Function to safely check if we're in a browser environment
const isBrowser = () => typeof window !== 'undefined';

// Function to get the authentication token
export const getToken = (): string | null => {
  if (isBrowser()) {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }
  return null;
};

// Function to set the authentication token
export const setToken = (token: string): void => {
  if (isBrowser()) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token in localStorage:', error);
    }
  }
};

// Function to remove the authentication token
export const removeToken = (): void => {
  if (isBrowser()) {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  }
};

// Simple direct fetch without timeout
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  // Don't attempt API requests during SSR
  if (typeof window === 'undefined') {
    console.warn('API request attempted during SSR');
    return {};
  }

  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`Making API request to: ${url}`);
  
  // Prepare headers with authorization if token exists
  const token = getToken();
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  });
  
  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }
  
  try {
    // Make request with robust error handling
    const response = await fetch(url, {
      ...options,
      headers,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include'
    });
    
    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If parsing JSON fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      console.error(`API Error (${endpoint}):`, errorMessage);
      throw new Error(errorMessage);
    }
    
    // Parse and return JSON response
    return await response.json();
  } catch (error) {
    console.error(`Request to ${url} failed:`, error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    try {
      console.log(`Attempting login for ${email} to ${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Important for cookies
        mode: 'cors',
      });
      
      console.log(`Login response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Login failed');
      }
      
      const responseData = await response.json();
      console.log("Login response data:", responseData);
      
      // Store token
      if (responseData.token) {
        setToken(responseData.token);
        console.log("Login successful, token stored");
      } else {
        console.warn("Login response did not contain token");
      }
      
      return responseData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    try {
      console.log("Attempting signup for:", email);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        let errorMessage = 'Signup failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // Ignore JSON parse errors
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Store token
      if (data.token) {
        setToken(data.token);
        console.log("Signup successful, token stored");
      }
      
      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  logout: () => {
    removeToken();
    // Clear cookies if needed
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
    console.log("Logged out, tokens and cookies cleared");
  },

  getMe: async () => {
    try {
      console.log("Fetching current user data");
      const token = getToken();
      if (!token) {
        console.log("No token found, user is not logged in");
        return { user: null };
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
      });
      
      if (!response.ok) {
        // If unauthorized, clear token
        if (response.status === 401) {
          removeToken();
          console.log("Auth token invalid, cleared");
        }
        return { user: null };
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error getting user data:", error);
      return { user: null };
    }
  },
};

// Helper function to ensure product images have a default
const ensureProductImage = (product: Product): Product => {
  return {
    ...product,
    image: product.image || "/placeholder.svg"
  };
};

// Products API
export const productsAPI = {
  getAll: async (params?: { 
    category?: string;
    useCase?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.useCase) queryParams.append('useCase', params.useCase);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    
    const data = await apiRequest(endpoint);
    return (data.products || []).map(ensureProductImage) as Product[];
  },

  getFeatured: async (limit?: number) => {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/products/featured${queryString ? `?${queryString}` : ''}`;
    
    const data = await apiRequest(endpoint);
    return (data.products || []).map(ensureProductImage) as Product[];
  },

  getById: async (id: string) => {
    // Convert from "prod-X" format to numeric ID
    const numericId = id.startsWith('prod-') ? parseInt(id.replace('prod-', ''), 10) : parseInt(id, 10);
    
    if (isNaN(numericId)) {
      console.error(`Invalid product ID format: ${id}`);
      throw new Error("Invalid product ID format");
    }
    
    const data = await apiRequest(`/products/${numericId}`);
    return ensureProductImage(data.product) as Product;
  },

  getRelated: async (id: string, limit?: number) => {
    // Convert from "prod-X" format to numeric ID
    const numericId = id.startsWith('prod-') ? parseInt(id.replace('prod-', ''), 10) : parseInt(id, 10);
    
    if (isNaN(numericId)) {
      console.error(`Invalid product ID format: ${id}`);
      throw new Error("Invalid product ID format");
    }
    
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/products/${numericId}/related${queryString ? `?${queryString}` : ''}`;
    
    const data = await apiRequest(endpoint);
    return (data.products || []).map(ensureProductImage) as Product[];
  },
};

// Categories API
export const categoriesAPI = {
  getAll: async () => {
    const data = await apiRequest('/categories');
    return data.categories as Category[];
  },
};

// UseCases API
export const useCasesAPI = {
  getAll: async () => {
    const data = await apiRequest('/usecases');
    return data.useCases as UseCase[];
  },
};

// Cart API
export const cartAPI = {
  getItems: async () => {
    try {
      const data = await apiRequest('/cart');
      // Ensure cart items have image URLs
      return (data.items || []).map((item: any) => ({
        ...item,
        image: item.image || "/placeholder.svg"
      }));
    } catch (error) {
      console.error("Error getting cart items:", error);
      return [];
    }
  },

  addItem: async (productId: string, quantity: number = 1) => {
    // Convert from "prod-X" format to numeric ID
    try {
      let numericId: number;
      
      if (productId.startsWith('prod-')) {
        numericId = parseInt(productId.replace('prod-', ''), 10);
      } else {
        // Try to parse as a number directly
        numericId = parseInt(productId, 10);
      }
      
      if (isNaN(numericId)) {
        console.error(`Invalid product ID format: ${productId}`);
        throw new Error(`Invalid product ID format: ${productId}`);
      }
      
      console.log(`Adding product ID ${numericId} to cart (from product ID: ${productId})`);
      
      return await apiRequest('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: numericId, quantity }),
      });
    } catch (error) {
      console.error(`Error adding product ${productId} to cart:`, error);
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    // Convert from "prod-X" format to numeric ID
    try {
      let numericId: number;
      
      if (productId.startsWith('prod-')) {
        numericId = parseInt(productId.replace('prod-', ''), 10);
      } else {
        // Try to parse as a number directly
        numericId = parseInt(productId, 10);
      }
      
      if (isNaN(numericId)) {
        console.error(`Invalid product ID format: ${productId}`);
        throw new Error(`Invalid product ID format: ${productId}`);
      }
      
      console.log(`Updating quantity for product ID ${numericId} to ${quantity}`);
      
      return await apiRequest('/cart/update', {
        method: 'PUT',
        body: JSON.stringify({ productId: numericId, quantity }),
      });
    } catch (error) {
      console.error(`Error updating quantity for product ${productId}:`, error);
      throw error;
    }
  },

  removeItem: async (productId: string) => {
    // Convert from "prod-X" format to numeric ID
    try {
      let numericId: number;
      
      if (productId.startsWith('prod-')) {
        numericId = parseInt(productId.replace('prod-', ''), 10);
      } else {
        // Try to parse as a number directly
        numericId = parseInt(productId, 10);
      }
      
      if (isNaN(numericId)) {
        console.error(`Invalid product ID format: ${productId}`);
        throw new Error(`Invalid product ID format: ${productId}`);
      }
      
      console.log(`Removing product ID ${numericId} from cart`);
      
      return await apiRequest(`/cart/remove?productId=${numericId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error removing product ${productId} from cart:`, error);
      throw error;
    }
  },

  clearCart: async () => {
    return await apiRequest('/cart/clear', {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  getAll: async () => {
    try {
      const data = await apiRequest('/orders');
      return (data.orders || []).map((order: any) => ({
        ...order,
        items: (order.items || []).map((item: any) => ({
          ...item,
          image: item.image || "/placeholder.svg"
        }))
      })) as Order[];
    } catch (error) {
      console.error("Error getting orders:", error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      // Convert from string ID to numeric ID if needed
      const numericId = id.startsWith('order-') ? parseInt(id.replace('order-', ''), 10) : parseInt(id, 10);
      
      if (isNaN(numericId)) {
        console.error(`Invalid order ID format: ${id}`);
        throw new Error("Invalid order ID format");
      }
      
      const data = await apiRequest(`/orders/${numericId}`);
      const order = data.order || {};
      return {
        ...order,
        items: (order.items || []).map((item: any) => ({
          ...item,
          image: item.image || "/placeholder.svg"
        }))
      } as Order;
    } catch (error) {
      console.error(`Error getting order ${id}:`, error);
      throw error;
    }
  },

  create: async (orderData: {
    address: {
      fullName: string;
      street: string;
      city: string;
      zip: string;
      phone: string;
    };
    paymentMethod: 'gcash' | 'cod';
  }) => {
    try {
      // Format address as JSON string, which is what the backend expects
      const formattedAddress = JSON.stringify(orderData.address);
      
      const data = await apiRequest('/orders', {
        method: 'POST',
        body: JSON.stringify({
          address: formattedAddress,
          paymentMethod: orderData.paymentMethod
        }),
      });
      
      const order = data.order || {};
      return {
        ...order,
        items: (order.items || []).map((item: any) => ({
          ...item,
          image: item.image || "/placeholder.svg"
        }))
      } as Order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  updateStatus: async (orderId: string, status: 'to-pay' | 'to-ship' | 'to-receive' | 'completed') => {
    try {
      // Convert from string ID to numeric ID if needed
      const numericId = orderId.startsWith('order-') ? parseInt(orderId.replace('order-', ''), 10) : parseInt(orderId, 10);
      
      if (isNaN(numericId)) {
        console.error(`Invalid order ID format: ${orderId}`);
        throw new Error("Invalid order ID format");
      }
      
      return await apiRequest(`/orders/${numericId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  },
}; 