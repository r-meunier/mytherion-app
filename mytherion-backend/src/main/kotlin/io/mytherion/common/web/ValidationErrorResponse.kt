package io.mytherion.common.web

import java.time.Instant

/** Validation error response with field-specific errors */
data class ValidationErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val errors: Map<String, String>,
    val timestamp: Instant
)
