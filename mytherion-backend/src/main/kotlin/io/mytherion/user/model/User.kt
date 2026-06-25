package io.mytherion.user.model

import jakarta.persistence.*
import io.mytherion.common.model.AbstractAuditableEntity

@Entity
@Table(name = "users")
class User(
    @Column(nullable = false, unique = true) var email: String,
    @Column(nullable = false, unique = true) var username: String,
    @Column(name = "password_hash", nullable = false) var passwordHash: String,
    @Enumerated(EnumType.STRING) @Column(nullable = false) var role: UserRole = UserRole.USER,
    @Column(name = "email_verified", nullable = false) var emailVerified: Boolean = false
) : AbstractAuditableEntity()

enum class UserRole {
    USER,
    ADMIN
}
