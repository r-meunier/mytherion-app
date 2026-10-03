/**
 * The error payload every backend endpoint returns, for every failure (MYT-23).
 *
 * Mirrors `ErrorResponse.kt` and `ErrorCode.kt` in the backend's `common.web` package.
 * `scripts/check_contract_parity.py` fails CI if the fields or the codes drift, so change both
 * sides together.
 */
export interface ApiErrorResponse {
  /** The HTTP status, repeated so the body is self-describing. */
  status: number;
  /** The status's reason phrase, e.g. "Not Found". Never free text. */
  error: string;
  /** Stable identifier to branch on. */
  code: ErrorCode;
  /** Human-readable and may be reworded at any time; do not parse it. */
  message: string;
  /** Request path without the query string. */
  path: string;
  /** ISO-8601 instant. */
  timestamp: string;
  /** field → reason; present only when `code` is `VALIDATION_FAILED`. */
  errors?: Record<string, string>;
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
  // Server
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE';

/** Narrow an unknown response body (Axios `error.response?.data`, a parsed `fetch` body) to the contract. */
export function isApiErrorResponse(body: unknown): body is ApiErrorResponse {
  if (typeof body !== 'object' || body === null) return false;
  const b = body as Record<string, unknown>;
  return typeof b.status === 'number' && typeof b.code === 'string' && typeof b.message === 'string';
}
