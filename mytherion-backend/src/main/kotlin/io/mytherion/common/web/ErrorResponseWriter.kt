package io.mytherion.common.web

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.stereotype.Component
import tools.jackson.databind.ObjectMapper
import java.nio.charset.StandardCharsets

/** Writes an [ErrorResponse] for Spring Security filter-chain rejections, where no handler runs. */
@Component
class ErrorResponseWriter(
    private val objectMapper: ObjectMapper
) {

    fun write(
        request: HttpServletRequest,
        response: HttpServletResponse,
        status: HttpStatus,
        code: ErrorCode,
        message: String
    ) {
        response.status = status.value()
        response.contentType = MediaType.APPLICATION_JSON_VALUE
        response.characterEncoding = StandardCharsets.UTF_8.name()

        val body = ErrorResponse.of(status, code, message, request.requestURI)

        response.writer.write(objectMapper.writeValueAsString(body))
        // Commit now: Spring Security keeps processing and could replace an uncommitted body.
        response.writer.flush()
    }
}
