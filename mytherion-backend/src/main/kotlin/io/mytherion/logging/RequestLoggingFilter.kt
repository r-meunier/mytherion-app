package io.mytherion.logging

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import java.util.UUID
import org.slf4j.LoggerFactory
import org.slf4j.MDC
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

/**
 * Request logging filter that adds request context to MDC This allows all logs within a request to
 * be correlated
 */
@Component
class RequestLoggingFilter : OncePerRequestFilter() {

    private val logger = LoggerFactory.getLogger(RequestLoggingFilter::class.java)

    override fun doFilterInternal(
            request: HttpServletRequest,
            response: HttpServletResponse,
            filterChain: FilterChain
    ) {
        val requestId = UUID.randomUUID().toString()
        val startTime = System.currentTimeMillis()

        try {
            // Add request context to MDC
            MDC.put("requestId", requestId)
            MDC.put("method", request.method)
            MDC.put("path", request.requestURI)
            MDC.put("remoteAddr", request.remoteAddr)

            logger.infoWith(
                    "Incoming request",
                    "method" to request.method,
                    "path" to request.requestURI,
                    "queryString" to request.queryString,
                    "userAgent" to request.getHeader("User-Agent")
            )

            filterChain.doFilter(request, response)

            val duration = System.currentTimeMillis() - startTime
            logger.infoWith(
                    "Request completed",
                    "status" to response.status,
                    "duration_ms" to duration
            )
        } catch (e: Exception) {
            val duration = System.currentTimeMillis() - startTime
            logger.errorWith("Request failed", e, "duration_ms" to duration)
            throw e
        } finally {
            // Clean up MDC
            MDC.remove("requestId")
            MDC.remove("method")
            MDC.remove("path")
            MDC.remove("remoteAddr")
        }
    }
}
