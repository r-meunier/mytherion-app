package io.mytherion.entity.dto

import io.mytherion.entity.model.EntityType

/** Request DTO for searching/filtering entities */
data class EntitySearchRequest(
        val type: EntityType? = null,
        val tags: List<String>? = null,
        val search: String? = null, // Search in name, summary, description
        val page: Int = 0,
        val size: Int = 20
)
