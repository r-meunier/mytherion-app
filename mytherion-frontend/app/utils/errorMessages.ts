import { isApiErrorResponse, ApiErrorResponse, ErrorCode } from '../types/apiError';

const CODE_MAPPINGS: Partial<Record<ErrorCode, (err: ApiErrorResponse) => string>> = {
  EMAIL_ALREADY_IN_USE: () => 'This email address is already registered. Please use a different email or try logging in.',
  USERNAME_ALREADY_IN_USE: () => 'This username is already taken. Please choose a different username.',
  INVALID_CREDENTIALS: () => 'Incorrect email or password. Please check your credentials and try again.',
  EMAIL_NOT_VERIFIED: () => 'Please verify your email address before logging in. Check your inbox for the verification email.',
  USER_NOT_FOUND: () => 'No matching account was found.',
  INVALID_VERIFICATION_TOKEN: () => 'This verification link is invalid. Please request a new verification email.',
  EMAIL_ALREADY_VERIFIED: () => 'Your email has already been verified. You can now log in.',
  VERIFICATION_TOKEN_EXPIRED: () => 'This verification link has expired. Please request a new verification email.',
  UNAUTHENTICATED: () => 'Your session has expired. Please log in again.',
  ACCESS_DENIED: () => 'You do not have permission to perform this action.',
  PROJECT_NOT_FOUND: () => 'The requested project was not found.',
  PROJECT_HAS_ENTRIES: () => 'Cannot delete project because it still contains entries.',
  ENTRY_NOT_FOUND: () => 'The requested codex entry was not found.',
  THUMBNAIL_NOT_FOUND: () => 'The requested image was not found.',
  FILE_TOO_LARGE: (err) => err.message || 'The file exceeds the maximum allowed upload size.',
  INVALID_FILE: (err) => err.message || 'The uploaded file is empty or not an accepted image format.',
  CONCURRENT_MODIFICATION: () => 'This was changed elsewhere. Please reload and try again.',
  INTERNAL_ERROR: () => 'Something went wrong on our end. Please try again later.',
  SERVICE_UNAVAILABLE: () => 'The service is temporarily unavailable. Please try again in a few moments.',
  VALIDATION_FAILED: (err) => {
    if (err.errors) {
      const firstField = Object.keys(err.errors)[0];
      const firstMessage = firstField ? err.errors[firstField]?.[0] : null;
      if (firstMessage) return firstMessage;
    }
    return err.message || 'Request validation failed';
  },
};

/**
 * Parse backend error responses, error messages, or unknown errors and return user-friendly messages
 */
export function parseErrorMessage(error: unknown): string {
  let apiError: ApiErrorResponse | null = null;

  if (isApiErrorResponse(error)) {
    apiError = error;
  } else if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      if (isApiErrorResponse(parsed)) {
        apiError = parsed;
      }
    } catch {
      // Plain string, not JSON
    }
  } else if (error && typeof error === 'object' && 'response' in error) {
    const resData = (error as { response?: { data?: unknown } }).response?.data;
    if (isApiErrorResponse(resData)) {
      apiError = resData;
    }
  }

  if (apiError) {
    const handler = CODE_MAPPINGS[apiError.code];
    if (handler) {
      return handler(apiError);
    }
    if (apiError.message && apiError.message.length < 150) {
      return apiError.message;
    }
  }

  // If error is already a string, check if it needs parsing
  const errorMessage =
    typeof error === 'string'
      ? error
      : (error as { message?: string } | null)?.message || 'An unexpected error occurred';

  // Map of legacy backend error messages to user-friendly messages
  const errorMappings: Record<string, string> = {
    // Authentication errors
    'Email already in use': 'This email address is already registered. Please use a different email or try logging in.',
    'Username already in use': 'This username is already taken. Please choose a different username.',
    'Invalid credentials': 'Incorrect email or password. Please check your credentials and try again.',
    'Please verify your email before logging in': 'Please verify your email address before logging in. Check your inbox for the verification email.',
    'User not found': 'No account found with these credentials. Please check your email or register for a new account.',
    
    // Email verification errors
    'Invalid verification token': 'This verification link is invalid. Please request a new verification email.',
    'Email already verified': 'Your email has already been verified. You can now log in.',
    'Verification token expired': 'This verification link has expired. Please request a new verification email.',
    
    // Generic errors
    'Not authenticated': 'Your session has expired. Please log in again.',
    'User not authenticated': 'Please log in to access this feature.',
    'Failed to send email': 'We couldn\'t send the email. Please try again in a few moments.',
    'Failed to resend verification email': 'We couldn\'t resend the verification email. Please try again later.',
  };

  // Check for exact matches
  if (errorMappings[errorMessage]) {
    return errorMappings[errorMessage];
  }

  // Check for partial matches (case-insensitive)
  const lowerMessage = errorMessage.toLowerCase();
  for (const [key, value] of Object.entries(errorMappings)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }

  // Check for common error patterns
  if (lowerMessage.includes('email') && lowerMessage.includes('use')) {
    return 'This email address is already registered. Please use a different email or try logging in.';
  }

  if (lowerMessage.includes('username') && lowerMessage.includes('use')) {
    return 'This username is already taken. Please choose a different username.';
  }

  if (lowerMessage.includes('password') && (lowerMessage.includes('invalid') || lowerMessage.includes('incorrect'))) {
    return 'Incorrect email or password. Please check your credentials and try again.';
  }

  if (lowerMessage.includes('verify') && lowerMessage.includes('email')) {
    return 'Please verify your email address. Check your inbox for the verification email.';
  }

  if (lowerMessage.includes('expired') || lowerMessage.includes('token')) {
    return 'This link has expired. Please request a new one.';
  }

  if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.';
  }

  // If no match found, return a generic user-friendly message
  // but keep some context if the error is short enough
  if (errorMessage.length < 100 && !errorMessage.includes('Exception') && !errorMessage.includes('Error:')) {
    return errorMessage;
  }

  return 'Something went wrong. Please try again or contact support if the problem persists.';
}
