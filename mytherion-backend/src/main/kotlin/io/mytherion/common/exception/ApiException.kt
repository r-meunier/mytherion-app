package io.mytherion.common.exception

import io.mytherion.common.web.ErrorCode
import org.springframework.http.HttpStatus

/**
 * Base class for errors only the client is meant to see, rendered with their [status], [code] and message.
 * The message is returned verbatim.
 *
 * `abstract`, not `sealed`, so domain exceptions can stay in their own packages.
 */
abstract class ApiException(
    val status: HttpStatus,
    val code: ErrorCode,
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)
