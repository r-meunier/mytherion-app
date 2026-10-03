package io.mytherion.common.web

/**
 * Stable, machine-readable identifier carried in every [ErrorResponse.code].
 *
 * Clients branch on this rather than on [ErrorResponse.message], which is human-readable and may
 * be reworded at any time. The frontend mirrors this list as the `ErrorCode` union in
 * `types/apiError.ts`, and `scripts/check_contract_parity.py` fails CI if the two drift — so a new
 * value here is a contract change, made deliberately and in both places.
 *
 * Grouped by the status they are normally returned with. A code never changes status once
 * published; if the status needs to change, add a new code.
 */
enum class ErrorCode {

    // ── Request shape (raised by the framework, before any handler runs) ──
    /** 400 — a 4xx the framework raised that has no more specific code below. */
    BAD_REQUEST,
    /** 400 — bean validation failed; [ErrorResponse.errors] lists each offending field. */
    VALIDATION_FAILED,
    /** 400 — the body is not valid JSON, or does not map onto the expected type. */
    MALFORMED_REQUEST,
    /** 400 — a path variable or query parameter is missing or has the wrong type. */
    INVALID_PARAMETER,
    /** 404 — no endpoint is mapped to this path. */
    NOT_FOUND,
    /** 405 */
    METHOD_NOT_ALLOWED,
    /** 406 */
    NOT_ACCEPTABLE,
    /** 413 — an uploaded file exceeds `spring.servlet.multipart.max-file-size`. */
    FILE_TOO_LARGE,
    /** 415 */
    UNSUPPORTED_MEDIA_TYPE,

    // ── Authentication & authorization ──
    /** 401 — no valid session. */
    UNAUTHENTICATED,
    /** 401 — login rejected; deliberately does not say whether email or password was wrong. */
    INVALID_CREDENTIALS,
    /** 403 — every ownership / tenant-isolation / role denial. Identical body on every path. */
    ACCESS_DENIED,
    /** 403 — credentials are correct but the email address has not been verified yet. */
    EMAIL_NOT_VERIFIED,

    // ── Account ──
    /** 409 */
    EMAIL_ALREADY_IN_USE,
    /** 409 */
    USERNAME_ALREADY_IN_USE,
    /** 409 */
    EMAIL_ALREADY_VERIFIED,
    /** 400 */
    INVALID_VERIFICATION_TOKEN,
    /** 410 */
    VERIFICATION_TOKEN_EXPIRED,
    /** 400 */
    INVALID_ROLE,
    /** 404 */
    USER_NOT_FOUND,

    // ── Projects & codex ──
    /** 404 */
    PROJECT_NOT_FOUND,
    /** 409 — a project cannot be deleted while it still holds entries. */
    PROJECT_HAS_ENTRIES,
    /** 404 */
    ENTRY_NOT_FOUND,
    /** 404 */
    THUMBNAIL_NOT_FOUND,
    /** 400 — an uploaded file is empty or not an accepted image type. */
    INVALID_FILE,

    // ── Server ──
    /** 500 — the cause is logged, never returned. */
    INTERNAL_ERROR,
    /** 503 */
    SERVICE_UNAVAILABLE,
}
