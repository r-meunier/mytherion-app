package io.mytherion.user.dto

import io.mytherion.user.model.User
import java.time.Instant

data class UserResponse(
    val id: Long,
    val email: String,
    val username: String,
    val role: String,
    val emailVerified: Boolean,
    val createdAt: Instant
) {
    companion object {
        fun from(user: User) = UserResponse(
            id = user.id!!,
            email = user.email,
            username = user.username,
            role = user.role.name,
            emailVerified = user.emailVerified,
            createdAt = user.createdAt
        )
    }
}
