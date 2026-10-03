package io.mytherion.auth.security

import io.mytherion.common.web.ErrorResponse
import io.mytherion.common.web.ErrorCode
import io.mytherion.common.web.ErrorMessages
import io.mytherion.common.web.ErrorResponseWriter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component

/** Renders filter-chain 401s (no valid session) as [ErrorResponse]. */
@Component
class RestAuthenticationEntryPoint(
    private val errorResponseWriter: ErrorResponseWriter
) : AuthenticationEntryPoint {

    override fun commence(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authException: AuthenticationException
    ) {
        // Fixed message: the exception's text would say whether the token was missing or invalid.
        errorResponseWriter.write(
            request, response, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHENTICATED, ErrorMessages.UNAUTHENTICATED
        )
    }

}
