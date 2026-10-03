package io.mytherion.common.web

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.Instant
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode

/**
 * The single error payload returned by every endpoint, for every failure.
 *
 * - [status] repeats the HTTP status so the body is self-describing when logged or forwarded.
 * - [error] is always the status's reason phrase (`"Not Found"`), never free text.
 * - [code] is the stable identifier clients branch on — see [ErrorCode].
 * - [message] is for humans and may change; do not parse it.
 * - [path] is the request URI without its query string, so tokens in `?token=` never echo back.
 * - [errors] maps field → reason and is present only for [ErrorCode.VALIDATION_FAILED].
 *
 * Build it through [of] so `error` can never disagree with `status`.
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
