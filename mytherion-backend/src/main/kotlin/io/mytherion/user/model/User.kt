package io.mytherion.user.model;

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "users")
class User(

        @Id
        @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_id_seq")
        val id: Long? = null,

        @Column(name = "username")
        val username: String,

        @Column(nullable = false, unique = true)
        val email: String,

        @Column(name = "password_hash", nullable = false)
        val passwordHash: String,

        @Column(nullable = false)
        @Enumerated(EnumType.STRING)
        val role: UserRole = UserRole.USER,

        @Column(name = "created_at", nullable = false)
        val createdAt: Instant = Instant.now()
)

enum class UserRole {
    USER,
    ADMIN
}
