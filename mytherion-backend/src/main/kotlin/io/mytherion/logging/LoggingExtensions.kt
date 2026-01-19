package io.mytherion.logging

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.slf4j.MDC

/** Kotlin extension function to get a logger for any class Usage: private val logger = logger() */
inline fun <reified T> T.logger(): Logger {
    return LoggerFactory.getLogger(T::class.java)
}

/** Get a logger for a specific class Usage: val logger = loggerFor<MyClass>() */
inline fun <reified T> loggerFor(): Logger {
    return LoggerFactory.getLogger(T::class.java)
}

/**
 * Structured logging extensions for SLF4J Logger Provides convenient methods for logging with
 * context
 */

/**
 * Log with structured context Usage: logger.infoWith("User logged in", "userId" to userId,
 * "username" to username)
 */
fun Logger.debugWith(message: String, vararg context: Pair<String, Any?>) {
    if (isDebugEnabled) {
        withContext(*context) { debug(formatMessage(message, *context)) }
    }
}

fun Logger.infoWith(message: String, vararg context: Pair<String, Any?>) {
    if (isInfoEnabled) {
        withContext(*context) { info(formatMessage(message, *context)) }
    }
}

fun Logger.warnWith(message: String, vararg context: Pair<String, Any?>) {
    if (isWarnEnabled) {
        withContext(*context) { warn(formatMessage(message, *context)) }
    }
}

fun Logger.errorWith(
        message: String,
        throwable: Throwable? = null,
        vararg context: Pair<String, Any?>
) {
    if (isErrorEnabled) {
        withContext(*context) {
            if (throwable != null) {
                error(formatMessage(message, *context), throwable)
            } else {
                error(formatMessage(message, *context))
            }
        }
    }
}

/** Execute a block with MDC context */
private inline fun <T> withContext(vararg context: Pair<String, Any?>, block: () -> T): T {
    val previousValues = mutableMapOf<String, String?>()

    try {
        // Set MDC context
        context.forEach { (key, value) ->
            previousValues[key] = MDC.get(key)
            if (value != null) {
                MDC.put(key, value.toString())
            }
        }

        return block()
    } finally {
        // Restore previous MDC context
        context.forEach { (key, _) ->
            val previousValue = previousValues[key]
            if (previousValue != null) {
                MDC.put(key, previousValue)
            } else {
                MDC.remove(key)
            }
        }
    }
}

/** Format message with context for readable logs */
private fun formatMessage(message: String, vararg context: Pair<String, Any?>): String {
    if (context.isEmpty()) return message

    val contextStr = context.joinToString(", ") { (key, value) -> "$key=$value" }
    return "$message | $contextStr"
}

/**
 * Measure execution time and log it Usage: logger.measureTime("Database query") {
 * repository.findAll() }
 */
inline fun <T> Logger.measureTime(
        operation: String,
        level: LogLevel = LogLevel.DEBUG,
        block: () -> T
): T {
    val start = System.currentTimeMillis()
    return try {
        block().also {
            val duration = System.currentTimeMillis() - start
            when (level) {
                LogLevel.DEBUG -> debugWith("$operation completed", "duration_ms" to duration)
                LogLevel.INFO -> infoWith("$operation completed", "duration_ms" to duration)
                LogLevel.WARN -> warnWith("$operation completed", "duration_ms" to duration)
                LogLevel.ERROR -> errorWith("$operation completed", null, "duration_ms" to duration)
            }
        }
    } catch (e: Exception) {
        val duration = System.currentTimeMillis() - start
        errorWith("$operation failed", e, "duration_ms" to duration)
        throw e
    }
}

enum class LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR
}

/** Log entry and exit of a function Usage: logger.traced("processUser") { processUser(userId) } */
inline fun <T> Logger.traced(
        functionName: String,
        vararg context: Pair<String, Any?>,
        block: () -> T
): T {
    debugWith("Entering $functionName", *context)
    return try {
        block().also { debugWith("Exiting $functionName", *context) }
    } catch (e: Exception) {
        errorWith("Exception in $functionName", e, *context)
        throw e
    }
}
