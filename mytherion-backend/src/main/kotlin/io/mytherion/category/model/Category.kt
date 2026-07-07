package io.mytherion.category.model

import io.mytherion.project.model.Project
import jakarta.persistence.*
import io.mytherion.common.model.AbstractAuditableEntity

@Entity
@Table(name = "categories")
class Category(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    val project: Project,

    @Column(nullable = false)
    var name: String,

    @Column(columnDefinition = "text")
    var description: String? = null
) : AbstractAuditableEntity()
