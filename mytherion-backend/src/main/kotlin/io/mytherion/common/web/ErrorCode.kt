package io.mytherion.common.web

/**
 * Stable, machine-readable identifier carried in every [ErrorResponse.code]. Clients branch on
 * this, never on the message.
 *
 * Mirrored by the `ErrorCode` union in the frontend's `types/apiError.ts`; the contract parity
 * check fails CI if they drift. A code never changes status once published: add a new one instead.
 */
enum class ErrorCode {
    // Request shape
    BAD_REQUEST,                // 400 any other 4xx the framework raised
    VALIDATION_FAILED,          // 400 bean validation failed; `errors` lists each field
    MALFORMED_REQUEST,          // 400 body is not valid JSON or multipart
    INVALID_PARAMETER,          // 400 path variable or query parameter missing or wrong type
    NOT_FOUND,                  // 404 no endpoint at this path
    METHOD_NOT_ALLOWED,         // 405 endpoint exists, method does not
    NOT_ACCEPTABLE,             // 406 cannot produce the requested media type
    FILE_TOO_LARGE,             // 413 upload exceeds spring.servlet.multipart.max-file-size
    UNSUPPORTED_MEDIA_TYPE,     // 415 request body media type not accepted

    // Authentication & authorization
    UNAUTHENTICATED,            // 401 no valid session
    INVALID_CREDENTIALS,        // 401 login rejected; never says which field was wrong
    ACCESS_DENIED,              // 403 any ownership, tenant or role denial; same body everywhere
    EMAIL_NOT_VERIFIED,         // 403 correct credentials, email not verified yet

    // Account
    EMAIL_ALREADY_IN_USE,       // 409 email belongs to another account
    USERNAME_ALREADY_IN_USE,    // 409 username belongs to another account
    EMAIL_ALREADY_VERIFIED,     // 409 nothing left to verify
    INVALID_VERIFICATION_TOKEN, // 400 token unknown
    VERIFICATION_TOKEN_EXPIRED, // 410 token was valid once, now expired
    INVALID_ROLE,               // 400 no such role
    USER_NOT_FOUND,             // 404 no such user

    // Projects & codex
    PROJECT_NOT_FOUND,          // 404 no such project
    PROJECT_HAS_ENTRIES,        // 409 project still holds entries, cannot delete
    ENTRY_NOT_FOUND,            // 404 no such entry
    THUMBNAIL_NOT_FOUND,        // 404 entry has no image
    INVALID_FILE,               // 400 upload is empty or not an accepted image type
    CONCURRENT_MODIFICATION,    // 409 stale `version`; reload and retry

    // Server
    INTERNAL_ERROR,             // 500 cause is logged, never returned
    SERVICE_UNAVAILABLE,        // 503 temporarily unavailable
}
