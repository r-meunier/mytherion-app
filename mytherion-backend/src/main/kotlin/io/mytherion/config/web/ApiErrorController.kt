package io.mytherion.config.web

import io.mytherion.common.web.ErrorResponse
import io.mytherion.platform.logging.errorWith
import io.mytherion.platform.logging.logger
import jakarta.servlet.RequestDispatcher
import jakarta.servlet.http.HttpServletRequest
import org.springframework.boot.webmvc.error.ErrorController
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/**
 * Renders the container's `/error` dispatch as [ErrorResponse], replacing Spring Boot's default
 * body. It catches what never reaches `GlobalExceptionHandler`: requests rejected by Spring
 * Security's firewall and exceptions thrown inside servlet filters.
 */
@RestController
class ApiErrorController : ErrorController {

    private val log = logger()

    @RequestMapping("\${server.error.path:/error}")
    fun error(request: HttpServletRequest): ResponseEntity<ErrorResponse> {
        // No status attribute means a client asked for /error directly.
        val status = (request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE) as? Int)
            ?.let(HttpStatusCode::valueOf) ?: HttpStatus.NOT_FOUND
        val path = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI) as? String ?: request.requestURI
        if (status.is5xxServerError) {
            val cause = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION) as? Throwable
            log.errorWith("Error dispatch", cause, "path" to path)
        }
        val (code, message) = ErrorResponse.generic(status)
        return ErrorResponse.of(status, code, message, path).toEntity()
    }
}
