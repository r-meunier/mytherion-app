package io.mytherion.project.model

import io.mytherion.user.model.User
import jakarta.persistence.*
import io.mytherion.common.model.AbstractAuditableEntity
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.SQLRestriction
import org.hibernate.type.SqlTypes

@Entity
@Table(name = "projects")
@SQLRestriction("deleted_at IS NULL")
class Project(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner", nullable = false)
    val owner: User,
    @Column(nullable = false) var name: String,
    @Column(columnDefinition = "text") var description: String? = null,
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    var settings: String? = null,
    var genre: String? = null
) : AbstractAuditableEntity()
