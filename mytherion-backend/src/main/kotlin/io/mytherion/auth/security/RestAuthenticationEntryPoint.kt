package io.mytherion.auth.security

import io.mytherion.common.web.ErrorResponse
import io.mytherion.common.web.ErrorMessages
import io.mytherion.common.web.ErrorResponseWriter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component

/**
 * Authentication entry point for requests rejected by the Spring Security filter chain.
 *
 * Returns the standard [ErrorResponse] payload with 401 instead of Spring Security's default
 * empty body. 401 rather than 403 is deliberate: the caller has not authenticated at all, so
 * the correct answer is "who are you?", not "you may not".
 */
@Component
class RestAuthenticationEntryPoint(
    private val errorResponseWriter: ErrorResponseWriter
) : AuthenticationEntryPoint {

    override fun commence(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authException: AuthenticationException
    ) {
        // Deliberately not authException.message: it varies by failure cause (missing token,
        // malformed token, expired token) and would tell an unauthenticated caller which.
        errorResponseWriter.write(response, HttpStatus.UNAUTHORIZED, ErrorMessages.UNAUTHENTICATED)
    }

}
