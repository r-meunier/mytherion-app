package io.mytherion.entity.dto

import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityMetadata
import io.mytherion.entity.model.EntityType
import java.time.Instant

/** Response DTO for Entity */
data class EntityDTO(
        val id: Long,
        val projectId: Long,
        val type: EntityType,
        val name: String,
        val category: String?,
        val summary: String?,
        val description: String?,
        val notes: String?,
        val tags: List<String>?,
        val imageUrl: String?,
        val metadata: EntityMetadata?,
        val createdAt: Instant,
        val updatedAt: Instant
) {
    companion object {
        fun from(entity: Entity): EntityDTO {
            return EntityDTO(
                    id = entity.id!!,
                    projectId = entity.project.id!!,
                    type = entity.type,
                    name = entity.name,
                    category = entity.category,
                    summary = entity.summary,
                    description = entity.description,
                    notes = entity.notes,
                    tags = entity.tags?.toList(),
                    imageUrl = entity.imageUrl,
                    metadata = entity.metadata,
                    createdAt = entity.createdAt,
                    updatedAt = entity.updatedAt
            )
        }
    }
}
