package io.mytherion.monitoring

import io.mytherion.logging.infoWith
import io.mytherion.logging.warnWith
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component
import org.springframework.web.servlet.HandlerInterceptor
import org.springframework.web.servlet.ModelAndView

/**
 * Performance monitoring interceptor that tracks HTTP request execution time.
 *
 * Automatically logs:
 * - All API request completion with duration
 * - Slow requests (> 1 second) with WARNING level
 * - Request method, path, status code, and query parameters
 *
 * Integrates with existing structured logging infrastructure.
 */
@Component
class PerformanceInterceptor : HandlerInterceptor {
    private val logger = LoggerFactory.getLogger(PerformanceInterceptor::class.java)

    companion object {
        private const val START_TIME_ATTRIBUTE = "requestStartTime"
        private const val SLOW_REQUEST_THRESHOLD_MS = 1000L
    }

    override fun preHandle(
            request: HttpServletRequest,
            response: HttpServletResponse,
            handler: Any
    ): Boolean {
        request.setAttribute(START_TIME_ATTRIBUTE, System.currentTimeMillis())
        return true
    }

    override fun postHandle(
            request: HttpServletRequest,
            response: HttpServletResponse,
            handler: Any,
            modelAndView: ModelAndView?
    ) {
        val startTime = request.getAttribute(START_TIME_ATTRIBUTE) as? Long ?: return
        val duration = System.currentTimeMillis() - startTime

        // Log all API requests with performance data
        logger.infoWith(
                "API Request Completed",
                "method" to request.method,
                "path" to request.requestURI,
                "status" to response.status,
                "duration_ms" to duration,
                "query_params" to (request.queryString ?: "none")
        )

        // Warn on slow requests
        if (duration > SLOW_REQUEST_THRESHOLD_MS) {
            logger.warnWith(
                    "Slow API Request Detected",
                    "method" to request.method,
                    "path" to request.requestURI,
                    "duration_ms" to duration,
                    "threshold_ms" to SLOW_REQUEST_THRESHOLD_MS,
                    "status" to response.status
            )
        }
    }

    override fun afterCompletion(
            request: HttpServletRequest,
            response: HttpServletResponse,
            handler: Any,
            ex: Exception?
    ) {
        // Log exceptions if they occurred
        if (ex != null) {
            val startTime = request.getAttribute(START_TIME_ATTRIBUTE) as? Long
            val duration = startTime?.let { System.currentTimeMillis() - it }

            logger.warnWith(
                    "API Request Failed with Exception",
                    "method" to request.method,
                    "path" to request.requestURI,
                    "duration_ms" to (duration ?: "unknown"),
                    "exception_type" to ex.javaClass.simpleName
            )
        }
    }
}
