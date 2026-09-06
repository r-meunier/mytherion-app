package io.mytherion.auth.security

import io.mytherion.common.web.ErrorResponse
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper
import java.nio.charset.StandardCharsets
import java.time.Instant

/**
 * Authentication entry point for REST API requests.
 *
 * Ensures unauthenticated requests rejected by Spring Security return the standard
 * [ErrorResponse] JSON payload with HTTP 401 Unauthorized status, rather than
 * Spring Security's default empty body or HTML error page.
 */
@Component
class RestAuthenticationEntryPoint(
    private val objectMapper: ObjectMapper
) : AuthenticationEntryPoint {

    override fun commence(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authException: AuthenticationException
    ) {
        response.status = HttpServletResponse.SC_UNAUTHORIZED
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.characterEncoding = StandardCharsets.UTF_8.name()

        val errorResponse = ErrorResponse(
            status = HttpStatus.UNAUTHORIZED.value(),
            error = "Unauthorized",
            message = authException.message ?: "Full authentication is required to access this resource",
            timestamp = Instant.now()
        )

        response.writer.write(objectMapper.writeValueAsString(errorResponse))
    }
}
