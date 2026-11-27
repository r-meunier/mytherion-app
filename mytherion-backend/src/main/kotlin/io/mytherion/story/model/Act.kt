package io.mytherion.story.model

import io.mytherion.common.model.AbstractAuditableEntity
import io.mytherion.project.model.Project
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.Version
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.SQLRestriction
import org.hibernate.type.SqlTypes
import java.util.UUID

/**
 * The top level of a project's story (docs/story-model.md §3). Acts are created from a
 * [StoryStructure] and are the author's afterwards: renameable, reorderable, with editable beats.
 */
@Entity
@Table(name = "story_acts")
@SQLRestriction("deleted_at IS NULL")
class Act(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    val project: Project,

    /** Order among the project's acts. */
    @Column(nullable = false)
    var position: Int,

    @Column(nullable = false)
    var title: String,

    @Column(columnDefinition = "text")
    var description: String? = null,

    /** The built-in structure this act came from, e.g. "three-act". Provenance only. */
    @Column(name = "structure_id", length = 64)
    var structureId: String? = null,

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    var beats: MutableList<Beat> = mutableListOf(),

    @Version
    @Column(nullable = false)
    var version: Long = 0
) : AbstractAuditableEntity()

/**
 * A planning prompt inside an act ("Inciting incident"). Scenes can be pinned to one by id.
 *
 * @property position where the structure expects this beat, as a fraction of the story (0..1).
 */
data class Beat(
    val id: UUID,
    val name: String,
    val hint: String? = null,
    val position: Double? = null
)
