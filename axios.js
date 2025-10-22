import axios from "axios";
import { handleApiError, validateApiResponse } from "./src/utils/apiErrorHandler";

const api = axios.create({
  baseURL: "https://ludobackend-1-sguh.onrender.com/api", // replace with your backend URL
  timeout: 15000, // Increased timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    
    // Validate response format
    try {
      validateApiResponse(response);
    } catch (validationError) {
      console.error('Response validation error:', validationError);
      return Promise.reject(validationError);
    }

    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.url}`, error.message);
    
    // Handle specific error scenarios
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your connection and try again.';
    } else if (error.message === 'Network Error') {
      error.message = 'Network error. Please check your internet connection.';
    }

    // Don't show alert here - let components handle it
    handleApiError(error, false);
    
    return Promise.reject(error);
  }
);

export default api;