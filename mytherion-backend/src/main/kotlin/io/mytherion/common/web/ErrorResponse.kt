package io.mytherion.common.web

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.Instant
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode

/**
 * The error body every endpoint returns. Clients branch on [code]; [message] is for humans.
 * [path] omits the query string so tokens never echo back; [errors] is set only for validation.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
data class ErrorResponse(
    val status: Int,
    val error: String,
    val code: ErrorCode,
    val message: String,
    val path: String,
    val timestamp: Instant,
    val errors: Map<String, String>? = null
) {
    companion object {
        fun of(
            status: HttpStatusCode,
            code: ErrorCode,
            message: String,
            path: String,
            errors: Map<String, String>? = null
        ) = ErrorResponse(
            status = status.value(),
            error = reasonPhrase(status),
            code = code,
            message = message,
            path = path,
            timestamp = Instant.now(),
            errors = errors
        )

        private fun reasonPhrase(status: HttpStatusCode): String =
            HttpStatus.resolve(status.value())?.reasonPhrase ?: "Error"
    }
}
