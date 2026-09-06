package io.mytherion.common.web

/**
 * Canonical messages for errors that can be produced by more than one code path.
 *
 * A 403 can come from the Spring Security filter chain (`RestAccessDeniedHandler`) or from
 * method security caught by `GlobalExceptionHandler`. Callers should not be able to tell which,
 * so both read their message from here rather than from the exception, whose text varies by
 * cause.
 *
 * These live in `common` because `GlobalExceptionHandler` must not depend on a domain package —
 * `auth` is a domain, and an ArchUnit rule enforces that.
 */
object ErrorMessages {

    /** Shared by both 403 paths so the two are indistinguishable to a caller. */
    const val ACCESS_DENIED = "Access denied"

    /** Returned when no valid credentials were presented at all. */
    const val UNAUTHENTICATED = "Full authentication is required to access this resource"
}
