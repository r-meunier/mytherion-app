package io.mytherion.entity.dto

import io.mytherion.entity.model.EntityType
import jakarta.validation.constraints.Size

/**
 * Request DTO for updating an existing entity All fields are optional - only provided fields will
 * be updated
 */
data class UpdateEntityRequest(
        val type: EntityType? = null,
        @field:Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
        val name: String? = null,
        @field:Size(max = 1000, message = "Summary must not exceed 1000 characters")
        val summary: String? = null,
        val description: String? = null,
        val tags: List<String>? = null,
        val metadata: String? = null
)
