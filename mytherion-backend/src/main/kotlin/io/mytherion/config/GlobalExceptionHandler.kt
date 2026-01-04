package io.mytherion.config

import io.mytherion.project.exception.ProjectAccessDeniedException
import io.mytherion.project.exception.ProjectHasEntriesException
import io.mytherion.project.exception.ProjectNotFoundException
import io.mytherion.project.exception.UserNotFoundException
import java.time.Instant
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

/** Global exception handler for REST API */
@RestControllerAdvice
class GlobalExceptionHandler {

        @ExceptionHandler(ProjectNotFoundException::class)
        fun handleProjectNotFound(ex: ProjectNotFoundException): ResponseEntity<ErrorResponse> {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(
                                ErrorResponse(
                                        status = HttpStatus.NOT_FOUND.value(),
                                        error = "Not Found",
                                        message = ex.message ?: "Project not found",
                                        timestamp = Instant.now()
                                )
                        )
        }

        @ExceptionHandler(UserNotFoundException::class)
        fun handleUserNotFound(ex: UserNotFoundException): ResponseEntity<ErrorResponse> {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(
                                ErrorResponse(
                                        status = HttpStatus.NOT_FOUND.value(),
                                        error = "Not Found",
                                        message = ex.message ?: "User not found",
                                        timestamp = Instant.now()
                                )
                        )
        }

        @ExceptionHandler(ProjectAccessDeniedException::class)
        fun handleProjectAccessDenied(
                ex: ProjectAccessDeniedException
        ): ResponseEntity<ErrorResponse> {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(
                                ErrorResponse(
                                        status = HttpStatus.FORBIDDEN.value(),
                                        error = "Forbidden",
                                        message = ex.message ?: "Access denied",
                                        timestamp = Instant.now()
                                )
                        )
        }

        @ExceptionHandler(ProjectHasEntriesException::class)
        fun handleProjectHasEntries(ex: ProjectHasEntriesException): ResponseEntity<ErrorResponse> {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(
                                ErrorResponse(
                                        status = HttpStatus.CONFLICT.value(),
                                        error = "Conflict",
                                        message = ex.message
                                                        ?: "Cannot delete project with entries",
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

        @ExceptionHandler(Exception::class)
        fun handleGenericException(ex: Exception): ResponseEntity<ErrorResponse> {
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

/** Standard error response */
data class ErrorResponse(
        val status: Int,
        val error: String,
        val message: String,
        val timestamp: Instant
)

/** Validation error response with field-specific errors */
data class ValidationErrorResponse(
        val status: Int,
        val error: String,
        val message: String,
        val errors: Map<String, String>,
        val timestamp: Instant
)
