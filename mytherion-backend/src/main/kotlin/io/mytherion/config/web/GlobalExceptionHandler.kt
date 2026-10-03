package io.mytherion.config.web

import io.mytherion.common.exception.ApiException
import io.mytherion.common.web.ErrorCode
import io.mytherion.common.web.ErrorMessages
import io.mytherion.common.web.ErrorResponse
import io.mytherion.platform.logging.errorWith
import io.mytherion.platform.logging.logger
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.ConstraintViolationException
import org.springframework.beans.TypeMismatchException
import org.springframework.beans.factory.annotation.Value
import org.springframework.dao.OptimisticLockingFailureException
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.util.unit.DataSize
import org.springframework.validation.BindingResult
import org.springframework.validation.FieldError
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.MissingServletRequestParameterException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.ServletWebRequest
import org.springframework.web.context.request.WebRequest
import org.springframework.web.method.annotation.HandlerMethodValidationException
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.multipart.MaxUploadSizeExceededException
import org.springframework.web.multipart.MultipartException
import org.springframework.web.multipart.support.MissingServletRequestPartException
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

/**
 * Renders every exception as an [ErrorResponse]. Spring MVC's own exceptions arrive through
 * [handleExceptionInternal]; don't add an `@ExceptionHandler` for a type the parent already
 * handles, or Spring refuses to start.
 */
@RestControllerAdvice
class GlobalExceptionHandler(
    @Value("\${spring.servlet.multipart.max-file-size}")
    private val maxUploadSize: DataSize
) : ResponseEntityExceptionHandler() {

    private val log = logger()

    @ExceptionHandler(ApiException::class)
    fun handleApiException(ex: ApiException, request: HttpServletRequest): ResponseEntity<ErrorResponse> =
        respond(ex.status, ex.code, ex.message ?: ex.status.reasonPhrase, request.requestURI)

    /** `@PreAuthorize` denials; without this the catch-all would turn them into 500s. */
    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException, request: HttpServletRequest): ResponseEntity<ErrorResponse> =
        respond(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, ErrorMessages.ACCESS_DENIED, request.requestURI)

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(
        ex: ConstraintViolationException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> {
        val errors = ex.constraintViolations.associate { violation ->
            violation.propertyPath.toString().substringAfterLast('.') to violation.message
        }
        return respond(
            HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_FAILED, VALIDATION_MESSAGE, request.requestURI, errors
        )
    }

    @ExceptionHandler(OptimisticLockingFailureException::class)
    fun handleOptimisticLock(
        ex: OptimisticLockingFailureException,
        request: HttpServletRequest
    ): ResponseEntity<ErrorResponse> =
        respond(
            HttpStatus.CONFLICT,
            ErrorCode.CONCURRENT_MODIFICATION,
            "This was changed elsewhere. Reload and try again.",
            request.requestURI
        )

    // The oversized subclass is matched more specifically by the parent and stays 413.
    @ExceptionHandler(MultipartException::class)
    fun handleMultipart(ex: MultipartException, request: HttpServletRequest): ResponseEntity<ErrorResponse> =
        respond(HttpStatus.BAD_REQUEST, ErrorCode.MALFORMED_REQUEST, "Malformed multipart request", request.requestURI)

    /** Last resort: logs the cause and returns a masked 500. */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception, request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        log.errorWith("Unhandled exception", ex, "path" to request.requestURI)
        return respond(
            HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, ErrorMessages.INTERNAL_ERROR, request.requestURI
        )
    }

    override fun handleExceptionInternal(
        ex: Exception,
        body: Any?,
        headers: HttpHeaders,
        statusCode: HttpStatusCode,
        request: WebRequest
    ): ResponseEntity<Any>? {
        val path = (request as? ServletWebRequest)?.request?.requestURI.orEmpty()
        if (statusCode.is5xxServerError) {
            log.errorWith("Framework exception", ex, "path" to path)
        }
        val (code, message, errors) = describe(ex, statusCode)
        // Delegate so the parent still skips responses that are already committed.
        return super.handleExceptionInternal(
            ex, ErrorResponse.of(statusCode, code, message, path, errors), headers, statusCode, request
        )
    }

    private fun describe(ex: Exception, status: HttpStatusCode): Triple<ErrorCode, String, Map<String, String>?> =
        when (ex) {
            is MethodArgumentNotValidException ->
                Triple(ErrorCode.VALIDATION_FAILED, VALIDATION_MESSAGE, fieldErrors(ex.bindingResult))
            is HandlerMethodValidationException ->
                Triple(
                    ErrorCode.VALIDATION_FAILED,
                    VALIDATION_MESSAGE,
                    ex.parameterValidationResults.associate { result ->
                        (result.methodParameter.parameterName ?: "unknown") to
                            (result.resolvableErrors.firstOrNull()?.defaultMessage ?: "Invalid value")
                    }
                )
            // Never echo the parser's message: it quotes the input.
            is HttpMessageNotReadableException ->
                Triple(ErrorCode.MALFORMED_REQUEST, "Malformed request body", null)
            // Name the parameter, never the rejected value.
            is MissingServletRequestParameterException ->
                Triple(ErrorCode.INVALID_PARAMETER, "Missing required parameter '${ex.parameterName}'", null)
            is MissingServletRequestPartException ->
                Triple(ErrorCode.INVALID_PARAMETER, "Missing required part '${ex.requestPartName}'", null)
            is MethodArgumentTypeMismatchException ->
                Triple(ErrorCode.INVALID_PARAMETER, "Invalid value for parameter '${ex.name}'", null)
            is TypeMismatchException ->
                Triple(ErrorCode.INVALID_PARAMETER, "Invalid parameter value", null)
            is MaxUploadSizeExceededException ->
                Triple(ErrorCode.FILE_TOO_LARGE, "File exceeds the ${label(maxUploadSize)} upload limit", null)
            else -> Triple(codeFor(status), messageFor(status), null)
        }

    private fun codeFor(status: HttpStatusCode): ErrorCode =
        when (status.value()) {
            404 -> ErrorCode.NOT_FOUND
            405 -> ErrorCode.METHOD_NOT_ALLOWED
            406 -> ErrorCode.NOT_ACCEPTABLE
            413 -> ErrorCode.FILE_TOO_LARGE
            415 -> ErrorCode.UNSUPPORTED_MEDIA_TYPE
            503 -> ErrorCode.SERVICE_UNAVAILABLE
            else -> if (status.is5xxServerError) ErrorCode.INTERNAL_ERROR else ErrorCode.BAD_REQUEST
        }

    private fun messageFor(status: HttpStatusCode): String =
        if (status.is5xxServerError) ErrorMessages.INTERNAL_ERROR
        else HttpStatus.resolve(status.value())?.reasonPhrase ?: "Bad Request"

    private fun fieldErrors(bindingResult: BindingResult): Map<String, String> =
        bindingResult.allErrors.associate { error ->
            ((error as? FieldError)?.field ?: error.objectName) to (error.defaultMessage ?: "Invalid value")
        }

    private fun respond(
        status: HttpStatusCode,
        code: ErrorCode,
        message: String,
        path: String,
        errors: Map<String, String>? = null
    ): ResponseEntity<ErrorResponse> =
        ResponseEntity.status(status).body(ErrorResponse.of(status, code, message, path, errors))

    private companion object {
        const val VALIDATION_MESSAGE = "Request validation failed"

        /** `5MB` rather than DataSize's `5242880B`. */
        fun label(size: DataSize): String {
            val bytes = size.toBytes()
            return when {
                bytes % (1024 * 1024) == 0L -> "${size.toMegabytes()}MB"
                bytes % 1024 == 0L -> "${size.toKilobytes()}KB"
                else -> "${bytes}B"
            }
        }
    }
}
