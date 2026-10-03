package io.mytherion.common.web

import com.fasterxml.jackson.annotation.JsonInclude
import java.time.Instant
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity

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
    val errors: Map<String, List<String>>? = null
) {
    /** The response for this body; a 401 carries the challenge RFC 9110 requires. */
    fun toEntity(): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(status)
            .apply { if (status == HttpStatus.UNAUTHORIZED.value()) header(HttpHeaders.WWW_AUTHENTICATE, AUTH_CHALLENGE) }
            .body(this)

    companion object {
        /** `Bearer`, not `Basic`, so browsers never show a login popup. */
        const val AUTH_CHALLENGE = "Bearer"

        fun of(
            status: HttpStatusCode,
            code: ErrorCode,
            message: String,
            path: String,
            errors: Map<String, List<String>>? = null
        ) = ErrorResponse(
            status = status.value(),
            error = reasonPhrase(status),
            code = code,
            message = message,
            path = path,
            timestamp = Instant.now(),
            errors = errors
        )

        /** Code and message for a status raised without a more specific cause; 5xx is masked. */
        fun generic(status: HttpStatusCode): Pair<ErrorCode, String> {
            val code = when (status.value()) {
                401 -> ErrorCode.UNAUTHENTICATED
                403 -> ErrorCode.ACCESS_DENIED
                404 -> ErrorCode.NOT_FOUND
                405 -> ErrorCode.METHOD_NOT_ALLOWED
                406 -> ErrorCode.NOT_ACCEPTABLE
                413 -> ErrorCode.FILE_TOO_LARGE
                415 -> ErrorCode.UNSUPPORTED_MEDIA_TYPE
                503 -> ErrorCode.SERVICE_UNAVAILABLE
                else -> if (status.is5xxServerError) ErrorCode.INTERNAL_ERROR else ErrorCode.BAD_REQUEST
            }
            val message = if (status.is5xxServerError) ErrorMessages.INTERNAL_ERROR else reasonPhrase(status)
            return code to message
        }

        private fun reasonPhrase(status: HttpStatusCode): String =
            HttpStatus.resolve(status.value())?.reasonPhrase ?: "Error"
    }
}
