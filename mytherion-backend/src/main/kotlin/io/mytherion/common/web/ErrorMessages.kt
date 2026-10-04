package io.mytherion.common.web

/**
 * Messages shared by several code paths. Every 403 uses [ACCESS_DENIED], never the exception text
 * or an id, so a caller cannot tell the paths apart or learn whether a resource exists.
 */
object ErrorMessages {
    const val ACCESS_DENIED = "Access denied"
    const val UNAUTHENTICATED = "Full authentication is required to access this resource"
    const val INTERNAL_ERROR = "An unexpected error occurred"
}
