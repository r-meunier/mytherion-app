package io.mytherion.auth.security

import io.mytherion.common.web.ErrorResponse
import io.mytherion.common.web.ErrorMessages
import io.mytherion.common.web.ErrorResponseWriter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.web.access.AccessDeniedHandler
import org.springframework.stereotype.Component

/**
 * Access denied handler for requests rejected by the Spring Security filter chain.
 *
 * Returns the standard [ErrorResponse] payload instead of Spring Security's default empty body.
 *
 * Only covers denials raised *in the filter chain*. A denial from method security
 * (`@PreAuthorize`) is thrown inside the controller invocation and never reaches this handler —
 * `GlobalExceptionHandler.handleAccessDenied` renders that one. Both paths must produce the same
 * body, so both use [ErrorMessages.ACCESS_DENIED].
 */
@Component
class RestAccessDeniedHandler(
    private val errorResponseWriter: ErrorResponseWriter
) : AccessDeniedHandler {

    override fun handle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        accessDeniedException: AccessDeniedException
    ) {
        // Deliberately not accessDeniedException.message: it varies by rejection cause, which
        // would make the body differ between the two 403 paths and leaks detail to a caller
        // who is by definition not authorised to have it.
        errorResponseWriter.write(response, HttpStatus.FORBIDDEN, ErrorMessages.ACCESS_DENIED)
    }

}
