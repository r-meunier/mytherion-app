package io.mytherion.user.model

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "users")
class User(
        @Id
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_id_seq")
        var id: Long? = null,
        @Column(nullable = false, unique = true) var email: String,
        @Column(nullable = false, unique = true) var username: String,
        @Column(name = "password_hash", nullable = false) var passwordHash: String,
        @Enumerated(EnumType.STRING) @Column(nullable = false) var role: UserRole = UserRole.USER,
        @Column(name = "created_at", nullable = false) val createdAt: Instant = Instant.now(),
        @Column(name = "deleted_at") var deletedAt: Instant? = null
) {
    fun isDeleted(): Boolean = deletedAt != null
}

enum class UserRole {
    USER,
    ADMIN
}
