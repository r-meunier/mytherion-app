package io.mytherion.common.web

import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper
import java.nio.charset.StandardCharsets
import java.time.Instant

/**
 * Writes an [ErrorResponse] straight to the servlet response.
 *
 * Spring Security rejects requests inside the filter chain, before any handler runs, so those
 * responses cannot go through `GlobalExceptionHandler` and have to be serialised by hand. This
 * exists so the hand-written path produces exactly the same payload as the handled one — using
 * the same [ObjectMapper] bean, so field order and the `Instant` format match too.
 *
 * Prefer throwing an `ApiException` wherever a handler is actually reachable; this is only for
 * filter-level rejections.
 */
@Component
class ErrorResponseWriter(
    private val objectMapper: ObjectMapper
) {

    fun write(response: HttpServletResponse, status: HttpStatus, message: String) {
        response.status = status.value()
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.characterEncoding = StandardCharsets.UTF_8.name()

        val body = ErrorResponse(
            status = status.value(),
            error = status.reasonPhrase,
            message = message,
            timestamp = Instant.now()
        )

        response.writer.write(objectMapper.writeValueAsString(body))
        // Committed here rather than left to the container: Spring Security continues
        // processing after the handler returns, and an uncommitted body can be replaced.
        response.writer.flush()
    }
}
