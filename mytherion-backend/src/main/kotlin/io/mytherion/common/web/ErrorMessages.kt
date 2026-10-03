package io.mytherion.common.web

/**
 * Canonical messages for errors that can be produced by more than one code path.
 *
 * A 403 can come from the Spring Security filter chain (`RestAccessDeniedHandler`), from method
 * security caught by `GlobalExceptionHandler`, or from a domain ownership check
 * (`ProjectAccessDeniedException`, `EntryAccessDeniedException`, `UserAccessDeniedException`,
 * thrown by `ProjectAccessInterceptor` among others). Callers must not be able to tell which —
 * nor, for tenant isolation, whether the resource exists at all — so every one of them reads its
 * message from here rather than from the exception or the resource id. Ids belong in the log.
 *
 * These live in `common` because `GlobalExceptionHandler` must not depend on a domain package —
 * `auth` is a domain, and an ArchUnit rule enforces that.
 */
object ErrorMessages {

    /** Shared by every 403 path so they are indistinguishable to a caller. */
    const val ACCESS_DENIED = "Access denied"

    /** Returned when no valid credentials were presented at all. */
    const val UNAUTHENTICATED = "Full authentication is required to access this resource"

    /** Returned for every 5xx; the real cause is logged, never sent. */
    const val INTERNAL_ERROR = "An unexpected error occurred"
}
