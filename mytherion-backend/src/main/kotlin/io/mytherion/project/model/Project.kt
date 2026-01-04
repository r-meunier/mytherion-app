package io.mytherion.project.model

import io.mytherion.user.model.User
import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "projects")
class Project(

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "project_id_seq")
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner", nullable = false)
    val owner: User,

    @Column(nullable = false)
    var name: String,

    @Column(columnDefinition = "text")
    var description: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: Instant = Instant.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: Instant = Instant.now()
)