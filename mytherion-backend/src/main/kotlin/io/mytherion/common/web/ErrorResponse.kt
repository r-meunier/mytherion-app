package io.mytherion.common.web

import java.time.Instant

/** Standard error response */
data class ErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val timestamp: Instant
)
