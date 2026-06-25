package io.mytherion.entity.dto

import io.mytherion.entity.model.Entity
import io.mytherion.entity.model.EntityMetadata
import io.mytherion.entity.model.EntityType
import java.time.Instant

/** Response DTO for Entity */
import java.util.UUID

data class EntityDTO(
    val id: UUID,
    val projectId: UUID,
    val type: EntityType,
    val name: String,
    val categoryId: UUID?,
    val description: String?,
    val notes: String?,
    val tags: List<String>?,
    val thumbnail: String?,
    val metadata: EntityMetadata?,
    val version: Long,
    val createdAt: Instant,
    val updatedAt: Instant
) {
    companion object {
        fun from(entity: Entity): EntityDTO {
            return EntityDTO(
                id = requireNotNull(entity.id) { "Entity ID is missing" },
                projectId = requireNotNull(entity.project.id) { "Project ID is missing" },
                type = entity.type,
                name = entity.name,
                categoryId = entity.category?.id,
                description = entity.description,
                notes = entity.notes,
                tags = entity.tags?.toList(),
                thumbnail = entity.thumbnail,
                metadata = entity.metadata,
                version = entity.version,
                createdAt = entity.createdAt,
                updatedAt = entity.updatedAt
            )
        }
    }
}
