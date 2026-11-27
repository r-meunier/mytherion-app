package io.mytherion.story.model

import io.mytherion.common.model.AbstractAuditableEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.Version
import org.hibernate.annotations.SQLRestriction

/** An ordered group of scenes inside an act (docs/story-model.md §3). The title is optional. */
@Entity
@Table(name = "story_chapters")
@SQLRestriction("deleted_at IS NULL")
class Chapter(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "act_id", nullable = false)
    var act: Act,

    /** Order among the act's chapters. */
    @Column(nullable = false)
    var position: Int,

    var title: String? = null,

    @Column(columnDefinition = "text")
    var summary: String? = null,

    @Version
    @Column(nullable = false)
    var version: Long = 0
) : AbstractAuditableEntity()
