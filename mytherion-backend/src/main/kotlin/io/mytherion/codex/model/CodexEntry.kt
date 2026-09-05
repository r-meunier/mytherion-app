package io.mytherion.codex.model

import io.mytherion.codex.model.sections.EntrySection
import io.mytherion.project.model.Project
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.SQLRestriction
import org.hibernate.type.SqlTypes
import io.mytherion.common.model.AbstractAuditableEntity

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

/** Root object for entry content stored in JSONB. */
@JsonIgnoreProperties(ignoreUnknown = true)
data class EntryContent(val sections: MutableList<EntrySection> = mutableListOf())

@Entity
@Table(name = "codex_entries")
@SQLRestriction("deleted_at IS NULL")
class CodexEntry(
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
  var type: EntryType,

  // PostgreSQL array for tags
  @Column(columnDefinition = "text[]")
  var tags: Array<String>? = null,

  @Column(name = "thumbnail", columnDefinition = "text")
  var thumbnail: String? = null,

  // JSONB in DB for type-specific content (ECS-lite)
  @JdbcTypeCode(SqlTypes.JSON)
  @Column(columnDefinition = "jsonb")
  var content: EntryContent? = null,

  @Version
  @Column(nullable = false)
  var version: Long = 0
) : AbstractAuditableEntity()

enum class EntryType {
  CHARACTER,
  ORGANIZATION,
  CULTURE,
  SPECIES,
  LOCATION,
  ITEM,
  CUSTOM
}
