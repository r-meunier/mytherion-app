package io.mytherion.user.dto

import io.mytherion.user.model.User
import java.time.Instant

import java.util.UUID

data class UserResponse(
    val id: UUID,
    val email: String,
    val username: String,
    val role: String,
    val emailVerified: Boolean,
    val createdAt: Instant
) {
    companion object {
        fun from(user: User) = UserResponse(
            id = requireNotNull(user.id) { "User ID is missing" },
            email = user.email,
            username = user.username,
            role = user.role.name,
            emailVerified = user.emailVerified,
            createdAt = user.createdAt
        )
    }
}
