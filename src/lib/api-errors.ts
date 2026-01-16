// HTTP status code messages
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'You are not authorized. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. The resource may have been modified.',
  422: 'The request could not be processed. Please check your input.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'An unexpected server error occurred. Please try again later.',
  502: 'The server is temporarily unavailable. Please try again later.',
  503: 'The service is currently unavailable. Please try again later.',
  504: 'The request timed out. Please try again.',
};

// Default error message
const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred. Please try again.';

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

// API error response type
interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: string;
}

/**
 * Formats an API error into a user-friendly message
 * @param error - The error to format (can be Error, Response, or unknown)
 * @returns A user-friendly error message string
 */
export function formatApiError(error: unknown): string {
  // Log full error details in development
  if (isDevelopment) {
    console.error('[API Error]', error);
  }

  // Handle Response objects
  if (error instanceof Response) {
    const statusMessage = HTTP_STATUS_MESSAGES[error.status];
    if (statusMessage) {
      return statusMessage;
    }
    return `Request failed with status ${error.status}`;
  }

  // Handle Error objects
  if (error instanceof Error) {
    // Check for specific error messages
    if (error.message.includes('User not authenticated')) {
      return 'You are not authorized. Please log in again.';
    }
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    if (error.message.includes('API error:')) {
      // Extract status code from "API error: 404 Not Found" format
      const statusMatch = error.message.match(/API error: (\d+)/);
      if (statusMatch) {
        const status = parseInt(statusMatch[1], 10);
        return HTTP_STATUS_MESSAGES[status] || error.message;
      }
    }
    // Return the error message if it seems user-friendly
    if (error.message && !error.message.includes('undefined') && error.message.length < 200) {
      return error.message;
    }
  }

  // Handle plain objects with error/message properties
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as ApiErrorResponse;
    if (errorObj.error) {
      return errorObj.error;
    }
    if (errorObj.message) {
      return errorObj.message;
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Creates an Error object with a formatted message
 * @param error - The original error
 * @returns An Error object with a user-friendly message
 */
export function createApiError(error: unknown): Error {
  const message = formatApiError(error);
  const apiError = new Error(message);
  apiError.name = 'ApiError';
  
  return apiError;
}

/**
 * Type guard to check if an error is an API error
 */
export function isApiError(error: unknown): error is Error & { name: 'ApiError' } {
  return error instanceof Error && error.name === 'ApiError';
}
