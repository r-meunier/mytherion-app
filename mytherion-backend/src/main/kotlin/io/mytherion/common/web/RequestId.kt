package io.mytherion.common.web

import jakarta.servlet.http.HttpServletRequest

/** Per-request correlation id, set by the request logging filter and echoed in error bodies. */
object RequestId {
    const val ATTRIBUTE = "requestId"
    const val HEADER = "X-Request-Id"

    // The attribute, not MDC: MDC is cleared before the container's /error dispatch.
    fun of(request: HttpServletRequest): String? = request.getAttribute(ATTRIBUTE) as? String
}
