package io.mytherion.story.model

import io.mytherion.common.model.AbstractAuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.Version
import org.hibernate.annotations.SQLRestriction
import java.util.UUID

/**
 * The unit of writing, and later of AI context assembly (docs/story-model.md §5).
 *
 * The Scene Card is not a separate record: summary, goal, POV, characters, location and beat are
 * fields here. POV, location and characters are codex entry ids, not names, so the Context Pack can
 * look the entries up.
 */
@Entity
@Table(name = "story_scenes")
@SQLRestriction("deleted_at IS NULL")
class Scene(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    var chapter: Chapter,

    /** Order among the chapter's scenes. */
    @Column(nullable = false)
    var position: Int,

    var title: String? = null,

    /** The prose, as Markdown. */
    @Column(columnDefinition = "text", nullable = false)
    var content: String = "",

    @Column(name = "word_count", nullable = false)
    var wordCount: Int = 0,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    var status: SceneStatus = SceneStatus.DRAFT,

    @Column(columnDefinition = "text")
    var summary: String? = null,

    @Column(columnDefinition = "text")
    var goal: String? = null,

    @Column(name = "pov_entry_id")
    var povEntryId: UUID? = null,

    @Column(name = "location_entry_id")
    var locationEntryId: UUID? = null,

    @Column(name = "character_ids", columnDefinition = "uuid[]", nullable = false)
    var characterIds: Array<UUID> = emptyArray(),

    /** A beat of the scene's act ([Act.beats]), if the scene delivers one. */
    @Column(name = "beat_id")
    var beatId: UUID? = null,

    @Version
    @Column(nullable = false)
    var version: Long = 0
) : AbstractAuditableEntity()

/** How far along a scene is. Mirrored in types/story.ts; the contract parity check compares them. */
enum class SceneStatus {
    DRAFT,
    REVISED,
    DONE
}
