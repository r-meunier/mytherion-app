package io.mytherion.entity.dto

import io.mytherion.entity.model.EntityMetadata
import io.mytherion.entity.model.EntityType
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

/** Request DTO for creating a new entity */
data class CreateEntityRequest(
        @field:NotNull(message = "Entity type is required") val type: EntityType,
        @field:NotBlank(message = "Name is required")
        @field:Size(min = 1, max = 255, message = "Name must be between 1 and 255 characters")
        val name: String,
        @field:Size(max = 100, message = "Category must not exceed 100 characters")
        val category: String? = null,
        @field:Size(max = 1000, message = "Summary must not exceed 1000 characters")
        val summary: String? = null,
        val description: String? = null,
        val tags: List<String>? = null,
        val metadata: EntityMetadata? = null
)
