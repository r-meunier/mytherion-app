package io.mytherion.entity.model

import io.mytherion.category.model.Category
import io.mytherion.entity.model.components.EntityComponent
import io.mytherion.project.model.Project
import jakarta.persistence.*
import java.time.Instant
import org.hibernate.annotations.Filter
import org.hibernate.annotations.FilterDef
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.ParamDef
import org.hibernate.annotations.SQLRestriction
import org.hibernate.type.SqlTypes

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Root object for entity metadata stored in JSONB. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class EntityMetadata(val components: MutableList<EntityComponent> = mutableListOf())

@jakarta.persistence.Entity
@Table(name = "entities")
@SQLRestriction("deleted_at IS NULL")
@FilterDef(name = "projectScope", parameters = [ParamDef(name = "projectId", type = Long::class)])
@Filter(name = "projectScope", condition = "project_id = :projectId")
class Entity(
  @Id
  @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "entity_id_seq")
  val id: Long? = null,

  // Project it belongs to
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  val project: Project,

  @Column(nullable = false)
  var name: String,

  @Column(columnDefinition = "text")
  var description: String? = null,

  @Column(columnDefinition = "text")
  var notes: String? = null,

  // Filterable, searchable data
  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  var type: EntityType,

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  var category: Category? = null,

  // PostgreSQL array for tags
  @Column(columnDefinition = "text[]")
  var tags: Array<String>? = null,

  @Column(name = "thumbnail", columnDefinition = "text")
  var thumbnail: String? = null,

  // JSONB in DB for type-specific metadata (ECS-lite)
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  var metadata: EntityMetadata? = null,

  // Timestamps and metadata
  @Column(name = "created_at", nullable = false)
  val createdAt: Instant = Instant.now(),

  @Column(name = "updated_at", nullable = false)
  var updatedAt: Instant = Instant.now(),

  @Column(name = "deleted_at")
  var deletedAt: Instant? = null,
  
  @Version
  @Column(nullable = false)
  var version: Long = 0
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
  ITEM,
  CUSTOM
}
