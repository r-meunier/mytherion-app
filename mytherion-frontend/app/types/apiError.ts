/** The error body every backend endpoint returns. Mirrors the backend; CI fails if they drift. */
export interface ApiErrorResponse {
  status: number;
  error: string;
  /** Branch on this. */
  code: ErrorCode;
  /** For humans; may change, never parse it. */
  message: string;
  path: string;
  timestamp: string;
  /** Only for `VALIDATION_FAILED`. */
  errors?: Record<string, string[]>;
  requestId?: string;
}

export type ErrorCode =
  // Request shape
  | 'BAD_REQUEST'
  | 'VALIDATION_FAILED'
  | 'MALFORMED_REQUEST'
  | 'INVALID_PARAMETER'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'NOT_ACCEPTABLE'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_MEDIA_TYPE'
  // Authentication & authorization
  | 'UNAUTHENTICATED'
  | 'INVALID_CREDENTIALS'
  | 'ACCESS_DENIED'
  | 'EMAIL_NOT_VERIFIED'
  // Account
  | 'EMAIL_ALREADY_IN_USE'
  | 'USERNAME_ALREADY_IN_USE'
  | 'EMAIL_ALREADY_VERIFIED'
  | 'INVALID_VERIFICATION_TOKEN'
  | 'VERIFICATION_TOKEN_EXPIRED'
  | 'INVALID_ROLE'
  | 'USER_NOT_FOUND'
  // Projects & codex
  | 'PROJECT_NOT_FOUND'
  | 'PROJECT_HAS_ENTRIES'
  | 'ENTRY_NOT_FOUND'
  | 'THUMBNAIL_NOT_FOUND'
  | 'INVALID_FILE'
  | 'INVALID_ENTRY_CONTENT'
  | 'CONCURRENT_MODIFICATION'
  // Server
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

/** Narrows an unknown response body to an ApiErrorResponse. */
export function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return typeof b.status === 'number' && typeof b.code === 'string' && typeof b.message === 'string';
}
