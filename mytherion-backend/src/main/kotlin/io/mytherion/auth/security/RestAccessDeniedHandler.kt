package io.mytherion.auth.security

import io.mytherion.common.web.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.web.access.AccessDeniedHandler
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper
import java.nio.charset.StandardCharsets
import java.time.Instant

/**
 * Access denied handler for REST API requests.
 *
 * Ensures unauthorized requests rejected by Spring Security return the standard
 * [ErrorResponse] JSON payload with HTTP 403 Forbidden status, rather than
 * Spring Security's default empty body or HTML error page.
 */
@Component
class RestAccessDeniedHandler(
    private val objectMapper: ObjectMapper
) : AccessDeniedHandler {

    override fun handle(
        request: HttpServletRequest,
        response: HttpServletResponse,
        accessDeniedException: AccessDeniedException
    ) {
        response.status = HttpServletResponse.SC_FORBIDDEN
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.characterEncoding = StandardCharsets.UTF_8.name()

        val errorResponse = ErrorResponse(
            status = HttpStatus.FORBIDDEN.value(),
            error = "Forbidden",
            message = accessDeniedException.message ?: "Access denied",
            timestamp = Instant.now()
        )

        response.writer.write(objectMapper.writeValueAsString(errorResponse))
    }
}
