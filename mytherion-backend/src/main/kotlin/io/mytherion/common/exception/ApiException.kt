package io.mytherion.common.exception

import io.mytherion.common.web.ErrorCode
import org.springframework.http.HttpStatus

/**
 * Base class for exceptions that map to a well-defined, client-facing HTTP response.
 *
 * Each subclass declares the [status] and [code] it should be rendered with, so the global
 * exception handler can translate any of them without knowing the concrete type. Adding a new
 * domain exception therefore requires no change to the handler. It does require registering its
 * [code] in [ErrorCode] when no existing one fits, because that list is the frontend contract.
 *
 * This is deliberately `abstract` rather than `sealed`: a sealed hierarchy would require every
 * subclass to live in this same package, which would pull domain exceptions out of their domains
 * and defeat the domain-first package structure.
 *
 * Only use this for errors the client is meant to see — the message is returned verbatim. Unexpected
 * infrastructure failures should remain plain exceptions so they fall through to the generic
 * handler, which logs them and returns a masked 500 instead of leaking internal detail.
 */
abstract class ApiException(
    val status: HttpStatus,
    val code: ErrorCode,
    message: String,
    cause: Throwable? = null
) : RuntimeException(message, cause)
