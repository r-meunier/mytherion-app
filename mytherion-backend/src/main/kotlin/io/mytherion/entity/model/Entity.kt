package io.mytherion.entity.model

import io.mytherion.project.model.Project
import jakarta.persistence.*
import java.time.Instant

@jakarta.persistence.Entity
@Table(name = "entities")
class Entity(
        @Id
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "entity_id_seq")
        val id: Long? = null,
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "project_id", nullable = false)
        val project: Project,
        @Column(nullable = false) @Enumerated(EnumType.STRING) var type: EntityType,
        @Column(nullable = false) var name: String,
        @Column(columnDefinition = "text") var summary: String? = null,
        @Column(columnDefinition = "text") var description: String? = null,

        // PostgreSQL array for tags
        @Column(columnDefinition = "text[]") var tags: Array<String>? = null,
        @Column(name = "image_url", columnDefinition = "text") var imageUrl: String? = null,

        // JSONB in DB for type-specific metadata
        @Column(columnDefinition = "jsonb") var metadata: String? = null,
        @Column(name = "created_at", nullable = false) val createdAt: Instant = Instant.now(),
        @Column(name = "updated_at", nullable = false) var updatedAt: Instant = Instant.now(),
        @Column(name = "deleted_at") var deletedAt: Instant? = null
) {
    @PreUpdate
    private fun touchUpdatedAt() {
        updatedAt = Instant.now()
    }

    fun isDeleted(): Boolean = deletedAt != null
}

enum class EntityType {
    CHARACTER,
    ORGANIZATION,
    CULTURE,
    SPECIES,
    LOCATION,
    ITEM
}
