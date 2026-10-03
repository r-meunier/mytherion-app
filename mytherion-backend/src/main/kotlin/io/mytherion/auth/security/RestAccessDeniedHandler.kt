package io.mytherion.auth.security

import io.mytherion.common.web.ErrorResponse
import io.mytherion.common.web.ErrorCode
import io.mytherion.common.web.ErrorMessages
import io.mytherion.common.web.ErrorResponseWriter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.web.access.AccessDeniedHandler
import org.springframework.stereotype.Component

/**
 * Renders filter-chain 403s as [ErrorResponse]. Method-security denials never reach here; they
 * go through `GlobalExceptionHandler.handleAccessDenied`.
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
        // Fixed message: the exception's text varies by cause and would leak it.
        errorResponseWriter.write(
            request, response, HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, ErrorMessages.ACCESS_DENIED
        )
    }

}
