package io.mytherion.config.web

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorMessages
import io.mytherion.common.web.ErrorResponse
import io.mytherion.common.web.ValidationErrorResponse
import io.mytherion.platform.logging.errorWith
import io.mytherion.platform.logging.logger
import java.time.Instant
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

/**
 * Global exception handler for the REST API.
 *
 * Deliberately depends on no domain package: every client-facing domain exception extends
 * [ApiException] and carries its own status, so new domains plug in without touching this file.
 */
@RestControllerAdvice
class GlobalExceptionHandler {

    private val logger = logger()

    /** Handles every client-facing domain exception via its declared status. */
    @ExceptionHandler(ApiException::class)
    fun handleApiException(ex: ApiException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(ex.status)
            .body(
                ErrorResponse(
                    status = ex.status.value(),
                    error = ex.error,
                    message = ex.message ?: ex.error,
                    timestamp = Instant.now()
                )
            )
    }

    /**
     * Handles authorization denials raised by method security (`@PreAuthorize`).
     *
     * Those are thrown inside the controller invocation, so `DispatcherServlet` catches them and
     * offers them here before they can reach `ExceptionTranslationFilter` and
     * `RestAccessDeniedHandler`. Without this method the catch-all below would claim them and
     * return 500 — turning an authorization failure into an apparent server error.
     *
     * `AuthorizationDeniedException`, what Spring Security 6 method security actually throws,
     * extends `AccessDeniedException`, so this covers both. The message is fixed and matches
     * [ErrorMessages.ACCESS_DENIED] so the filter-chain and method-security
     * paths return identical bodies.
     */
    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(
                ErrorResponse(
                    status = HttpStatus.FORBIDDEN.value(),
                    error = "Forbidden",
                    message = ErrorMessages.ACCESS_DENIED,
                    timestamp = Instant.now()
                )
            )
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidationErrors(
        ex: MethodArgumentNotValidException
    ): ResponseEntity<ValidationErrorResponse> {
        val errors =
            ex.bindingResult.allErrors.associate { error ->
                val fieldName = (error as? FieldError)?.field ?: "unknown"
                val errorMessage = error.defaultMessage ?: "Validation failed"
                fieldName to errorMessage
            }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(
                ValidationErrorResponse(
                    status = HttpStatus.BAD_REQUEST.value(),
                    error = "Validation Failed",
                    message = "Request validation failed",
                    errors = errors,
                    timestamp = Instant.now()
                )
            )
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(ex: IllegalArgumentException): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(
                ErrorResponse(
                    status = HttpStatus.BAD_REQUEST.value(),
                    error = "Bad Request",
                    message = ex.message ?: "Invalid request",
                    timestamp = Instant.now()
                )
            )
    }

    /** Last resort: log the real cause, return a masked 500 so internals are not leaked. */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
        logger.errorWith("Unhandled exception", ex)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(
                ErrorResponse(
                    status = HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    error = "Internal Server Error",
                    message = "An unexpected error occurred",
                    timestamp = Instant.now()
                )
            )
    }
}
