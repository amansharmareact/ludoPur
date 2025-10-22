import { Alert } from 'react-native';

/**
 * Centralized API Error Handler for React Native
 * Provides consistent error handling across the application
 */

export const handleApiError = (error, showAlert = true, customMessage = null) => {
  let message = customMessage || 'Something went wrong';
  let statusCode = 500;

  console.error('API Error:', error);

  // Handle different error scenarios
  if (error.response) {
    // Server responded with error status
    statusCode = error.response.status;
    
    if (error.response.data?.message) {
      message = error.response.data.message;
    } else if (error.response.data?.error) {
      message = error.response.data.error;
    } else {
      // Default messages based on status code
      switch (statusCode) {
        case 400:
          message = 'Invalid request. Please check your input.';
          break;
        case 401:
          message = 'Authentication failed. Please login again.';
          break;
        case 403:
          message = 'Access denied. You don\'t have permission.';
          break;
        case 404:
          message = 'Resource not found.';
          break;
        case 409:
          message = 'Conflict. Resource already exists.';
          break;
        case 422:
          message = 'Validation failed. Please check your input.';
          break;
        case 429:
          message = 'Too many requests. Please try again later.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        case 503:
          message = 'Service unavailable. Please try again later.';
          break;
        default:
          message = `Request failed with status ${statusCode}`;
      }
    }
  } else if (error.request) {
    // Network error - no response received
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      message = 'Network error. Please check your internet connection.';
    } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      message = 'Request timeout. Please try again.';
    } else {
      message = 'Unable to connect to server. Please try again.';
    }
  } else if (error.message) {
    // Other errors
    message = error.message;
  }

  // Show alert if requested
  if (showAlert) {
    Alert.alert(
      'Error',
      message,
      [
        {
          text: 'OK',
          style: 'default'
        }
      ],
      { cancelable: true }
    );
  }

  return {
    message,
    statusCode,
    originalError: error
  };
};

/**
 * Create a retry function for failed requests
 */
export const createRetryHandler = (originalRequest, maxRetries = 3) => {
  let retryCount = 0;

  const retry = async () => {
    if (retryCount >= maxRetries) {
      throw new Error(`Request failed after ${maxRetries} retries`);
    }

    try {
      retryCount++;
      console.log(`Retrying request (attempt ${retryCount}/${maxRetries})`);
      return await originalRequest();
    } catch (error) {
      if (retryCount < maxRetries && isRetryableError(error)) {
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry();
      }
      throw error;
    }
  };

  return retry;
};

/**
 * Check if an error is retryable
 */
const isRetryableError = (error) => {
  if (!error.response) {
    // Network errors are retryable
    return true;
  }

  const status = error.response.status;
  // Retry on server errors (5xx) and rate limiting (429)
  return status >= 500 || status === 429;
};

/**
 * Validate API response format
 */
export const validateApiResponse = (response) => {
  if (!response || !response.data) {
    throw new Error('Invalid API response format');
  }

  if (response.data.success === false && response.data.message) {
    const error = new Error(response.data.message);
    error.response = response;
    throw error;
  }

  return response.data;
};

/**
 * Loading state manager for API calls
 */
export class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
  }

  setLoading(key, isLoading) {
    this.loadingStates.set(key, isLoading);
  }

  isLoading(key) {
    return this.loadingStates.get(key) || false;
  }

  clearAll() {
    this.loadingStates.clear();
  }
}

export const globalLoadingManager = new LoadingManager();