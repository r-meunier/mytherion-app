/**
 * Parse backend error messages and return user-friendly messages
 */
export function parseErrorMessage(error: any): string {
  // If error is already a string, check if it needs parsing
  const errorMessage = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

  // Map of backend error messages to user-friendly messages
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
