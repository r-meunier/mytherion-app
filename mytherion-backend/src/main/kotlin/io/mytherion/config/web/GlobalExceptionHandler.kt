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
import org.springframework.web.multipart.support.MissingServletRequestPartException
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

/**
 * Global exception handler for the REST API. Every response it produces is an [ErrorResponse].
 *
 * Extends [ResponseEntityExceptionHandler] so that every exception Spring MVC raises itself —
 * malformed JSON, a bad path variable, a missing parameter, an unmapped route, a wrong method or
 * media type, an oversized upload — keeps its proper 4xx status. Before this, the catch-all below
 * claimed all of them and answered 500. [handleExceptionInternal] is the one funnel those all pass
 * through, so it is the only place they need converting.
 *
 * Do not add an `@ExceptionHandler` for an exception [ResponseEntityExceptionHandler] already
 * declares (e.g. [MethodArgumentNotValidException]): Spring refuses to start with two handlers
 * for the same type. Handle it in [describe] instead.
 *
 * Deliberately depends on no domain package: every client-facing domain exception extends
 * [ApiException] and carries its own status and code, so new domains plug in without touching
 * this file.
 */
@RestControllerAdvice
class GlobalExceptionHandler(
    @Value("\${spring.servlet.multipart.max-file-size}")
    private val maxUploadSize: DataSize
) : ResponseEntityExceptionHandler() {

    private val log = logger()

    /** Handles every client-facing domain exception via its declared status and code. */
    @ExceptionHandler(ApiException::class)
    fun handleApiException(ex: ApiException, request: HttpServletRequest): ResponseEntity<ErrorResponse> =
        respond(ex.status, ex.code, ex.message ?: ex.status.reasonPhrase, request.requestURI)

    /**
     * Handles authorization denials raised by method security (`@PreAuthorize`).
     *
     * Those are thrown inside the controller invocation, so `DispatcherServlet` catches them and
     * offers them here before they can reach `ExceptionTranslationFilter` and
     * `RestAccessDeniedHandler`. Without this method the catch-all below would claim them and
     * return 500 — turning an authorization failure into an apparent server error.
     *
     * `AuthorizationDeniedException`, what Spring Security method security actually throws,
     * extends `AccessDeniedException`, so this covers both. The message is fixed so this and the
     * filter-chain path return identical bodies.
     */
    @ExceptionHandler(AccessDeniedException::class)
    fun handleAccessDenied(ex: AccessDeniedException, request: HttpServletRequest): ResponseEntity<ErrorResponse> =
        respond(HttpStatus.FORBIDDEN, ErrorCode.ACCESS_DENIED, ErrorMessages.ACCESS_DENIED, request.requestURI)

    /** Bean validation on a `@Validated` service or on an entity, outside the MVC binding step. */
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

    /** Last resort: log the real cause, return a masked 500 so internals are not leaked. */
    @ExceptionHandler(Exception::class)
    fun handleGenericException(ex: Exception, request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        log.errorWith("Unhandled exception", ex, "path" to request.requestURI)
        return respond(
            HttpStatus.INTERNAL_SERVER_ERROR, ErrorCode.INTERNAL_ERROR, ErrorMessages.INTERNAL_ERROR, request.requestURI
        )
    }

    /** Renders every exception Spring MVC raises itself. See the class comment. */
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
        // Delegating keeps the parent's bookkeeping: it skips already-committed responses and
        // flags 500s for the error page machinery. Only the body is ours.
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
            // The parser's own message quotes the offending input and internal type names.
            is HttpMessageNotReadableException ->
                Triple(ErrorCode.MALFORMED_REQUEST, "Malformed request body", null)
            // Parameter names are ours and safe to echo; the rejected value is the caller's
            // input and is deliberately not.
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

        /** `5MB` rather than DataSize's `5242880B`, so the message matches what users were told. */
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
